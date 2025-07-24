import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";
import {
  labourContractorFormSchema,
  type LabourContractorFormValues,
} from "@/lib/schemas";
import { geocodeAddress } from "@/utils/geocode";

interface LabourContractorRegistrationFormProps {
  onSubmit: (data: LabourContractorFormValues) => void;
  isLoading?: boolean;
  countryCode?: string;
  prefillData?: Partial<LabourContractorFormValues>;
  authenticatedPhone?: string;
}

const LabourContractorRegistrationForm: React.FC<
  LabourContractorRegistrationFormProps
> = ({
  onSubmit,
  isLoading = false,
  countryCode = "+91",
  prefillData,
  authenticatedPhone,
}) => {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Initialize form
  const form = useForm<LabourContractorFormValues>({
    resolver: zodResolver(labourContractorFormSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: authenticatedPhone || prefillData?.phone || "",
      country: countryCode === "+977" ? "Nepal" : "India",
      category: "labour_contractor",
      country_code: countryCode,
      company_name: prefillData?.company_name || "",
      city: prefillData?.city || "",
      pincode: prefillData?.pincode || "",
      state: prefillData?.state || "",
      district: prefillData?.district || "",
      service_types: prefillData?.service_types || [],
      experience_years: prefillData?.experience_years || "",

      exim_code: prefillData?.exim_code || "",
      pan_no: prefillData?.pan_no || "",
      aadhar_no: prefillData?.aadhar_no || "",
      biz_gst: prefillData?.biz_gst || "",
      additional_info: prefillData?.additional_info || "",
    },
  });

  const watchState = form.watch("state");
  const watchCountry = form.watch("country");
  const watchServiceTypes = form.watch("service_types");

  // Update districts when state changes (only for India)
  useEffect(() => {
    if (watchState && watchCountry === "India") {
      setAvailableDistricts(getDistrictsByState(watchState));
      // Reset district if current selection is not in the new list of districts
      const currentDistrict = form.getValues("district");
      if (
        currentDistrict &&
        !getDistrictsByState(watchState).includes(currentDistrict)
      ) {
        form.setValue("district", "");
      }
    }
  }, [watchState, watchCountry, form]);

  // Force the country value if countryCode is +977
  useEffect(() => {
    if (countryCode === "+977" && watchCountry !== "Nepal") {
      form.setValue("country", "Nepal");
      form.setValue("country_code", "+977");
    }
  }, [countryCode, watchCountry, form]);

  const handleSubmit = async (values: LabourContractorFormValues) => {
    // Prefer user-provided lat/lng if present and valid
    let latitude =
      values.latitude && values.latitude.trim() !== "" ? values.latitude : "";
    let longitude =
      values.longitude && values.longitude.trim() !== ""
        ? values.longitude
        : "";

    // If not provided, use geocoding
    if (!latitude || !longitude) {
      const addressParts = [
        values.company_name,
        values.city,
        values.district,
        values.state,
        values.pincode,
        values.country,
      ];
      const fullAddress = addressParts.filter(Boolean).join(", ");
      try {
        const geo = await geocodeAddress(fullAddress);
        if (geo) {
          latitude = geo.latitude.toString();
          longitude = geo.longitude.toString();
        } else {
          console.warn("Geocoding failed for address:", fullAddress);
        }
      } catch (geoError) {
        console.error("Error during geocoding:", geoError);
      }
    }

    // Pass all values, but override latitude/longitude with the final values
    const finalValues = {
      ...values,
      latitude: latitude || "",
      longitude: longitude || "",
    };
    onSubmit(finalValues);
  };

  const serviceTypeOptions = [
    { value: "molders", label: "Molders (Pather)" },
    {
      value: "green_brick_movers",
      label: "Green Brick Movers (Kacchi Bharai)",
    },
    { value: "stackers", label: "Stackers (Beldaar)" },
    { value: "insulation", label: "Insulation (Raabis)" },
    { value: "coal_loading", label: "Coal Loading (Coal Dhulai)" },
    { value: "firemen", label: "Firemen (Jalai)" },
    { value: "withdrawers", label: "Withdrawers (Nikaasi)" },
    { value: "jcb_driver", label: "JCB Driver" },
    { value: "tractor_driver", label: "Tractor Driver" },
    { value: "manager", label: "Manager" },
    { value: "welder", label: "Welder" },
    { value: "general_labour", label: "General Labour" },
  ];

  return (
    <div className="bg-white">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Full Name <span className="text-red-500">*</span>
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
                  <FormLabel>Email</FormLabel>
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
                  <FormLabel>Country</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      // Reset phone, state and district if country changes
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
                        className="rounded-l-none bg-muted"
                        {...field}
                        disabled
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Phone number from your authenticated account
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
                  <FormLabel>Company/Business Name</FormLabel>
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
                    City <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter city" {...field} />
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
                    <Input placeholder="Enter pincode" {...field} />
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
                    State <span className="text-red-500">*</span>
                  </FormLabel>
                  {form.watch("country") === "Nepal" ? (
                    <FormControl>
                      <Input placeholder="Enter state" {...field} />
                    </FormControl>
                  ) : (
                    <Select
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
                  <FormLabel>
                    District <span className="text-red-500">*</span>
                  </FormLabel>
                  {form.watch("country") === "Nepal" ? (
                    <FormControl>
                      <Input placeholder="Enter district" {...field} />
                    </FormControl>
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!form.watch("state")}
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
                  )}
                  <FormDescription>
                    Select the district where your business is located
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience_years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-5">2-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-15">11-15 years</SelectItem>
                      <SelectItem value="16-20">16-20 years</SelectItem>
                      <SelectItem value="20+">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pan_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PAN Card Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter PAN card number (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional for all users</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="aadhar_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Aadhar Card Number <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 12-digit Aadhar number"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Required for all users</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("country") === "Nepal" && (
              <FormField
                control={form.control}
                name="exim_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exim Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>
                      Optional for Nepal-based businesses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="biz_gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business GST</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter GST number (optional)"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Optional for all businesses</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="service_types"
            render={() => (
              <FormItem>
                <div className="mb-4">
                  <FormLabel className="text-base">
                    Service Types <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormDescription>
                    Select all the services you provide
                  </FormDescription>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {serviceTypeOptions.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="service_types"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        item.value,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value,
                                        ),
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additional_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Information</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your services, specializations, and any other relevant information"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default LabourContractorRegistrationForm;
