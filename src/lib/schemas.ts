import * as z from "zod";

// Phone form schema for OTP authentication
export const phoneFormSchema = z.object({
  countryCode: z.string().default("+91"),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .refine((val) => /^[0-9]{10,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
});

// OTP form schema
export const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .refine((val) => /^[0-9]{6}$/.test(val), {
      message: "OTP must contain only digits",
    }),
});

// Shared schema for both Brick Kiln Owner Onboarding and Manufacturer Registration
export const brickOwnerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long." }),
  country: z.string({
    required_error: "Please select a country.",
  }),
  category: z.string().default("manufacturer"),
  companyName: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  pincode: z
    .string()
    .min(4, { message: "Pincode must be at least 4 characters." }),
  state: z.string().min(1, {
    message: "State is required.",
  }),
  district: z.string().min(1, {
    message: "District is required.",
  }),
  address_district: z.string({
    required_error: "Please enter your address district.",
  }),
  kilnType: z.string({
    required_error: "Please select a kiln type.",
  }),
  // Conditional fields based on country
  eximCode: z.string().optional(),
  // Exim Code is now optional for Nepal
  panNo: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.path[0] === "panNo" && ctx.data.country === "Nepal" && !val) {
          return false;
        }
        return true;
      },
      { message: "PAN No is required for Nepal" },
    ),
  bizGst: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        if (ctx.path[0] === "bizGst" && ctx.data.country === "India" && !val) {
          return false;
        }
        return true;
      },
      { message: "Business GST is required for India" },
    ),
  additionalInfo: z.string().optional(),
  takeIndustryQuiz: z.boolean().default(false),
});

// Schema for manufacturer registration form with additional fields
export const manufacturerFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long." }),
  country: z.string({
    required_error: "Please select a country.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  pincode: z
    .string()
    .min(4, { message: "Pincode must be at least 4 characters." }),
  state: z.string({
    required_error: "Please enter a state.",
  }),
  district: z.string({
    required_error: "Please enter a district.",
  }),
  kiln_type: z.string({
    required_error: "Please select a kiln type.",
  }),
  // Conditional fields based on country
  exim_code: z.string().optional(),
  pan_no: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      // Only validate if country is Nepal
      const parent = (ctx as any).parent;
      if (
        parent &&
        typeof parent === "object" &&
        parent.country === "Nepal" &&
        !val
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "PAN No is required for Nepal",
        });
      }
    }),
  biz_gst: z
    .string()
    .optional()
    .superRefine((val, ctx) => {
      // Only validate if country is India
      const parent = (ctx as any).parent;
      if (
        parent &&
        typeof parent === "object" &&
        parent.country === "India" &&
        !val
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Business GST is required for India",
        });
      }
    }),
  additional_info: z.string().optional(),
  interested_in_exclusive_services: z.boolean().default(false),
  interested_in_industry_quiz: z.boolean().default(false),
  country_code: z.string().default("+91"),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

// Schema for labour/contractor registration form
export const labourContractorFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 characters long." }),
  country: z.string({
    required_error: "Please select a country.",
  }),
  category: z.string().default("labour_contractor"),
  company_name: z
    .string()
    .min(2, { message: "Company name must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  pincode: z
    .string()
    .min(4, { message: "Pincode must be at least 4 characters." }),
  state: z.string({
    required_error: "Please enter a state.",
  }),
  district: z.string({
    required_error: "Please enter a district.",
  }),
  service_types: z.array(z.string()).min(1, {
    message: "Please select at least one service type.",
  }),
  experience_years: z.string().min(1, {
    message: "Please specify years of experience.",
  }),

  // Conditional fields based on country
  exim_code: z.string().optional(),
  pan_no: z.string().min(1, { message: "PAN card number is required." }),
  aadhar_no: z.string().min(1, { message: "Aadhar card number is required." }),
  biz_gst: z.string().optional(),
  additional_info: z.string().optional(),
  country_code: z.string().default("+91"),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

// Form schema for registration
const registrationFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  company: z.string().min(2, { message: "Company name is required" }),
  isBusinessWithGST: z.boolean().default(false),
  gstDetails: z.string().optional(),
  bizGst: z.string().optional(),
  eximCode: z.string().optional(),
  panNo: z.string().optional(),
  address: z
    .string()
    .min(5, { message: "Address must be at least 5 characters" }),
  city: z.string().min(2, { message: "City is required" }),
  pinCode: z.string().min(4, { message: "Valid PIN/Postal code is required" }),
  // No default value to ensure it's required
  country: z.string().min(2, { message: "Country is required" }),
  state: z.string().min(2, { message: "State/Province is required" }),
  district: z.string().min(2, { message: "District is required" }),
  addressDistrict: z
    .string()
    .min(2, { message: "Address district is required" }),
  nepalCity: z
    .string()
    .min(2, { message: "City is required" })
    .optional()
    .or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});

// Export types for all schemas
export type PhoneFormValues = z.infer<typeof phoneFormSchema>;
export type OtpFormValues = z.infer<typeof otpFormSchema>;
export type BrickOwnerFormValues = z.infer<typeof brickOwnerSchema>;
export type ManufacturerFormValues = z.infer<typeof manufacturerFormSchema>;
export type LabourContractorFormValues = z.infer<
  typeof labourContractorFormSchema
>;
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>;
