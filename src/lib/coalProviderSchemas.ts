import * as z from "zod";

// Schema for coal/fuel provider registration form
export const coalProviderFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z
    .string()
    .min(10, {
      message:
        "Phone number must be at least 10 characters long after country code.",
    }),
  country: z.string({
    required_error: "Please select a country.",
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
  fuel_types: z.array(z.string()).min(1, {
    message: "Please select at least one fuel type.",
  }),
  supply_capacity: z.string().optional(),
  delivery_service_area: z.string().min(2, {
    message: "Delivery/service area must be at least 2 characters.",
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
  country_code: z.string().default("+91"),
});

// Export type for the schema
export type CoalProviderFormValues = z.infer<typeof coalProviderFormSchema>;
