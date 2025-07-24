import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
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

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface CoalProviderProfileManagementProps {
  coalProviderId: string;
}

const CoalProviderProfileManagement: React.FC<
  CoalProviderProfileManagementProps
> = ({ coalProviderId }) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      country: "",
      company_name: "",
      city: "",
      pincode: "",
      state: "",
      district: "",
      fuel_types: [],
      supply_capacity: "",
      delivery_service_area: "",
      exim_code: "",
      pan_no: "",
      biz_gst: "",
      additional_info: "",
      country_code: "+91",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("coal_providers")
          .select("*")
          .eq("id", coalProviderId)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        } else if (data) {
          setProfile(data);
          form.reset({
            name: data.name || "",
            email: data.email || "",
            country: data.country || "",
            company_name: data.company_name || "",
            city: data.city || "",
            pincode: data.pincode || "",
            state: data.state || "",
            district: data.district || "",
            fuel_types: Array.isArray(data.fuel_types)
              ? data.fuel_types
              : data.fuel_type
                ? [data.fuel_type]
                : [],
            supply_capacity: data.supply_capacity || "",
            delivery_service_area: data.delivery_service_area || "",
            exim_code: data.exim_code || "",
            pan_no: data.pan_no || "",
            biz_gst: data.biz_gst || "",
            additional_info: data.additional_info || "",
            country_code: data.country_code || "+91",
          });
        }
      } catch (error) {
        console.error("Exception in fetchProfile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (coalProviderId) {
      fetchProfile();
    }
  }, [coalProviderId, form, toast]);

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

  const onSubmit = async (values: ProfileFormValues) => {
    setSaving(true);
    try {
      console.log("Submitting profile update with values:", values);

      const updateData = {
        name: values.name,
        email: values.email,
        country: values.country,
        company_name: values.company_name,
        city: values.city,
        pincode: values.pincode,
        state: values.state,
        district: values.district,
        fuel_types: values.fuel_types,
        supply_capacity: values.supply_capacity || null,
        delivery_service_area: values.delivery_service_area,
        exim_code: values.exim_code || null,
        pan_no: values.pan_no || null,
        biz_gst: values.biz_gst || null,
        additional_info: values.additional_info || null,
        country_code: values.country_code,
      };

      console.log("Update data being sent:", updateData);

      const { data, error } = await supabase
        .from("coal_providers")
        .update(updateData)
        .eq("id", coalProviderId)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        console.error(
          "Error details:",
          error.message,
          error.details,
          error.hint,
        );
        toast({
          title: "Error",
          description: `Failed to save profile: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
      setIsEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
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
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-orange-800">Company Profile</CardTitle>
        <CardDescription>
          Manage your company information (phone number cannot be changed)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {!isEditMode && (
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Reset state and district if country changes
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
                      disabled={!isEditMode}
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

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">
                  Phone Number
                </label>
                <div className="flex">
                  <div className="bg-muted flex items-center justify-center px-3 border border-r-0 rounded-l-md text-sm">
                    {form.watch("country") === "Nepal" ? "+977" : "+91"}
                  </div>
                  <Input
                    value={profile?.phone || ""}
                    disabled
                    className="bg-gray-100 rounded-l-none"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Phone number cannot be changed
                </p>
              </div>

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
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Reset district when state changes
                          form.setValue("district", "");
                        }}
                        defaultValue={field.value}
                        disabled={!isEditMode}
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
                name="supply_capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Supply Capacity (per month)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 1000 tons"
                        {...field}
                        disabled={!isEditMode}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional: Specify your monthly supply capacity
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delivery_service_area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Delivery/Service Area{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Within 50km radius, Delhi NCR, etc."
                        {...field}
                        disabled={!isEditMode}
                      />
                    </FormControl>
                    <FormDescription>
                      Specify the areas where you can deliver or provide
                      services
                    </FormDescription>
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
              name="fuel_types"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Fuel Types</FormLabel>
                    <FormDescription>
                      Select all fuel types you can supply
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      {
                        id: "high_low_gcv_us_coal",
                        label: "HIGH & LOW GCV US COAL",
                      },
                      { id: "imported_coal", label: "IMPORTED COAL" },
                      { id: "indian_coal", label: "INDIAN COAL" },
                      { id: "g1_g2_assam_coal", label: "G1 & G2 ASSAM COAL" },
                      { id: "biomass_fuel", label: "BIOMASS FUEL" },
                      { id: "alternate_fuel", label: "ALTERNATE FUEL" },
                    ].map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="fuel_types"
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
                                  disabled={!isEditMode}
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
              name="additional_info"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your company, fuel types, and services"
                      className="min-h-[120px]"
                      {...field}
                      disabled={!isEditMode}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEditMode ? (
              <Button
                type="button"
                className="bg-orange-600 hover:bg-orange-700"
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
                  className="bg-orange-600 hover:bg-orange-700"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

export default CoalProviderProfileManagement;
