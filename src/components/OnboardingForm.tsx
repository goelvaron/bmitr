import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Loader2, ArrowRight } from "lucide-react";
import WaitlistConfirmation from "./WaitlistConfirmation";
import { addBrickOwner } from "@/services/customerService";
import { supabase, checkSupabaseConnection } from "@/lib/supabase";
import { requestOtp, verifyOtp } from "@/services/authService";
import {
  brickOwnerSchema,
  phoneFormSchema,
  otpFormSchema,
  type BrickOwnerFormValues,
  type PhoneFormValues,
  type OtpFormValues,
} from "@/lib/schemas";

// Use the imported schema
type FormValues = BrickOwnerFormValues;

interface OnboardingFormProps {
  onSubmit?: (data: FormValues) => void;
}

const OnboardingForm = ({ onSubmit }: OnboardingFormProps = {}) => {
  const { t } = useTranslation();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormValues | null>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  // Phone authentication states
  const [step, setStep] = useState<"phone" | "otp" | "form">("phone");
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);

  // Phone form for OTP authentication
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      countryCode: "+91",
      phone: "",
    },
  });

  // OTP form for verification
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Main onboarding form
  const form = useForm<FormValues>({
    resolver: zodResolver(brickOwnerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "India",
      category: "manufacturer",
      companyName: "",
      city: "",
      pincode: "",
      state: "",
      district: "",
      address_district: "",
      kilnType: "",
      eximCode: "",
      panNo: "",
      bizGst: "",
      additionalInfo: "",
      takeIndustryQuiz: false,
    },
  });

  const watchState = form.watch("state");

  useEffect(() => {
    if (watchState && form.watch("country") === "India") {
      setAvailableDistricts(getDistrictsByState(watchState));
      form.setValue("district", "");
    }
  }, [watchState, form]);

  // Effect for OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Check Supabase connection when component mounts
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus("checking");
      try {
        const isConnected = await checkSupabaseConnection("manufacturers");
        if (!isConnected) {
          console.error("Database connection check failed");
          setConnectionStatus("error");
          return;
        }
        console.log("Database connection verified successfully");
        setConnectionStatus("connected");
      } catch (connError) {
        console.error("Connection check error:", connError);
        setConnectionStatus("error");
      }
    };

    checkConnection();
  }, []);

  // Handle phone form submission for OTP request
  const onPhoneSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formattedPhone = `${data.countryCode}${data.phone}`;
      const result = await requestOtp(formattedPhone);

      if (result.success) {
        setPhone(formattedPhone);
        setSuccessMessage("OTP sent successfully to your phone");
        setStep("otp");
        setCountdown(30);
        // Pre-fill the phone in the main form
        form.setValue("phone", data.phone);
        form.setValue(
          "country",
          data.countryCode === "+977" ? "Nepal" : "India",
        );
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(`Failed to send OTP: ${err.message || "Unknown error"}`);
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
        setCountdown(30);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(`Failed to resend OTP: ${err.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await verifyOtp(phone, data.otp);
      if (result.success) {
        // Check if manufacturer already exists with this phone number BEFORE proceeding to form
        try {
          const { data: existingManufacturers, error: checkError } =
            await supabase
              .from("manufacturers")
              .select("id, phone")
              .eq("phone", phone);

          if (checkError) {
            console.error("Error checking existing manufacturers:", checkError);
            throw new Error("Failed to check existing registrations");
          }

          if (existingManufacturers && existingManufacturers.length > 0) {
            console.error(
              "Manufacturer already exists with phone:",
              phone,
              "Count:",
              existingManufacturers.length,
            );
            setError("Manufacture Exists with the Same phone number");
            return;
          }
        } catch (duplicateError) {
          console.error("Duplicate check error:", duplicateError);
          if (
            duplicateError.message ===
            "Manufacture Exists with the Same phone number"
          ) {
            setError(duplicateError.message);
            return;
          }
          setError("Failed to check existing registrations. Please try again.");
          return;
        }

        setSuccessMessage(
          "Phone verified successfully! Please complete your registration.",
        );
        setStep("form");
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: FormValues) => {
    console.log("Submit button clicked", data);
    console.log("Form submitted:", data);
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      // First verify connection is working
      try {
        const isConnected = await checkSupabaseConnection("manufacturers");
        if (!isConnected) {
          console.error("Database connection check failed");
          throw new Error(
            "Cannot connect to database. Please try again later.",
          );
        }
        console.log("Database connection verified successfully");
      } catch (connError) {
        console.error("Connection check error:", connError);
        throw new Error(
          `Connection error: ${connError.message || "Unknown error"}`,
        );
      }

      // Use the already verified phone number
      const formattedPhone = phone;

      // Check if manufacturer already exists with this phone number
      try {
        const { data: existingManufacturers, error: checkError } =
          await supabase
            .from("manufacturers")
            .select("id, phone")
            .eq("phone", formattedPhone);

        if (checkError) {
          console.error("Error checking existing manufacturers:", checkError);
          throw new Error("Failed to check existing registrations");
        }

        if (existingManufacturers && existingManufacturers.length > 0) {
          console.error(
            "Manufacturer already exists with phone:",
            formattedPhone,
            "Count:",
            existingManufacturers.length,
          );
          throw new Error("Manufacture Exists with the Same phone number");
        }
      } catch (duplicateError) {
        console.error("Duplicate check error:", duplicateError);
        throw duplicateError;
      }

      // Convert form data to match the Supabase schema
      const ownerData = {
        name: data.name,
        email: data.email,
        phone: formattedPhone,
        country: data.country,
        category: data.category,
        company_name: data.companyName,
        city: data.city,
        pincode: data.pincode, // Using pincode as the column name in database
        state: data.state,
        district: data.district,
        kiln_type: data.kilnType,
        additional_info: data.additionalInfo || "",
        interested_in_exclusive_services: data.takeIndustryQuiz,
        joined_date: new Date().toISOString(),
        is_test_entry: false,
        // Add country-specific fields
        exim_code: data.country === "Nepal" ? data.eximCode : null,
        pan_no: data.country === "Nepal" ? data.panNo : null,
        biz_gst: data.country === "India" ? data.bizGst : null,
        // status field is now added via migration with default value 'waitlist'
      };

      console.log("Submitting brick owner data:", ownerData);

      // Save to Supabase
      try {
        console.log("Attempting to save brick owner data to Supabase");
        const result = await addBrickOwner(ownerData);
        console.log("Submission result:", result);

        if (!result) {
          console.error("No result returned from addBrickOwner");
          throw new Error("Failed to save customer data to database");
        }

        console.log("Successfully saved brick owner data with ID:", result.id);
      } catch (dbError) {
        console.error("Database error details:", dbError);
        // Check if it's a duplicate phone number error
        if (
          dbError.message &&
          dbError.message.includes(
            "Manufacture Exists with the Same phone number",
          )
        ) {
          throw dbError;
        }
        if (dbError.message && dbError.message.includes("duplicate")) {
          throw new Error("Manufacture Exists with the Same phone number");
        }
        throw new Error(
          `Database error: ${dbError.message || "Unknown error"}`,
        );
      }

      // No longer storing in localStorage as we've migrated to Supabase

      // Update state to show confirmation first
      setFormData(data);
      setIsSubmitted(true);

      // Then open the quiz link in a new tab after a short delay
      setTimeout(() => {
        window.open("https://varun-fcq8klry.scoreapp.com", "_blank");
      }, 500);

      // Call the onSubmit prop if provided
      if (onSubmit) {
        onSubmit(data);
      }
    } catch (error) {
      console.error("Error submitting form to database:", error);
      // Show detailed error message to help with debugging
      const errorMessage = error.message || "Unknown error";
      console.error("Form submission error:", error);
      setSubmitError(
        `There was an error saving your information to our database: ${errorMessage}. Please try again or contact support.`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted && formData) {
    return (
      <WaitlistConfirmation
        name={formData.name}
        email={formData.email}
        onClose={() => {
          setIsSubmitted(false);
          form.reset();
          setStep("phone");
          setPhone("");
        }}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white rounded-2xl border-8 border-redFiredMustard-600 shadow-lg">
      <CardHeader className="bg-redFiredMustard-50">
        <CardTitle className="text-2xl font-bold text-redFiredMustard-800">
          {step === "phone" && "Phone Verification"}
          {step === "otp" && "Verify OTP"}
          {step === "form" && t("onboarding.form.title")}
        </CardTitle>
        <CardDescription className="text-redFiredMustard-700">
          {step === "phone" &&
            "Enter your phone number to receive verification code"}
          {step === "otp" && "Enter the 6-digit code sent to your phone"}
          {step === "form" && t("onboarding.form.subtitle")}
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

        {step === "phone" && (
          <Form {...phoneForm}>
            <form
              onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
              className="space-y-4"
            >
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
                        <SelectTrigger>
                          <SelectValue placeholder="Select country code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="+91">India (+91)</SelectItem>
                        <SelectItem value="+977">Nepal (+977)</SelectItem>
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
                      <Input
                        {...field}
                        placeholder="Enter your phone number"
                        className="border-0 shadow-none ring-0 focus-visible:ring-0 focus-visible:outline-none"
                      />
                    </FormControl>
                    <FormDescription>
                      We'll send a verification code to this number
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                    Send OTP
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}

        {step === "otp" && (
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
        )}

        {step === "form" && (
          <Form {...form}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const data = form.getValues();
                handleSubmit(data);
              }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.fullName")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("onboarding.form.email")}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("onboarding.form.country")}</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset phone, state and district if country changes
                          form.setValue("phone", "");
                          form.setValue("state", "");
                          form.setValue("district", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("onboarding.form.selectCountry")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="India">India</SelectItem>
                          <SelectItem value="Nepal">Nepal</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("onboarding.form.phoneNumber")}</FormLabel>
                      <FormControl>
                        <div className="flex">
                          <div className="bg-green-100 flex items-center justify-center px-3 border border-r-0 rounded-l-md text-green-700">
                            ✓ Verified
                          </div>
                          <Input
                            className="rounded-l-none bg-green-50"
                            {...field}
                            disabled
                            value={phone}
                          />
                        </div>
                      </FormControl>
                      <FormDescription className="text-green-600">
                        Phone number verified successfully
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.companyName")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.city")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("onboarding.form.enterCity")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.pincode")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("onboarding.form.enterPincode")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.state")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      {form.watch("country") === "Nepal" ? (
                        <FormControl>
                          <Input
                            placeholder={t("onboarding.form.enterState")}
                            {...field}
                          />
                        </FormControl>
                      ) : (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("onboarding.form.selectState")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.keys(indianStatesDistricts).map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("onboarding.form.district")}{" "}
                        <span className="text-red-500">
                          {t("onboarding.form.required")}
                        </span>
                      </FormLabel>
                      {form.watch("country") === "Nepal" ? (
                        <FormControl>
                          <Input
                            placeholder={t("onboarding.form.enterDistrict")}
                            {...field}
                          />
                        </FormControl>
                      ) : (
                        <>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!watchState}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={t(
                                    "onboarding.form.selectDistrict",
                                  )}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {availableDistricts.map((district) => (
                                <SelectItem key={district} value={district}>
                                  {district}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            {!watchState &&
                              t("onboarding.form.selectStateFirst")}
                          </FormDescription>
                        </>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="kilnType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("onboarding.form.kilnType")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("onboarding.form.selectKilnType")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zigzag">
                            {t("onboarding.form.zigzagKiln")}
                          </SelectItem>
                          <SelectItem value="fcbtk">
                            {t("onboarding.form.fcbtk")}
                          </SelectItem>
                          <SelectItem value="hoffman">
                            {t("onboarding.form.hoffmanKiln")}
                          </SelectItem>
                          <SelectItem value="tunnel">
                            {t("onboarding.form.tunnelKiln")}
                          </SelectItem>
                          <SelectItem value="other">
                            {t("onboarding.form.other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("country") === "Nepal" && (
                  <>
                    <FormField
                      control={form.control}
                      name="eximCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("onboarding.form.eximCode")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("onboarding.form.eximCodeDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="panNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {t("onboarding.form.panNo")}{" "}
                            <span className="text-red-500">
                              {t("onboarding.form.required")}
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>
                            {t("onboarding.form.panNoDescription")}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {form.watch("country") === "India" && (
                  <FormField
                    control={form.control}
                    name="bizGst"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          GST of Brick Company{" "}
                          <span className="text-red-500">
                            {t("onboarding.form.required")}
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>GST of Brick Company</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>

              <FormField
                control={form.control}
                name="additionalInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("onboarding.form.additionalInfo")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t(
                          "onboarding.form.additionalInfoPlaceholder",
                        )}
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {t("onboarding.form.additionalInfoDescription")}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-6">
                {/* Exclusive Membership Section */}
                <div className="bg-gradient-to-r from-redFiredMustard-50 to-redFiredMustard-100 rounded-lg border-2 border-redFiredMustard-300 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-redFiredMustard-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">⭐</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-redFiredMustard-800 mb-2">
                        {t("onboarding.form.exclusiveMembership.title")}
                      </h3>
                      <p className="text-redFiredMustard-700 text-sm mb-4 leading-relaxed">
                        {t("onboarding.form.exclusiveMembership.description")}
                      </p>
                      <FormField
                        control={form.control}
                        name="takeIndustryQuiz"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="border-redFiredMustard-600 data-[state=checked]:bg-redFiredMustard-600"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium text-redFiredMustard-800 cursor-pointer">
                              {t(
                                "onboarding.form.exclusiveMembership.checkboxLabel",
                              )}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* External Quiz Section */}
                <div className="bg-blue-50 rounded-lg border-2 border-blue-300 p-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">📝</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-800 mb-2">
                        {t("onboarding.form.industryQuiz.title")}
                      </h3>
                      <p className="text-blue-700 text-sm mb-4 leading-relaxed">
                        {t("onboarding.form.industryQuiz.description")}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              "https://varun-fcq8klry.scoreapp.com",
                              "_blank",
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          {t("onboarding.form.industryQuiz.buttonText")}
                          <ExternalLink size={14} />
                        </button>
                        <span className="text-blue-600 text-xs">
                          {t("onboarding.form.industryQuiz.opensNewTab")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col px-0 pt-4">
                {connectionStatus === "error" && (
                  <div className="w-full mb-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-md">
                    Warning: Unable to connect to our database. Form submission
                    may not work.
                  </div>
                )}

                {submitError && (
                  <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {submitError}
                  </div>
                )}
                <div className="flex justify-between w-full items-center">
                  <div>
                    {isSubmitting && (
                      <div className="flex items-center text-redFiredMustard-600">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </div>
                    )}
                    {!isSubmitting && connectionStatus === "connected" && (
                      <div className="text-green-600 text-sm">
                        {t("onboarding.form.databaseConnection")}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    onClick={() => {
                      const data = form.getValues();
                      handleSubmit(data);
                    }}
                    className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("onboarding.form.submitting")}
                      </>
                    ) : (
                      t("onboarding.form.submitJoinWaitlist")
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
};

export default OnboardingForm;
