import { corsHeaders } from "@shared/cors.ts";
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    console.log("📱 [MTALKZ-SMS] Request method:", req.method);
    console.log(
      "📱 [MTALKZ-SMS] Request headers:",
      Object.fromEntries(req.headers.entries()),
    );
    let requestBody = {};
    // Check if request has a body
    const contentType = req.headers.get("content-type");
    console.log("📱 [MTALKZ-SMS] Content-Type:", contentType);
    if (contentType && contentType.includes("application/json")) {
      try {
        const bodyText = await req.text();
        console.log("📱 [MTALKZ-SMS] Raw request body:", bodyText);
        if (bodyText.trim()) {
          requestBody = JSON.parse(bodyText);
          console.log("📱 [MTALKZ-SMS] Parsed request body:", requestBody);
        } else {
          console.log("📱 [MTALKZ-SMS] Empty request body, using defaults");
        }
      } catch (parseError) {
        console.error(
          "📱 [MTALKZ-SMS] Failed to parse request body:",
          parseError,
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid JSON in request body",
          }),
          {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }
    } else {
      console.log("📱 [MTALKZ-SMS] No JSON content-type, using defaults");
    }
    const { phone, templateName } = requestBody;
    const finalTemplateName = templateName || "Login OTP BHMITRA"; // Use provided template or fallback
    const senderId = "BMITR";
    console.log("📱 [MTALKZ-SMS] Extracted phone:", phone);
    console.log("📱 [MTALKZ-SMS] Using templateName:", finalTemplateName);
    console.log("📱 [MTALKZ-SMS] Using senderId:", senderId);
    if (!phone) {
      console.error(
        "📱 [MTALKZ-SMS] Missing required fields - phone:",
        !!phone,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Phone number is required",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Get MTalkz API key from environment
    console.log(
      "📱 [MTALKZ-SMS] Checking for MTALKZ_API_KEY environment variable...",
    );
    const mtalkzApiKey = Deno.env.get("MTALKZ_API_KEY");
    console.log("📱 [MTALKZ-SMS] MTALKZ_API_KEY exists:", !!mtalkzApiKey);
    if (!mtalkzApiKey) {
      console.error("📱 [MTALKZ-SMS] MTALKZ_API_KEY not found in environment");
      return new Response(
        JSON.stringify({
          success: false,
          message: "OTP service not configured - MTALKZ_API_KEY missing",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("📱 [MTALKZ-SMS] Generated OTP:", otp);
    // Format phone number for MTalkz API (remove + sign)
    const formattedPhone = phone.startsWith("+") ? phone.substring(1) : phone;
    console.log("📱 [MTALKZ-SMS] Original phone:", phone);
    console.log("📱 [MTALKZ-SMS] Formatted phone:", formattedPhone);
    // Prepare message with OTP
    const message = `Dear User, Your Bhatta Mitra's OTP is : ${otp}. This code will expire in 5 minutes. Do not share this code with anyone. - Team Savitur Intelligence Pvt Ltd `;
    console.log("📱 [MTALKZ-SMS] Message:", message);
    // Call MTalkz API - Using GET request with query parameters as per documentation
    const baseUrl = "https://msgn.mtalkz.com/api";
    const queryParams = new URLSearchParams({
      apikey: mtalkzApiKey,
      senderid: senderId,
      message: message,
      number: formattedPhone,
      format: "json",
    });
    const apiUrl = `${baseUrl}?${queryParams.toString()}`;
    console.log("📱 [MTALKZ-SMS] Calling MTalkz API:", baseUrl);
    console.log("📱 [MTALKZ-SMS] Query params (API key redacted):", {
      apikey: "[REDACTED]",
      senderid: senderId,
      message: message,
      number: formattedPhone,
      format: "json",
    });
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "📱 [MTALKZ-SMS] MTalkz API request failed:",
        response.status,
        response.statusText,
        errorText,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to send OTP",
          debug: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          },
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
    let result;
    try {
      result = await response.json();
      console.log("📱 [MTALKZ-SMS] MTalkz API response:", result);
    } catch (jsonError) {
      console.error(
        "📱 [MTALKZ-SMS] Failed to parse MTalkz API response as JSON:",
        jsonError,
      );
      const responseText = await response.text();
      console.error("📱 [MTALKZ-SMS] Raw response:", responseText);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid response from OTP service",
          debug: {
            rawResponse: responseText,
            parseError: jsonError.message,
          },
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
    // Check MTalkz response format
    if (
      result.status === "OK" ||
      result.status === "success" ||
      result.success === true
    ) {
      console.log(
        "📱 [MTALKZ-SMS] OTP sent successfully, message ID:",
        result.msgid || result.message_id || result.data?.message_id,
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP sent successfully",
          sessionId: otp,
          messageId:
            result.msgid || result.message_id || result.data?.message_id,
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    } else {
      console.error("📱 [MTALKZ-SMS] MTalkz API returned error:", result);
      return new Response(
        JSON.stringify({
          success: false,
          message:
            result.message ||
            result.error ||
            result.desc ||
            "Failed to send OTP",
          debug: {
            apiResponse: result,
          },
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  } catch (error) {
    console.error("📱 [MTALKZ-SMS] Error in send-sms function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal server error",
        debug: {
          error: error.message,
          stack: error.stack,
        },
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
