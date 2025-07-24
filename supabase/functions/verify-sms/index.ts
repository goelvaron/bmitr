import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔐 [VERIFY-SMS] Request method:", req.method);
    console.log(
      "🔐 [VERIFY-SMS] Request headers:",
      Object.fromEntries(req.headers.entries()),
    );

    // Only accept POST requests
    if (req.method !== "POST") {
      console.error("🔐 [VERIFY-SMS] Invalid method:", req.method);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Method not allowed. Use POST.",
        }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let requestBody = {};

    // Check if request has a body
    const contentType = req.headers.get("content-type");
    console.log("🔐 [VERIFY-SMS] Content-Type:", contentType);

    if (contentType && contentType.includes("application/json")) {
      try {
        const bodyText = await req.text();
        console.log("🔐 [VERIFY-SMS] Raw request body:", bodyText);

        if (bodyText.trim()) {
          requestBody = JSON.parse(bodyText);
          console.log("🔐 [VERIFY-SMS] Parsed request body:", requestBody);
        } else {
          console.log("🔐 [VERIFY-SMS] Empty request body");
          return new Response(
            JSON.stringify({
              success: false,
              message: "Empty request body - Session ID and OTP are required",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
          );
        }
      } catch (parseError) {
        console.error(
          "🔐 [VERIFY-SMS] Failed to parse request body:",
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
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    } else {
      console.log("🔐 [VERIFY-SMS] No JSON content-type");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Content-Type must be application/json",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { sessionId, otp } = requestBody as {
      sessionId?: string;
      otp?: string;
    };
    console.log("🔐 [VERIFY-SMS] Extracted sessionId:", sessionId);
    console.log("🔐 [VERIFY-SMS] Extracted otp:", otp);
    console.log("🔐 [VERIFY-SMS] SessionId type:", typeof sessionId);
    console.log("🔐 [VERIFY-SMS] OTP type:", typeof otp);

    if (
      !sessionId ||
      !otp ||
      typeof sessionId !== "string" ||
      typeof otp !== "string"
    ) {
      console.error(
        "🔐 [VERIFY-SMS] Missing or invalid required fields - sessionId:",
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get 2Factor API key from environment
    console.log(
      "🔐 [VERIFY-SMS] Checking for TWOFACTOR_API_KEY environment variable...",
    );

    const twoFactorApiKey = Deno.env.get("TWOFACTOR_API_KEY");
    console.log("🔐 [VERIFY-SMS] TWOFACTOR_API_KEY exists:", !!twoFactorApiKey);

    if (!twoFactorApiKey) {
      console.error(
        "🔐 [VERIFY-SMS] TWOFACTOR_API_KEY not found in environment",
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "OTP service not configured - TWOFACTOR_API_KEY missing",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate sessionId and otp format before making API call
    const sessionIdStr = String(sessionId).trim();
    const otpStr = String(otp).trim();

    if (!sessionIdStr || !otpStr) {
      console.error("🔐 [VERIFY-SMS] Empty sessionId or OTP after trimming");
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
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate OTP format - should be numeric and typically 4-6 digits
    if (!/^\d{4,8}$/.test(otpStr)) {
      console.error("🔐 [VERIFY-SMS] Invalid OTP format:", otpStr);
      return new Response(
        JSON.stringify({
          success: false,
          message: "OTP must be a 4-8 digit number",
          debug: {
            providedOtp: otpStr,
            otpLength: otpStr.length,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Validate session ID format - should be alphanumeric
    if (!/^[a-zA-Z0-9-_]+$/.test(sessionIdStr)) {
      console.error("🔐 [VERIFY-SMS] Invalid session ID format:", sessionIdStr);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid session ID format",
          debug: {
            providedSessionId: sessionIdStr,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Call 2Factor API to verify OTP using V1 endpoint with GET method
    // Format: https://2factor.in/API/V1/{api_key}/SMS/VERIFY/{session_id}/{otp_input}
    const apiUrl = `https://2factor.in/API/V1/${twoFactorApiKey}/SMS/VERIFY/${sessionIdStr}/${otpStr}`;

    console.log(
      "🔐 [VERIFY-SMS] Calling 2Factor verify API:",
      apiUrl.replace(twoFactorApiKey, "[REDACTED]"),
    );
    console.log("🔐 [VERIFY-SMS] Parameters:", {
      session_id: sessionIdStr,
      otp_input: otpStr,
    });

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "Supabase-Edge-Function/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "🔐 [VERIFY-SMS] 2Factor verify API request failed:",
        response.status,
        response.statusText,
        errorText,
      );
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to verify OTP",
          debug: {
            status: response.status,
            statusText: response.statusText,
            error: errorText,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    let result;
    let responseText = "";
    try {
      responseText = await response.text();
      console.log("🔐 [VERIFY-SMS] 2Factor API raw response:", responseText);

      if (!responseText.trim()) {
        console.error("🔐 [VERIFY-SMS] Empty response from 2Factor API");
        return new Response(
          JSON.stringify({
            success: false,
            message: "Empty response from OTP service",
            debug: {
              httpStatus: response.status,
              httpStatusText: response.statusText,
            },
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      result = JSON.parse(responseText);
      console.log(
        "🔐 [VERIFY-SMS] 2Factor verify API parsed response:",
        result,
      );
    } catch (jsonError) {
      console.error(
        "🔐 [VERIFY-SMS] Failed to parse 2Factor API response as JSON:",
        jsonError,
      );
      console.error("🔐 [VERIFY-SMS] Raw response:", responseText);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid response from OTP service",
          debug: {
            rawResponse: responseText,
            parseError: jsonError.message,
            httpStatus: response.status,
            httpStatusText: response.statusText,
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Handle different response formats from 2Factor API
    // Check for successful verification - 2Factor API returns different formats
    const isSuccess =
      (result.Status === "Success" && result.Details === "OTP Matched") ||
      (result.Status === "Success" && result.Details === "OTP matched") ||
      (result.status === "Success" && result.details === "OTP Matched") ||
      (result.status === "Success" && result.details === "OTP matched") ||
      result.success === true;

    if (isSuccess) {
      console.log(
        "🔐 [VERIFY-SMS] OTP verified successfully for session:",
        sessionId,
      );
      return new Response(
        JSON.stringify({
          success: true,
          message: "OTP verified successfully",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } else {
      console.error("🔐 [VERIFY-SMS] 2Factor API returned error:", result);

      // Handle specific error cases - check both uppercase and lowercase
      let message = "Invalid OTP code. Please try again.";
      let statusCode = 400;

      const details = result.Details || result.details || "";
      const status = result.Status || result.status || "";

      if (details) {
        switch (details.toLowerCase()) {
          case "otp expired":
            message = "OTP has expired. Please request a new one.";
            break;
          case "otp mismatch":
            message = "Invalid OTP code. Please try again.";
            break;
          case "invalid session":
            message = "Invalid session. Please request a new OTP.";
            break;
          case "incorrect api syntax":
            message = "API configuration error. Please contact support.";
            statusCode = 500;
            break;
          case "session does not exist":
            message = "Session expired or invalid. Please request a new OTP.";
            break;
          default:
            message = `Verification failed: ${details}`;
        }
      } else if (status && status.toLowerCase() === "error") {
        message = "OTP verification failed. Please try again.";
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: message,
          debug: {
            apiResponse: result,
            apiStatus: status,
            apiDetails: details,
            rawResponse: responseText,
          },
        }),
        {
          status: statusCode,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error(
      "🔐 [VERIFY-SMS] Unexpected error in verify-sms function:",
      error,
    );
    console.error("🔐 [VERIFY-SMS] Error stack:", error.stack);
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
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
