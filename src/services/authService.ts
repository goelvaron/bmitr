import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

// Define types for OTP and customer auth
export type OtpCode = Database["public"]["Tables"]["otp_codes"]["Row"];
export type CustomerAuth =
  Database["public"]["Tables"]["customers_auth"]["Row"];

/**
 * Request OTP for phone number using 2Factor API via Supabase Edge Function
 * Integrates with 2Factor SMS service for sending OTPs
 */
export const requestOtp = async (
  phone: string,
): Promise<{ success: boolean; message: string; otpCode?: string }> => {
  try {
    console.log("🔍 [2FACTOR OTP] Starting OTP request for phone:", phone);

    // Validate phone number format - be more flexible
    const cleanedPhone = phone.replace(/[\s-]/g, "");
    if (!cleanedPhone.match(/^\+?[1-9][0-9]{9,14}$/)) {
      console.error("🚨 [2FACTOR OTP] Invalid phone format:", phone);
      return {
        success: false,
        message:
          "Invalid phone number format. Please include country code (e.g., +918008009560)",
      };
    }

    console.log("✅ [2FACTOR OTP] Phone number format is valid");

    const templateName = "Login OTP BHMITRA"; // Your registered template name

    console.log("🔍 [2FACTOR OTP] Calling Edge Function...");

    // Call Supabase Edge Function to send OTP
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-send-sms",
      {
        body: {
          phone: cleanedPhone,
          templateName: templateName,
        },
      },
    );

    if (error) {
      console.error("🚨 [2FACTOR OTP] Edge Function error:", error);
      return {
        success: false,
        message: "Failed to send OTP. Please try again.",
      };
    }

    console.log("🔍 [2FACTOR OTP] Edge Function response:", data);

    if (data && data.success) {
      // Store session ID for verification
      const sessionId = data.sessionId;

      // Store session info in database for verification
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      const { error: dbError } = await supabase.from("otp_codes").insert({
        phone,
        code: sessionId, // Store session ID instead of OTP code
        expires_at: expiresAt.toISOString(),
        used: false,
      });

      if (dbError) {
        console.error("🚨 [2FACTOR OTP] Error storing session:", dbError);
        return { success: false, message: "Failed to process OTP request" };
      }

      console.log("✅ [2FACTOR OTP] OTP sent successfully via 2Factor");

      return {
        success: true,
        message: "OTP sent successfully to your phone",
        // For development, you might want to include the session ID
        ...(import.meta.env.DEV && { otpCode: `Session: ${sessionId}` }),
      };
    } else {
      console.error("🚨 [2FACTOR OTP] Edge Function returned error:", data);
      return {
        success: false,
        message: data?.message || "Failed to send OTP",
      };
    }
  } catch (error: any) {
    console.error("🚨 [2FACTOR OTP] Exception in requestOtp:", error);
    return {
      success: false,
      message: `Failed to send OTP: ${error.message || "Unknown error"}`,
    };
  }
};

/**
 * Verify OTP code for phone number using 2Factor API via Supabase Edge Function
 */
export const verifyOtp = async (
  phone: string,
  code: string,
): Promise<{ success: boolean; message: string; customerId?: string }> => {
  try {
    console.log(
      "🔍 [2FACTOR VERIFY] Starting OTP verification for phone:",
      phone,
    );

    // Find the latest unused session for this phone number that hasn't expired
    const { data: otpData, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", phone)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      console.error("🚨 [2FACTOR VERIFY] No valid session found:", otpError);
      return { success: false, message: "Invalid or expired OTP session" };
    }

    const sessionId = otpData.code; // This is actually the session ID from 2Factor
    console.log("🔍 [2FACTOR VERIFY] Found session ID:", sessionId);

    console.log("🔍 [2FACTOR VERIFY] Calling Edge Function...");

    // Call Supabase Edge Function to verify OTP
    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-verify-sms",
      {
        body: {
          sessionId: sessionId,
          otp: code,
        },
      },
    );

    if (error) {
      console.error("🚨 [2FACTOR VERIFY] Edge Function error:", error);
      return {
        success: false,
        message: "Failed to verify OTP. Please try again.",
      };
    }

    console.log("🔍 [2FACTOR VERIFY] Edge Function response:", data);

    if (data && data.success) {
      // Mark OTP session as used
      await supabase
        .from("otp_codes")
        .update({ used: true })
        .eq("id", otpData.id);

      console.log("✅ [2FACTOR VERIFY] OTP verified successfully");

      // Check if user exists
      const { data: authData } = await supabase
        .from("customers_auth")
        .select("*, endcustomers(id)")
        .eq("phone", phone)
        .maybeSingle();

      if (authData) {
        // Update last login time
        await supabase
          .from("customers_auth")
          .update({
            last_login: new Date().toISOString(),
            phone_verified: true,
          })
          .eq("id", authData.id);

        return {
          success: true,
          message: "OTP verified successfully",
          customerId: authData.endcustomer_id as string,
        };
      } else {
        // User doesn't exist yet, they will need to complete registration
        return {
          success: true,
          message: "OTP verified. Please complete registration",
        };
      }
    } else {
      console.error("🚨 [2FACTOR VERIFY] Edge Function returned error:", data);
      return {
        success: false,
        message: data?.message || "Invalid OTP code. Please try again.",
      };
    }
  } catch (error: any) {
    console.error("🚨 [2FACTOR VERIFY] Exception in verifyOtp:", error);
    return { success: false, message: "Failed to verify OTP" };
  }
};

/**
 * Check if email has admin access
 */
export const checkAdminAccess = async (email: string): Promise<boolean> => {
  try {
    // Check against authorized admin email
    const authorizedEmail = "bhattamitra@protonmail.com";

    if (email.toLowerCase() !== authorizedEmail.toLowerCase()) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Admin access check failed:", error);
    return false;
  }
};

/**
 * Send email using Supabase Edge Function
 */
const sendEmailViaEdgeFunction = async (
  to: string,
  subject: string,
  message: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("📧 [EMAIL SERVICE] Sending email via Edge Function");
    console.log("📧 [EMAIL SERVICE] To:", to);
    console.log("📧 [EMAIL SERVICE] Subject:", subject);

    const { data, error } = await supabase.functions.invoke(
      "supabase-functions-send-email",
      {
        body: {
          to,
          subject,
          message,
        },
      },
    );

    console.log("📧 [EMAIL SERVICE] Edge Function response:", { data, error });

    if (error) {
      console.error("📧 [EMAIL SERVICE] Edge Function error:", error);
      return {
        success: false,
        message: `Email service error: ${error.message || "Unknown error"}`,
      };
    }

    if (!data || !data.success) {
      console.error("📧 [EMAIL SERVICE] Edge Function returned failure:", data);
      return {
        success: false,
        message: data?.message || "Email sending failed",
      };
    }

    console.log(
      "✅ [EMAIL SERVICE] Email sent successfully via Edge Function!",
    );
    return {
      success: true,
      message: data.message || "Email sent successfully",
    };
  } catch (error: any) {
    console.error(
      "📧 [EMAIL SERVICE] Exception in Edge Function email:",
      error,
    );
    return {
      success: false,
      message: `Email service error: ${error.message || "Unknown error"}`,
    };
  }
};

/**
 * Request Email OTP for admin authentication
 */
export const requestAdminEmailOtp = async (
  email: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    console.log("📧 [ADMIN EMAIL OTP] Starting email OTP request for:", email);

    // Validate admin email
    if (email.toLowerCase() !== "bhattamitra@protonmail.com") {
      console.error("📧 [ADMIN EMAIL OTP] Unauthorized email:", email);
      return { success: false, message: "Unauthorized email address" };
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("📧 [ADMIN EMAIL OTP] Generated OTP:", otpCode);

    // Set expiration time (5 minutes from now)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);
    console.log(
      "📧 [ADMIN EMAIL OTP] OTP expires at:",
      expiresAt.toISOString(),
    );

    // Store OTP in database with email as identifier
    console.log("📧 [ADMIN EMAIL OTP] Storing OTP in database...");
    const { error } = await supabase.from("otp_codes").insert({
      phone: `email:${email}`, // Use email as identifier with prefix
      code: otpCode,
      expires_at: expiresAt.toISOString(),
      used: false,
    });

    if (error) {
      console.error("📧 [ADMIN EMAIL OTP] Error storing email OTP:", error);
      return { success: false, message: "Failed to generate email OTP" };
    }

    console.log("✅ [ADMIN EMAIL OTP] OTP stored successfully in database");

    // Prepare email content
    const subject = "Bhatta Mitra Admin Access - Verification Code";
    const emailMessage = `Your Bhatta Mitra admin verification code is: ${otpCode}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this code, please ignore this email.\n\nFor security reasons, do not share this code with anyone.\n\n---\nBhatta Mitra Admin Security System`;

    console.log(
      "📧 [ADMIN EMAIL OTP] Attempting to send email via Edge Function...",
    );

    // Send email via Edge Function
    const emailResult = await sendEmailViaEdgeFunction(
      email,
      subject,
      emailMessage,
    );
    console.log("📧 [ADMIN EMAIL OTP] Email result:", emailResult);

    if (emailResult.success) {
      console.log("✅ [ADMIN EMAIL OTP] Email sent successfully!");
      return {
        success: true,
        message: "Admin email OTP sent successfully. Please check your email.",
      };
    } else {
      console.error(
        "📧 [ADMIN EMAIL OTP] Email sending failed:",
        emailResult.message,
      );

      return {
        success: false,
        message: `Failed to send admin email OTP: ${emailResult.message}`,
      };
    }
  } catch (error) {
    console.error(
      "📧 [ADMIN EMAIL OTP] Exception in requestAdminEmailOtp:",
      error,
    );
    return { success: false, message: "Failed to send admin email OTP" };
  }
};

/**
 * Verify Email OTP for admin authentication
 */
export const verifyAdminEmailOtp = async (
  email: string,
  otp: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Find the latest unused OTP for this email that hasn't expired
    const { data: otpData, error: otpError } = await supabase
      .from("otp_codes")
      .select("*")
      .eq("phone", `email:${email}`)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpError || !otpData) {
      return { success: false, message: "Invalid or expired email OTP" };
    }

    // Verify the OTP code
    if (otpData.code !== otp) {
      return { success: false, message: "Invalid email OTP code" };
    }

    // Mark OTP as used
    await supabase
      .from("otp_codes")
      .update({ used: true })
      .eq("id", otpData.id);

    return {
      success: true,
      message: "Email OTP verified successfully",
    };
  } catch (error) {
    console.error("Admin email OTP verification failed:", error);
    return { success: false, message: "Failed to verify admin email OTP" };
  }
};

/**
 * Request Phone OTP for admin authentication using 2Factor
 */
export const requestAdminPhoneOtp = async (
  phone: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate admin phone number
    if (phone !== "+918008009560") {
      return { success: false, message: "Unauthorized phone number" };
    }

    // Use 2Factor OTP service
    const result = await requestOtp(phone);
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("Admin phone OTP request failed:", error);
    return { success: false, message: "Failed to send admin phone OTP" };
  }
};

/**
 * Verify Phone OTP for admin authentication
 */
export const verifyAdminPhoneOtp = async (
  phone: string,
  otp: string,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate admin phone number
    if (phone !== "+918008009560") {
      return { success: false, message: "Unauthorized phone number" };
    }

    // Use existing OTP verification service
    const result = await verifyOtp(phone, otp);
    return {
      success: result.success,
      message: result.message,
    };
  } catch (error) {
    console.error("Admin phone OTP verification failed:", error);
    return { success: false, message: "Failed to verify admin phone OTP" };
  }
};

/**
 * Register a new customer with phone authentication
 */
export const registerCustomer = async (
  customerData: any,
  phone: string,
): Promise<{ success: boolean; message: string; customerId?: string }> => {
  try {
    console.log("Starting registration process for phone:", phone);
    console.log("Customer data received:", customerData);

    // First check if phone already exists
    const { data: existingAuth, error: authCheckError } = await supabase
      .from("customers_auth")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (authCheckError) {
      console.error("Error checking existing auth:", authCheckError);
    }

    if (existingAuth) {
      console.log("Phone already registered:", phone);
      return { success: false, message: "Phone number already registered" };
    }

    // Check if GST number already exists (if provided)
    if (customerData.gst_details) {
      const { data: existingGst, error: gstCheckError } = await supabase
        .from("endcustomers")
        .select("id")
        .eq("gst_details", customerData.gst_details)
        .maybeSingle();

      if (gstCheckError) {
        console.error("Error checking existing GST:", gstCheckError);
      }

      if (existingGst) {
        console.log("GST already registered:", customerData.gst_details);
        return { success: false, message: "GST number already registered" };
      }
    }

    // Prepare customer data with new fields
    const customerRecord = {
      name: customerData.name || "",
      email: customerData.email || "",
      company_name: customerData.company_name || "",
      state: customerData.state || "", // Ensure state is never null
      district: customerData.district || "", // Ensure district is never null
      city: customerData.city || customerData.district || "", // Use district as city if city is not provided
      pin_code: customerData.pin_code || "", // Ensure pin_code is never null or undefined
      country: customerData.country || "India",
      gst_details: customerData.gst_details || null,
      address: customerData.address || "", // Map address field to address column
      phone: phone || "", // Map phone from parent component to phone column
      latitude: customerData.latitude || null, // Add latitude field
      longitude: customerData.longitude || null, // Add longitude field
    };

    console.log("Creating customer with data:", customerRecord);

    // Create customer record
    console.log(
      "About to insert customer with data:",
      JSON.stringify(customerRecord, null, 2),
    );

    try {
      // Special handling for Nepal users
      if (customerRecord.country === "Nepal") {
        console.log("Attempting direct Nepal registration");
        try {
          // Create a record with minimal validation
          const nepalInsertData = {
            name: customerRecord.name || "Nepal Customer",
            email: customerRecord.email || `nepal_${Date.now()}@example.com`,
            company_name: customerRecord.company_name || "",
            country: "Nepal",
            state: customerRecord.state || "",
            district: customerRecord.district || "",
            city: customerRecord.city || "", // Use the actual city field value
            pin_code: customerRecord.pin_code || "00000",
            gst_details: customerRecord.gst_details || null, // Store VAT/PAN in gst_details field
            address: customerRecord.address || "", // Map address to address column
            phone: phone || "", // Map phone from parent component to phone column
            latitude: customerRecord.latitude || null, // Add latitude field
            longitude: customerRecord.longitude || null, // Add longitude field
          };

          console.log(
            "Nepal insert data:",
            JSON.stringify(nepalInsertData, null, 2),
          );

          const { data: nepalCustomer, error: nepalError } = await supabase
            .from("endcustomers")
            .insert(nepalInsertData)
            .select();

          if (nepalError) {
            console.error("Direct Nepal insert error:", nepalError);
            return {
              success: false,
              message: `Nepal registration failed: ${nepalError.message}`,
            };
          }

          if (!nepalCustomer || nepalCustomer.length === 0) {
            console.error("No Nepal customer returned");
            return {
              success: false,
              message: "Nepal registration failed: No customer data returned",
            };
          }

          const customer = nepalCustomer[0];
          console.log("Nepal customer created:", customer);

          // Create auth record
          const { error: authError } = await supabase
            .from("customers_auth")
            .insert({
              phone,
              phone_verified: true,
              endcustomer_id: customer.id,
              last_login: new Date().toISOString(),
            });

          if (authError) {
            console.error("Nepal auth record error:", authError);
            await supabase.from("endcustomers").delete().eq("id", customer.id);
            return {
              success: false,
              message: `Nepal auth record failed: ${authError.message}`,
            };
          }

          return {
            success: true,
            message: "Nepal customer registered successfully",
            customerId: customer.id,
          };
        } catch (nepalError) {
          console.error("Nepal registration exception:", nepalError);
          return {
            success: false,
            message: `Nepal registration exception: ${nepalError.message || "Unknown error"}`,
          };
        }
      } else {
        // Standard approach for other countries
        const { data: customer, error: customerError } = await supabase
          .from("endcustomers")
          .insert(customerRecord)
          .select()
          .single();

        if (customerError) {
          console.error("Customer creation error details:", customerError);
          return {
            success: false,
            message: `Failed to create customer record: ${customerError.message}`,
          };
        }

        if (!customer) {
          console.error("No customer returned after insert");
          return {
            success: false,
            message: "Failed to create customer record: No data returned",
          };
        }

        console.log("Customer created successfully:", customer);

        // Create auth record
        const { error: authError } = await supabase
          .from("customers_auth")
          .insert({
            phone,
            phone_verified: true,
            endcustomer_id: customer.id,
            last_login: new Date().toISOString(),
          });

        if (authError) {
          console.error("Error creating auth record:", authError);
          // Rollback customer creation
          await supabase.from("endcustomers").delete().eq("id", customer.id);
          return {
            success: false,
            message: `Failed to create authentication record: ${authError.message}`,
          };
        }

        console.log(
          "Auth record created successfully for customer ID:",
          customer.id,
        );
        return {
          success: true,
          message: "Customer registered successfully",
          customerId: customer.id,
        };
      }
    } catch (insertError) {
      console.error("Exception during customer insert:", insertError);

      // Special handling for Nepal users on error
      if (customerRecord.country === "Nepal") {
        console.log("Attempting emergency fallback for Nepal registration");
        try {
          // Create a minimal record with just the essential fields
          const { data: emergencyCustomer, error: emergencyError } =
            await supabase
              .from("endcustomers")
              .insert({
                name: customerRecord.name || "Nepal Customer",
                email:
                  customerRecord.email || `nepal_${Date.now()}@example.com`,
                country: "Nepal",
                gst_details: customerRecord.gst_details || null, // Include VAT/PAN in emergency fallback
                address: customerRecord.address || "", // Map address to address column
                phone: phone || "", // Map phone from parent component to phone column
                latitude: customerRecord.latitude || null, // Add latitude field
                longitude: customerRecord.longitude || null, // Add longitude field
              })
              .select()
              .single();

          if (!emergencyError && emergencyCustomer) {
            // Create auth record
            const { error: authError } = await supabase
              .from("customers_auth")
              .insert({
                phone,
                phone_verified: true,
                endcustomer_id: emergencyCustomer.id,
                last_login: new Date().toISOString(),
              });

            if (!authError) {
              return {
                success: true,
                message: "Customer registered successfully (emergency mode)",
                customerId: emergencyCustomer.id,
              };
            }
          }
        } catch (fallbackError) {
          console.error("Emergency fallback failed:", fallbackError);
        }
      }

      return {
        success: false,
        message: `Database error during registration: ${insertError.message || "Unknown error"}`,
      };
    }
  } catch (error) {
    console.error("Exception in registerCustomer:", error);
    return {
      success: false,
      message: `Failed to register customer: ${error.message || "Unknown error"}`,
    };
  }
};
