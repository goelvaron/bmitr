import { corsHeaders } from "@shared/cors.ts";

console.log("📧 [SEND EMAIL] Edge function starting up...");
console.log("📧 [SEND EMAIL] Environment check:", {
  hasResendKey: !!Deno.env.get("RESEND_API_KEY"),
  resendKeyPrefix: Deno.env.get("RESEND_API_KEY")?.substring(0, 8) || "missing",
});

Deno.serve(async (req) => {
  console.log(`📧 [SEND EMAIL] Received ${req.method} request to ${req.url}`);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  // Handle GET requests for health check
  if (req.method === "GET") {
    return new Response(
      JSON.stringify({
        success: true,
        message: "Send email function is running",
        timestamp: new Date().toISOString(),
        hasResendKey: !!Deno.env.get("RESEND_API_KEY"),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }

  // Only handle POST requests for sending emails
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("📧 [SEND EMAIL] RESEND_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody;
    try {
      requestBody = await req.json();
      console.log("📧 [SEND EMAIL] Request body parsed:", {
        hasTo: !!requestBody.to,
        hasSubject: !!requestBody.subject,
        hasMessage: !!requestBody.message,
      });
    } catch (parseError) {
      console.error(
        "📧 [SEND EMAIL] Failed to parse request body:",
        parseError,
      );
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { to, subject, message } = requestBody;

    if (!to || !subject || !message) {
      console.error("📧 [SEND EMAIL] Missing required fields:", {
        hasTo: !!to,
        hasSubject: !!subject,
        hasMessage: !!message,
      });
      return new Response(
        JSON.stringify({
          error: "Missing required fields: to, subject, and message",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const emailData = {
      from: "onboarding@resend.dev",
      to: [to],
      subject: subject,
      text: message,
    };

    console.log("📧 [SEND EMAIL] Sending email via Resend API:", {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      hasText: !!emailData.text,
    });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const resendResult = await resendResponse.json();

    console.log("📧 [SEND EMAIL] Resend API response:", {
      status: resendResponse.status,
      ok: resendResponse.ok,
      result: resendResult,
    });

    if (!resendResponse.ok) {
      console.error("📧 [SEND EMAIL] Resend API error:", resendResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to send email",
          details: resendResult,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("📧 [SEND EMAIL] Email sent successfully:", resendResult.id);
    return new Response(
      JSON.stringify({
        success: true,
        messageId: resendResult.id,
        message: "Email sent successfully",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("📧 [SEND EMAIL] Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
