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
  manufacturerFormSchema,
  type ManufacturerFormValues,
} from "@/lib/schemas";
import { geocodeAddress } from "@/utils/geocode";

// Using the shared schema from lib/schemas.ts

interface ManufacturerRegistrationFormProps {
  onSubmit: (data: ManufacturerFormValues) => void;
  isLoading?: boolean;
  countryCode?: string;
  prefillData?: Partial<ManufacturerFormValues>;
}

const ManufacturerRegistrationForm: React.FC<
  ManufacturerRegistrationFormProps
> = ({ onSubmit, isLoading = false, countryCode = "+91", prefillData }) => {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Initialize form
  const form = useForm<ManufacturerFormValues>({
    resolver: zodResolver(manufacturerFormSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: prefillData?.phone || "",
      country: countryCode === "+977" ? "Nepal" : "India",
      category: prefillData?.category || "manufacturer",
      country_code: countryCode,
      company_name: prefillData?.company_name || "",
      city: prefillData?.city || "",
      pincode: prefillData?.pincode || "", // This maps to pin_code in the database
      state: prefillData?.state || "",
      district: prefillData?.district || "",
      kiln_type: prefillData?.kiln_type || "",
      exim_code: prefillData?.exim_code || "",
      pan_no: prefillData?.pan_no || "",
      biz_gst: prefillData?.biz_gst || "",
      additional_info: prefillData?.additional_info || "",
      interested_in_exclusive_services:
        prefillData?.interested_in_exclusive_services || false,
      interested_in_industry_quiz:
        prefillData?.interested_in_industry_quiz || false,
    },
  });

  const watchState = form.watch("state");
  const watchCountry = form.watch("country");

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

  const handleSubmit = async (values: ManufacturerFormValues) => {
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

  return (
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
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>User Category</FormLabel>
                <FormControl>
                  <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    <span className="text-foreground">Manufacturer</span>
                  </div>
                </FormControl>
                <FormDescription>
                  Your category is set to Manufacturer
                </FormDescription>
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
                    <Input className="rounded-l-none" {...field} />
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
                <FormLabel>
                  Company Name <span className="text-red-500">*</span>
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
                <FormLabel>State</FormLabel>
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
                <FormLabel>District</FormLabel>
                {form.watch("country") === "Nepal" ? (
                  <FormControl>
                    <Input placeholder="Enter district" {...field} />
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
                      <Input {...field} />
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
                      <Input {...field} />
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
                    <Input {...field} />
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
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I am interested in exclusive services</FormLabel>
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
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    I am interested in participating in the industry quiz
                  </FormLabel>
                  <FormDescription>
                    Check this box to participate in our industry knowledge quiz
                    and receive insights.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 w-full"
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
  );
};

export default ManufacturerRegistrationForm;
