import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ManufacturerProfile = Database["public"]["Tables"]["manufacturers"]["Row"];
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getDistrictsByState,
  indianStatesDistricts,
} from "@/data/indian_states_districts";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Loader2 } from "lucide-react";

// Define the form schema based on the BKO onboarding form
const profileFormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phone: z.string().min(8, { message: "Please enter a valid phone number." }),
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
    kiln_type: z.string({
      required_error: "Please select a kiln type.",
    }),
    // Conditional fields based on country
    exim_code: z.string().optional(),
    // Exim Code is now optional for Nepal
    pan_no: z.string().optional(),
    biz_gst: z.string().optional(),
    additional_info: z.string().optional(),
    interested_in_exclusive_services: z.boolean().default(false),
    interested_in_industry_quiz: z.boolean().default(false),
    // Keep some of the original fields that might be needed

    country_code: z.string().default("+91"),
  })
  .superRefine((values, ctx) => {
    if (values.country === "Nepal" && !values.pan_no) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "PAN No is required for Nepal",
        path: ["pan_no"],
      });
    }
    if (values.country === "India" && !values.biz_gst) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Business GST is required for India",
        path: ["biz_gst"],
      });
    }
  });

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileManagementProps {
  manufacturerId: string;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({
  manufacturerId,
}) => {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<ManufacturerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Initialize form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      country: "India",
      country_code: "+91",
      company_name: "",
      city: "",
      pincode: "",
      state: "",
      district: "",
      kiln_type: "",
      exim_code: "",
      pan_no: "",
      biz_gst: "",
      additional_info: "",
      interested_in_exclusive_services: false,
      interested_in_industry_quiz: false,
    },
  });

  const watchState = form.watch("state");

  useEffect(() => {
    if (watchState && form.watch("country") === "India") {
      setAvailableDistricts(getDistrictsByState(watchState));
      form.setValue("district", "");
    }
  }, [watchState, form]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Get data directly from manufacturers table
        const { data: manufacturerData, error: manufacturerError } =
          await supabase
            .from("manufacturers")
            .select("*")
            .eq("id", manufacturerId)
            .single();

        if (manufacturerError) {
          console.error("Error fetching manufacturer data:", manufacturerError);
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try again later.",
            variant: "destructive",
          });
        } else if (manufacturerData) {
          setProfile(manufacturerData);

          // Extract country code and phone number
          let phoneNumber = manufacturerData.phone || "";
          let countryValue = manufacturerData.country || "India";
          let countryCodeValue = "+91"; // Default to India

          // Remove country code from phone number if present
          if (phoneNumber.startsWith("+91")) {
            phoneNumber = phoneNumber.substring(3);
            countryCodeValue = "+91";
          } else if (phoneNumber.startsWith("+977")) {
            phoneNumber = phoneNumber.substring(4);
            countryCodeValue = "+977";
          }

          // Set available districts if state is available
          if (manufacturerData.state && countryValue === "India") {
            setAvailableDistricts(getDistrictsByState(manufacturerData.state));
          }

          form.reset({
            name: manufacturerData.name || "",
            email: manufacturerData.email || "",
            phone: phoneNumber,
            country: countryValue,
            country_code: countryCodeValue,
            company_name: manufacturerData.company_name || "",
            city: manufacturerData.city || "",
            pincode: manufacturerData.pincode || "",
            state: manufacturerData.state || "",
            district: manufacturerData.district || "",
            kiln_type: manufacturerData.kiln_type || "",
            exim_code: manufacturerData.exim_code || "",
            pan_no: manufacturerData.pan_no || "",
            biz_gst: manufacturerData.biz_gst || "",
            additional_info: manufacturerData.additional_info || "",
            interested_in_exclusive_services:
              manufacturerData.interested_in_exclusive_services || false,
            interested_in_industry_quiz:
              manufacturerData.interested_in_industry_quiz || false,
          });
        }
      } catch (error) {
        console.error("Exception in fetchProfile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (manufacturerId) {
      fetchProfile();
    }
  }, [manufacturerId, form]);

  // Handle form submission
  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    setSubmitError(null);
    try {
      // Update the manufacturers table
      const { data, error } = await supabase
        .from("manufacturers")
        .update({
          name: values.name,
          email: values.email,
          phone: values.country_code + values.phone,
          company_name: values.company_name,
          city: values.city,
          pincode: values.pincode,
          state: values.state,
          district: values.district,
          kiln_type: values.kiln_type,
          additional_info: values.additional_info,
          biz_gst: values.biz_gst,
          pan_no: values.pan_no,
          exim_code: values.exim_code,
          interested_in_exclusive_services:
            values.interested_in_exclusive_services,
          interested_in_industry_quiz: values.interested_in_industry_quiz,

          country: values.country,
        })
        .eq("id", manufacturerId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      setProfile(data);
      form.reset(form.getValues());
      setIsEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      setSubmitError("Failed to save profile. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-redFiredMustard-50">
        <CardTitle className="text-2xl font-bold text-redFiredMustard-800">
          {profile
            ? "EDIT BRICK KILN OWNER PROFILE"
            : "CREATE BRICK KILN OWNER PROFILE"}
        </CardTitle>
        <CardDescription className="text-redFiredMustard-700">
          Update your profile information to help us serve you better.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isEditMode ? null : (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md mb-4">
                <p>
                  Your profile is complete. Click "Edit Profile" to make
                  changes.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditMode} />
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
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled={!isEditMode} />
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
                    <FormLabel>Country</FormLabel>
                    <Select
                      disabled={!isEditMode}
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset phone, state and district if country changes
                        form.setValue("phone", "");
                        form.setValue("state", "");
                        form.setValue("district", "");
                        // Update country code
                        if (value === "India") {
                          form.setValue("country_code", "+91");
                        } else if (value === "Nepal") {
                          form.setValue("country_code", "+977");
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
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
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <div className="bg-muted flex items-center justify-center px-3 border border-r-0 rounded-l-md">
                          {form.watch("country") === "Nepal" ? "+977" : "+91"}
                        </div>
                        <Input
                          className="rounded-l-none"
                          {...field}
                          disabled={!isEditMode}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Enter your phone number without the country code
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={!isEditMode} />
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
                      City <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter city"
                        {...field}
                        disabled={!isEditMode}
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
                      Pincode <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter pincode"
                        {...field}
                        disabled={!isEditMode}
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
                    <FormLabel>State</FormLabel>
                    {form.watch("country") === "Nepal" ? (
                      <FormControl>
                        <Input
                          placeholder="Enter state"
                          {...field}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    ) : (
                      <Select
                        disabled={!isEditMode}
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset district when state changes
                          form.setValue("district", "");
                        }}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select state" />
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
                    <FormLabel>District</FormLabel>
                    {form.watch("country") === "Nepal" ? (
                      <FormControl>
                        <Input
                          placeholder="Enter district"
                          {...field}
                          disabled={!isEditMode}
                        />
                      </FormControl>
                    ) : (
                      <>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!watchState || !isEditMode}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
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
                          {!watchState && "Please select a state first"}
                        </FormDescription>
                      </>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kiln_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kiln Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!isEditMode}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select kiln type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="zigzag">Zigzag Kiln</SelectItem>
                        <SelectItem value="fcbtk">FCBTK</SelectItem>
                        <SelectItem value="hoffman">Hoffman Kiln</SelectItem>
                        <SelectItem value="tunnel">Tunnel Kiln</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
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
                    name="exim_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Exim Code</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditMode} />
                        </FormControl>
                        <FormDescription>
                          Optional for Nepal-based businesses
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pan_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          PAN No <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} disabled={!isEditMode} />
                        </FormControl>
                        <FormDescription>
                          Required for Nepal-based businesses
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
                  name="biz_gst"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Business GST <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditMode} />
                      </FormControl>
                      <FormDescription>
                        Required for India-based businesses
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
            <FormField
              control={form.control}
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your company, products, and services"
                      className="min-h-[120px]"
                      {...field}
                      disabled={!isEditMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="interested_in_exclusive_services"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditMode}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I am interested in exclusive services
                      </FormLabel>
                      <FormDescription>
                        Check this box to receive information about our premium
                        services.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="interested_in_industry_quiz"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={!isEditMode}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I am interested in participating in the industry quiz
                      </FormLabel>
                      <FormDescription>
                        Check this box to participate in our industry knowledge
                        quiz and receive insights.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            {!isEditMode ? (
              <Button
                type="button"
                className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
                onClick={() => setIsEditMode(true)}
              >
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setIsEditMode(false);
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Profile"
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ProfileManagement;
