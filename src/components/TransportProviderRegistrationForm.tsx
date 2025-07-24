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
  transportProviderFormSchema,
  type TransportProviderFormValues,
} from "@/lib/transportProviderSchemas";

interface TransportProviderRegistrationFormProps {
  onSubmit: (data: TransportProviderFormValues) => void;
  isLoading?: boolean;
  countryCode?: string;
  prefillData?: Partial<TransportProviderFormValues>;
}

const TransportProviderRegistrationForm: React.FC<
  TransportProviderRegistrationFormProps
> = ({ onSubmit, isLoading = false, countryCode = "+91", prefillData }) => {
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Initialize form
  const form = useForm<TransportProviderFormValues>({
    resolver: zodResolver(transportProviderFormSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      phone: prefillData?.phone || "",
      country: countryCode === "+977" ? "Nepal" : "India",
      country_code: countryCode,
      company_name: prefillData?.company_name || "",
      city: prefillData?.city || "",
      pincode: prefillData?.pincode || "",
      state: prefillData?.state || "",
      district: prefillData?.district || "",
      transport_types: prefillData?.transport_types || [],
      service_area: prefillData?.service_area || "",
      exim_code: prefillData?.exim_code || "",
      pan_no: prefillData?.pan_no || "",
      biz_gst: prefillData?.biz_gst || "",
      additional_info: prefillData?.additional_info || "",
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

  const handleSubmit = async (values: TransportProviderFormValues) => {
    onSubmit(values);
  };

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
                  <FormLabel>Full Name</FormLabel>
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
                      <Input className="rounded-l-none" {...field} disabled />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Phone number verified via OTP
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
              name="transport_types"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Transport Types</FormLabel>
                    <FormDescription>
                      Select all transport services you provide
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        id: "road_transport",
                        label: "ROAD TRANSPORT",
                      },
                      { id: "rail_freight", label: "RAIL FREIGHT" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="transport_types"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id,
                                          ),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
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
              name="service_area"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Service Area <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Within 100km radius, Pan India, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Specify the areas where you provide transport services
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
                    PAN No. <span className="text-red-500">*</span>
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
              name="biz_gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business GST / Transporter ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Optional field for business registration details
                  </FormDescription>
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
          </div>

          <FormField
            control={form.control}
            name="additional_info"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your transport company and services"
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

export default TransportProviderRegistrationForm;
