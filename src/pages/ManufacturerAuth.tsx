import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  requestOtp,
  verifyOtp,
  registerCustomer,
} from "@/services/authService";
import { addManufacturer } from "@/services/manufacturerService";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect as useEffectOriginal } from "react";
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
import ManufacturerRegistrationForm from "@/components/ManufacturerRegistrationForm";
import { ManufacturerFormValues } from "@/lib/schemas";

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

const ManufacturerAuth: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<"phone" | "otp" | "register" | "success">(
    "phone",
  );
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [countryCode, setCountryCode] = useState<string>("+91");

  // Clear any existing manufacturer data when component mounts
  useEffect(() => {
    localStorage.removeItem("manufacturerId");
  }, []);

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
      // Clear any existing manufacturer data from localStorage when starting new auth
      localStorage.removeItem("manufacturerId");

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
      // Clear any existing manufacturer data from localStorage before verification
      localStorage.removeItem("manufacturerId");

      // Verify OTP - we'll need to modify this to check for manufacturer accounts
      const result = await verifyOtp(phone, data.otp);

      if (result.success) {
        // Always check the manufacturers table for the current phone number
        try {
          const { data: manufacturerDataArray, error: manufacturerError } =
            await supabase
              .from("manufacturers")
              .select("*")
              .eq("phone", phone)
              .order("created_at", { ascending: false });

          if (manufacturerError) {
            console.error(
              "Error checking manufacturer data:",
              manufacturerError,
            );
            throw new Error("Failed to check registration status");
          }

          // Check if multiple manufacturers exist with same phone number
          if (manufacturerDataArray && manufacturerDataArray.length > 1) {
            console.error(
              "Multiple manufacturers found with same phone number:",
              phone,
              "Count:",
              manufacturerDataArray.length,
            );
            setError("Manufacture Exists with the Same phone number");
            return;
          }

          // Get the manufacturer record if it exists
          const manufacturerData =
            manufacturerDataArray && manufacturerDataArray.length > 0
              ? manufacturerDataArray[0]
              : null;

          if (manufacturerData) {
            // Manufacturer found, proceed to dashboard
            console.log(
              "Found manufacturer data for phone",
              phone,
              ":",
              manufacturerData,
            );

            // Store the correct manufacturer ID in localStorage
            setManufacturerId(manufacturerData.id);
            localStorage.setItem("manufacturerId", manufacturerData.id);
            setSuccessMessage("Login successful! Welcome back.");
            setStep("success");

            // Redirect to dashboard after a short delay
            setTimeout(() => {
              navigate("/manufacturer-dashboard", { replace: true });
            }, 1500);
          } else if (authMode === "signin") {
            // No manufacturer record found for signin
            setError(
              "No manufacturer account found with this phone number. Please register first.",
            );
            setAuthMode("register");
            setStep("register");
          } else {
            // For registration flow, proceed to registration form
            setStep("register");
          }
        } catch (checkError) {
          console.error("Error during manufacturer check:", checkError);
          setError("Failed to check registration status. Please try again.");
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
  const handleRegistrationSuccess = (customerId: string) => {
    setManufacturerId(customerId);
    localStorage.setItem("manufacturerId", customerId);
    setSuccessMessage("Registration successful!");
    setStep("success");

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate("/manufacturer-dashboard", { replace: true });
    }, 1500);
  };

  // Handle registration error
  const handleRegistrationError = (message: string) => {
    setError(message);
    // If the error is about cancellation, go back to phone input
    if (message === "Registration cancelled") {
      setStep("phone");
    }
  };

  // Handle manufacturer registration form submission
  const handleManufacturerRegistration = async (data: any) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Check if manufacturer already exists with this phone number
      const phoneToCheck = data.country_code + data.phone;
      const { data: existingManufacturers, error: checkError } = await supabase
        .from("manufacturers")
        .select("id, phone")
        .eq("phone", phoneToCheck);

      if (checkError) {
        console.error("Error checking existing manufacturers:", checkError);
        throw new Error("Failed to check existing registrations");
      }

      if (existingManufacturers && existingManufacturers.length > 0) {
        console.error(
          "Manufacturer already exists with phone:",
          phoneToCheck,
          "Count:",
          existingManufacturers.length,
        );
        setError("Manufacture Exists with the Same phone number");
        return;
      }

      // Convert form data to match the Supabase schema
      const manufacturerData = {
        name: data.name,
        email: data.email,
        phone: phone,
        country: data.country,
        category: data.category,
        company_name: data.company_name,
        city: data.city,
        pincode: data.pincode,
        state: data.state,
        district: data.district,
        kiln_type: data.kiln_type,
        additional_info: data.additional_info || "",
        interested_in_exclusive_services: data.interested_in_exclusive_services,
        interested_in_industry_quiz: data.interested_in_industry_quiz,
        country_code: data.country_code,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        // Add country-specific fields
        exim_code: data.country === "Nepal" ? data.exim_code : null,
        pan_no: data.country === "Nepal" ? data.pan_no : null,
        biz_gst: data.country === "India" ? data.biz_gst : null,
      };

      console.log("Submitting manufacturer data:", manufacturerData);

      // Save to Supabase using the service function that ensures waitlist status
      const result = await addManufacturer(manufacturerData);
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
    <div className="flex flex-col min-h-screen">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
        page="manufacturer-auth"
      />

      <main className="flex-grow bg-redFiredMustard-50 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-redFiredMustard-800 mb-8">
            Manufacturer Portal - Authentication
          </h1>

          {step === "phone" && (
            <div className="max-w-md mx-auto">
              <Card className="shadow-lg">
                <CardHeader className="bg-redFiredMustard-100">
                  <CardTitle className="text-xl text-redFiredMustard-800">
                    {authMode === "signin"
                      ? "Manufacturer Sign In"
                      : "Manufacturer Registration"}
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
                        className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
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
                            className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
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
                    Complete your manufacturer profile
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

                  <ManufacturerRegistrationForm
                    onSubmit={handleManufacturerRegistration}
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

export default ManufacturerAuth;
