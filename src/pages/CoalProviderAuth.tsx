import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { requestOtp, verifyOtp } from "@/services/authService";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CoalProviderRegistrationForm from "@/components/CoalProviderRegistrationForm";
import { CoalProviderFormValues } from "@/lib/coalProviderSchemas";

// Form schema for phone input
const phoneFormSchema = z.object({
  countryCode: z.string().default("+91"),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .refine((val) => /^[0-9]{10,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
});

// Form schema for OTP verification
const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .refine((val) => /^[0-9]{6}$/.test(val), {
      message: "OTP must contain only digits",
    }),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;
type OtpFormValues = z.infer<typeof otpFormSchema>;

const CoalProviderAuth: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp" | "register" | "success">(
    "phone",
  );
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [coalProviderId, setCoalProviderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [countryCode, setCountryCode] = useState<string>("+91");

  // Form for phone input
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      countryCode: "+91",
      phone: "",
    },
  });

  // Watch country code to update state
  const watchCountryCode = phoneForm.watch("countryCode");

  // Update country code state when form value changes
  useEffect(() => {
    setCountryCode(watchCountryCode);
  }, [watchCountryCode]);

  // Form for OTP verification
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Effect for OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle phone form submission
  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Format phone number with selected country code
      const formattedPhone = `${data.countryCode}${data.phone}`;

      // Request OTP
      const result = await requestOtp(formattedPhone);

      if (result.success) {
        setPhone(formattedPhone);
        setSuccessMessage(`OTP sent successfully to your phone`);
        setStep("otp");
        setCountdown(30); // Start 30 second countdown for resend

        // For development only
        if (result.otpCode) {
          setDevOtpCode(result.otpCode);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await requestOtp(phone);

      if (result.success) {
        setSuccessMessage("OTP resent successfully");
        setCountdown(30); // Reset countdown

        // For development only
        if (result.otpCode) {
          setDevOtpCode(result.otpCode);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP form submission
  const onOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Verify OTP
      const result = await verifyOtp(phone, data.otp);

      if (result.success) {
        // Always check the coal_providers table for the current phone number
        try {
          console.log(
            "🔍 [COAL AUTH] Checking coal_providers table for phone:",
            phone,
          );
          console.log("🔍 [COAL AUTH] Timestamp:", new Date().toISOString());

          // First test basic connection
          console.log(
            "🔗 [COAL AUTH] Testing basic connection to coal_providers table...",
          );
          const { data: testData, error: testError } = await supabase
            .from("coal_providers")
            .select("id")
            .limit(1);

          if (testError) {
            console.error(
              "❌ [COAL AUTH] Basic connection test failed:",
              testError,
            );
            console.error("❌ [COAL AUTH] Connection error details:", {
              code: testError.code,
              message: testError.message,
              details: testError.details,
              hint: testError.hint,
            });
            setError(
              "Database connection error. Please check your internet connection and try again.",
            );
            return;
          }

          console.log("✅ [COAL AUTH] Basic connection test passed");

          const { data: coalProviderDataArray, error: coalProviderError } =
            await supabase
              .from("coal_providers")
              .select("*")
              .eq("phone", phone)
              .order("created_at", { ascending: false });

          if (coalProviderError) {
            console.error(
              "❌ [COAL AUTH] Error checking coal provider data:",
              coalProviderError,
            );
            console.error("❌ [COAL AUTH] Error details:", {
              message: coalProviderError.message,
              details: coalProviderError.details,
              hint: coalProviderError.hint,
              code: coalProviderError.code,
            });
            setError("Database query error. Please try again.");
            return;
          }

          console.log(
            "📊 [COAL AUTH] Coal providers found:",
            coalProviderDataArray?.length || 0,
          );
          console.log(
            "📋 [COAL AUTH] Coal provider data:",
            coalProviderDataArray,
          );

          // Check if multiple coal providers exist with same phone number
          if (coalProviderDataArray && coalProviderDataArray.length > 1) {
            console.error(
              "⚠️ [COAL AUTH] Multiple coal providers found with same phone number:",
              phone,
              "Count:",
              coalProviderDataArray.length,
            );
            setError("Coal Provider with same phone number exists");
            setIsLoading(false);
            return;
          }

          // Get the coal provider record if it exists
          const coalProviderData =
            coalProviderDataArray && coalProviderDataArray.length > 0
              ? coalProviderDataArray[0]
              : null;

          console.log(
            "👤 [COAL AUTH] Selected coal provider data:",
            coalProviderData,
          );

          if (coalProviderData) {
            if (authMode === "signin") {
              // Coal provider found, proceed to dashboard
              console.log(
                "Found coal provider data for phone",
                phone,
                ":",
                coalProviderData,
              );

              // Store the correct coal provider ID in localStorage
              setCoalProviderId(coalProviderData.id);
              localStorage.setItem("coalProviderId", coalProviderData.id);
              setSuccessMessage("Login successful! Welcome back.");
              setStep("success");

              // Redirect to dashboard after a short delay
              setTimeout(() => {
                navigate("/coal-provider-dashboard", { replace: true });
              }, 1500);
            } else {
              // For registration mode, but coal provider already exists
              setError("Coal Provider with same phone number exists");
              setIsLoading(false);
              return;
            }
          } else if (authMode === "signin") {
            // No coal provider record found for signin
            setError(
              "No coal provider account found with this phone number. Please register first.",
            );
            setAuthMode("register");
            setStep("register");
            setIsLoading(false);
            return;
          } else {
            // For registration flow, proceed to registration form
            setStep("register");
          }
        } catch (checkError) {
          console.error("Error during coal provider check:", checkError);
          setError("Failed to check registration status. Please try again.");
          setIsLoading(false);
          return;
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration success
  const handleRegistrationSuccess = (coalProviderId: string) => {
    setCoalProviderId(coalProviderId);
    localStorage.setItem("coalProviderId", coalProviderId);
    setSuccessMessage("Registration successful!");
    setStep("success");

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate("/coal-provider-dashboard");
    }, 1500);
  };

  // Handle coal provider registration form submission
  const handleCoalProviderRegistration = async (
    data: CoalProviderFormValues,
  ) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Format the data for registration
      const registrationData = {
        name: data.name,
        email: data.email,
        phone: data.country_code + data.phone,
        company_name: data.company_name,
        country: data.country || "India",
        state: data.state,
        district: data.district,
        city: data.city,
        pincode: data.pincode,
        fuel_types: Array.isArray(data.fuel_types)
          ? data.fuel_types
          : data.fuel_types
            ? [data.fuel_types]
            : ["Coal"], // Default to Coal if no fuel types specified
        supply_capacity: data.supply_capacity || null,
        additional_info: data.additional_info || null,
        biz_gst: data.biz_gst || null,
        pan_no: data.pan_no || null,
        exim_code: data.exim_code || null,
      };

      console.log("Registering coal provider with data:", registrationData);

      // Create coal provider record in coal_providers table
      const { data: coalProvider, error: coalProviderError } = await supabase
        .from("coal_providers")
        .insert(registrationData)
        .select()
        .single();

      if (coalProviderError) {
        console.error("Error creating coal provider:", coalProviderError);
        throw coalProviderError;
      }

      if (!coalProvider) {
        throw new Error("Failed to create coal provider record");
      }

      console.log("Coal provider created successfully:", coalProvider);

      // Store coal provider ID in localStorage
      localStorage.setItem("coalProviderId", coalProvider.id);

      // Call success handler with the new coal provider ID
      handleRegistrationSuccess(coalProvider.id);
    } catch (err: any) {
      console.error("Error during registration:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
        page="coal-provider-auth"
      />

      <main className="flex-grow bg-redFiredMustard-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-redFiredMustard-800 mb-8">
            Coal/Fuel Provider Portal - Authentication
          </h1>

          {step === "phone" && (
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-redFiredMustard-100">
                  <CardTitle className="text-xl text-redFiredMustard-800">
                    {authMode === "signin"
                      ? "Coal Provider Sign In"
                      : "Coal Provider Registration"}
                  </CardTitle>
                  <CardDescription>
                    {authMode === "signin"
                      ? "Enter your phone number to continue"
                      : "Enter your phone number to register"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                      {successMessage}
                    </div>
                  )}

                  {/* Development-only OTP display */}
                  {devOtpCode &&
                    import.meta.env.DEV &&
                    devOtpCode.length === 6 &&
                    /^[0-9]{6}$/.test(devOtpCode) && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
                        Development OTP: <strong>{devOtpCode}</strong>
                      </div>
                    )}

                  <Tabs
                    defaultValue={authMode}
                    onValueChange={(value) =>
                      setAuthMode(value as "signin" | "register")
                    }
                    className="mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Form {...phoneForm}>
                    <form
                      onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                      className="space-y-4"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={phoneForm.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country Code</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select country code" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="+91">
                                    India (+91)
                                  </SelectItem>
                                  <SelectItem value="+977">
                                    Nepal (+977)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={phoneForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormDescription>
                                We'll send a one-time password to this number
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending OTP...
                          </>
                        ) : (
                          <>
                            {authMode === "signin" ? "Sign In" : "Register"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}

          {step === "otp" && (
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-redFiredMustard-100">
                  <CardTitle className="text-xl text-redFiredMustard-800">
                    Verify OTP
                  </CardTitle>
                  <CardDescription>
                    Enter the 6-digit code sent to your phone
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                      {successMessage}
                    </div>
                  )}

                  {/* Development-only OTP display */}
                  {devOtpCode &&
                    import.meta.env.DEV &&
                    devOtpCode.length === 6 &&
                    /^[0-9]{6}$/.test(devOtpCode) && (
                      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-md">
                        Development OTP: <strong>{devOtpCode}</strong>
                      </div>
                    )}

                  <Form {...otpForm}>
                    <form
                      onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        control={otpForm.control}
                        name="otp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>One-Time Password</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="6-digit code"
                                {...field}
                                maxLength={6}
                              />
                            </FormControl>
                            <FormDescription>
                              Enter the 6-digit code sent to {phone}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep("phone")}
                            disabled={isLoading}
                          >
                            Back
                          </Button>

                          <Button
                            type="submit"
                            className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Verify OTP"
                            )}
                          </Button>
                        </div>

                        <div className="text-center">
                          <button
                            type="button"
                            className={`text-sm ${countdown > 0 ? "text-gray-400" : "text-redFiredMustard-600 hover:text-redFiredMustard-700"}`}
                            onClick={handleResendOtp}
                            disabled={countdown > 0 || isLoading}
                          >
                            {countdown > 0
                              ? `Resend OTP in ${countdown}s`
                              : "Resend OTP"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}

          {step === "register" && (
            <div className="max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-redFiredMustard-100">
                  <CardTitle className="text-xl text-redFiredMustard-800">
                    Complete Registration
                  </CardTitle>
                  <CardDescription>
                    Complete your coal/fuel provider profile
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                      {error}
                    </div>
                  )}

                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                      {successMessage}
                    </div>
                  )}

                  <CoalProviderRegistrationForm
                    onSubmit={handleCoalProviderRegistration}
                    isLoading={isLoading}
                    countryCode={countryCode}
                    prefillData={{
                      phone: phone.replace(countryCode, ""),
                    }}
                  />
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}

          {step === "success" && (
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-redFiredMustard-100">
                  <CardTitle className="text-xl text-redFiredMustard-800">
                    Authentication Successful
                  </CardTitle>
                  <CardDescription>
                    You have successfully authenticated
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="text-center py-4">
                    <div className="mx-auto h-16 w-16 text-green-500 mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-green-700 mb-2">
                      Success!
                    </h3>
                    <p className="mb-6">
                      {successMessage || "You have successfully authenticated."}
                    </p>
                    <p className="text-sm text-gray-500">
                      Redirecting to dashboard...
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    By continuing, you agree to our Terms of Service and Privacy
                    Policy
                  </p>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
      />
    </div>
  );
};

export default CoalProviderAuth;
