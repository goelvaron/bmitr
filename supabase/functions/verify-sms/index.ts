import { corsHeaders } from "@shared/cors.ts";
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    console.log("🔐 [MTALKZ-VERIFY] Request method:", req.method);
    console.log(
      "🔐 [MTALKZ-VERIFY] Request headers:",
      Object.fromEntries(req.headers.entries()),
    );
    // Only accept POST requests
    if (req.method !== "POST") {
      console.error("🔐 [MTALKZ-VERIFY] Invalid method:", req.method);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Method not allowed. Use POST.",
        }),
        {
          status: 405,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
    let requestBody = {};
    // Check if request has a body
    const contentType = req.headers.get("content-type");
    console.log("🔐 [MTALKZ-VERIFY] Content-Type:", contentType);
    if (contentType && contentType.includes("application/json")) {
      try {
        const bodyText = await req.text();
        console.log("🔐 [MTALKZ-VERIFY] Raw request body:", bodyText);
        if (bodyText.trim()) {
          requestBody = JSON.parse(bodyText);
          console.log("🔐 [MTALKZ-VERIFY] Parsed request body:", requestBody);
        } else {
          console.log("🔐 [MTALKZ-VERIFY] Empty request body");
          return new Response(
            JSON.stringify({
              success: false,
              message: "Empty request body - Session ID and OTP are required",
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
      } catch (parseError) {
        console.error(
          "🔐 [MTALKZ-VERIFY] Failed to parse request body:",
          parseError,
        );
        return new Response(
          JSON.stringify({
            success: false,
            message: "Invalid JSON in request body",
            debug: {
              parseError: parseError.message,
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
    } else {
      console.log("🔐 [MTALKZ-VERIFY] No JSON content-type");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Content-Type must be application/json",
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
    const { sessionId, otp } = requestBody;
    console.log("🔐 [MTALKZ-VERIFY] Extracted sessionId:", sessionId);
    console.log("🔐 [MTALKZ-VERIFY] Extracted otp:", otp);
    console.log("🔐 [MTALKZ-VERIFY] SessionId type:", typeof sessionId);
    console.log("🔐 [MTALKZ-VERIFY] OTP type:", typeof otp);
    if (
      !sessionId ||
      !otp ||
      typeof sessionId !== "string" ||
      typeof otp !== "string"
    ) {
      console.error(
        "🔐 [MTALKZ-VERIFY] Missing or invalid required fields - sessionId:",
        !!sessionId,
        "(type:",
        typeof sessionId,
        "), otp:",
        !!otp,
        "(type:",
        typeof otp,
        ")",
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Session ID and OTP are required and must be strings",
          debug: {
            sessionIdProvided: !!sessionId,
            sessionIdType: typeof sessionId,
            otpProvided: !!otp,
            otpType: typeof otp,
            requestBody: requestBody,
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
    // Validate sessionId and otp format
    const sessionIdStr = String(sessionId).trim();
    const otpStr = String(otp).trim();
    if (!sessionIdStr || !otpStr) {
      console.error("🔐 [MTALKZ-VERIFY] Empty sessionId or OTP after trimming");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Session ID and OTP cannot be empty",
          debug: {
            sessionIdAfterTrim: sessionIdStr,
            otpAfterTrim: otpStr,
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
    // Validate OTP format - should be 6 digits for MTalkz
    if (!/^\d{6}$/.test(otpStr)) {
      console.error("🔐 [MTALKZ-VERIFY] Invalid OTP format:", otpStr);
      return new Response(
        JSON.stringify({
          success: false,
          message: "OTP must be a 6-digit number",
          debug: {
            providedOtp: otpStr,
            otpLength: otpStr.length,
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
    // For MTalkz, we do simple comparison since we generated the OTP ourselves
    // The sessionId contains the original OTP that was sent
    console.log("🔐 [MTALKZ-VERIFY] Comparing OTPs:");
    console.log("🔐 [MTALKZ-VERIFY] Expected (sessionId):", sessionIdStr);
    console.log("🔐 [MTALKZ-VERIFY] Provided (otp):", otpStr);
    if (sessionIdStr === otpStr) {
      console.log(
        "🔐 [MTALKZ-VERIFY] OTP verified successfully for session:",
        sessionId,
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP verified successfully",
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
      console.error(
        "🔐 [MTALKZ-VERIFY] OTP mismatch - Expected:",
        sessionIdStr,
        "Got:",
        otpStr,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid OTP code. Please try again.",
          debug: {
            expectedLength: sessionIdStr.length,
            providedLength: otpStr.length,
            match: sessionIdStr === otpStr,
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
    console.error(
      "🔐 [MTALKZ-VERIFY] Unexpected error in verify-sms function:",
      error,
    );
    console.error("🔐 [MTALKZ-VERIFY] Error stack:", error.stack);
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
