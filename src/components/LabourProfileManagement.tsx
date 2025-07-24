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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Edit, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";
import {
  labourContractorFormSchema,
  type LabourContractorFormValues,
} from "@/lib/schemas";
import { geocodeAddress } from "@/utils/geocode";

interface LabourProfileManagementProps {
  labourId: string;
  labourData: any;
  onProfileUpdate: (updatedData: any) => void;
}

const LabourProfileManagement: React.FC<LabourProfileManagementProps> = ({
  labourId,
  labourData,
  onProfileUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const { toast } = useToast();

  // Create a modified schema that excludes phone validation for editing
  const editProfileSchema = labourContractorFormSchema.omit({ phone: true });

  const form = useForm<Omit<LabourContractorFormValues, "phone">>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      name: labourData?.name || "",
      email: labourData?.email || "",
      country: labourData?.country || "India",
      category: "labour_contractor",
      country_code: labourData?.country_code || "+91",
      company_name: labourData?.company_name || "",
      city: labourData?.city || "",
      pincode: labourData?.pincode || "",
      state: labourData?.state || "",
      district: labourData?.district || "",
      service_types: labourData?.service_types || [],
      experience_years: labourData?.experience_years || "",

      exim_code: labourData?.exim_code || "",
      pan_no: labourData?.pan_no || "",
      aadhar_no: labourData?.aadhar_no || "",
      biz_gst: labourData?.biz_gst || "",
      additional_info: labourData?.additional_info || "",
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

  // Initialize districts on component mount
  useEffect(() => {
    if (labourData?.state && labourData?.country === "India") {
      setAvailableDistricts(getDistrictsByState(labourData.state));
    }
  }, [labourData]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    form.reset({
      name: labourData?.name || "",
      email: labourData?.email || "",
      country: labourData?.country || "India",
      category: "labour_contractor",
      country_code: labourData?.country_code || "+91",
      company_name: labourData?.company_name || "",
      city: labourData?.city || "",
      pincode: labourData?.pincode || "",
      state: labourData?.state || "",
      district: labourData?.district || "",
      service_types: labourData?.service_types || [],
      experience_years: labourData?.experience_years || "",

      exim_code: labourData?.exim_code || "",
      pan_no: labourData?.pan_no || "",
      aadhar_no: labourData?.aadhar_no || "",
      biz_gst: labourData?.biz_gst || "",
      additional_info: labourData?.additional_info || "",
    });
  };

  const handleSave = async (
    values: Omit<LabourContractorFormValues, "phone">,
  ) => {
    setIsLoading(true);
    try {
      // Handle geocoding if needed
      let latitude = labourData?.latitude || "";
      let longitude = labourData?.longitude || "";

      // If location data is missing, use geocoding
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
          }
        } catch (geoError) {
          console.error("Error during geocoding:", geoError);
        }
      }

      const { data, error } = await supabase
        .from("labour_contractors")
        .update({
          name: values.name,
          email: values.email,
          country: values.country,
          country_code: values.country_code,
          company_name: values.company_name,
          city: values.city,
          pincode: values.pincode,
          state: values.state,
          district: values.district,
          service_types: values.service_types,
          experience_years: values.experience_years,

          exim_code: values.exim_code,
          pan_no: values.pan_no,
          aadhar_no: values.aadhar_no,
          biz_gst: values.biz_gst,
          additional_info: values.additional_info,
          latitude: latitude || null,
          longitude: longitude || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", labourId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      setIsEditing(false);
      onProfileUpdate(data);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-orange-800">
              Profile Management
            </CardTitle>
            {!isEditing ? (
              <Button
                onClick={handleEdit}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSave)}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
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
                        <Input type="email" {...field} disabled={!isEditing} />
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
                        disabled={!isEditing}
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

                {/* Phone field - display only, not editable */}
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Phone Number
                  </label>
                  <div className="flex">
                    <div className="bg-muted flex items-center justify-center px-3 border border-r-0 rounded-l-md">
                      {labourData?.country_code || "+91"}
                    </div>
                    <Input
                      className="rounded-l-none bg-gray-50"
                      value={labourData?.phone || ""}
                      disabled
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Phone number cannot be changed
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company/Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!isEditing} />
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
                          disabled={!isEditing}
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
                          disabled={!isEditing}
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
                            disabled={!isEditing}
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
                          disabled={!isEditing}
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
                            disabled={!isEditing}
                          />
                        </FormControl>
                      ) : (
                        <>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!watchState || !isEditing}
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
                  name="experience_years"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isEditing}
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
                      <FormLabel>
                        PAN Card Number <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter PAN card number"
                          {...field}
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormDescription>Required for all users</FormDescription>
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
                        Aadhar Card Number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter 12-digit Aadhar number"
                          {...field}
                          disabled={!isEditing}
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
                          <Input {...field} disabled={!isEditing} />
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
                          disabled={!isEditing}
                        />
                      </FormControl>
                      <FormDescription>
                        Optional for all businesses
                      </FormDescription>
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
                                    disabled={!isEditing}
                                    onCheckedChange={(checked) => {
                                      if (!isEditing) return;
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
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <div className="flex justify-end space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LabourProfileManagement;
