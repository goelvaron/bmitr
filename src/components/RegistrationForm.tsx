import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { registerCustomer } from "@/services/authService";
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
import { Loader2, MapPin } from "lucide-react";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";
import { geocodeAddress } from "@/utils/geocode";

// Extract state names for validation schema
const stateNames = Object.keys(indianStatesDistricts);

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
  nepalCity: z
    .string()
    .min(2, { message: "City is required" })
    .optional()
    .or(z.literal("")),
  latitude: z.string().optional().or(z.literal("")),
  longitude: z.string().optional().or(z.literal("")),
});
// No longer requiring GST for India
type RegistrationFormValues = z.infer<typeof registrationFormSchema>;

interface RegistrationFormProps {
  phone: string;
  onSuccess: (customerId: string) => void;
  onError: (message: string) => void;
  state?: string;
  district?: string;
  countryCode?: string;
  prefillData?: {
    name?: string;
    email?: string;
    company?: string;
    state?: string;
    district?: string;
    city?: string;
    pinCode?: string;
    gstDetails?: string;
    address?: string;
  };
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  phone,
  onSuccess,
  onError,
  state = "",
  district = "",
  countryCode = "",
  prefillData,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string>("");

  // Determine default country based on countryCode
  const getDefaultCountry = () => {
    if (countryCode === "+91") return "India";
    if (countryCode === "+977") return "Nepal";
    return "India"; // Default to India if no match
  };

  // Force country to Nepal if countryCode is +977
  const forcedCountry = countryCode === "+977" ? "Nepal" : null;

  // Log the country code for debugging
  console.log("Country code in RegistrationForm:", countryCode);

  console.log("Country code received:", countryCode);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      name: prefillData?.name || "",
      email: prefillData?.email || "",
      company: prefillData?.company || "",
      isBusinessWithGST: !!prefillData?.gstDetails,
      gstDetails: prefillData?.gstDetails || "",
      bizGst: "",
      eximCode: "",
      panNo: "",
      address: prefillData?.address || "",
      city: prefillData?.city || "",
      pinCode: prefillData?.pinCode || "",
      country: forcedCountry || getDefaultCountry(),
      state: prefillData?.state || state || "",
      district: prefillData?.district || district || "",
      addressDistrict: "",
      nepalCity: "",
      latitude: "",
      longitude: "",
    },
    mode: "onChange",
  });

  const watchIsBusinessWithGST = form.watch("isBusinessWithGST");
  const watchState = form.watch("state");
  const watchCountry = form.watch("country");

  // Force the country value if countryCode is +977
  useEffect(() => {
    if (countryCode === "+977" && watchCountry !== "Nepal") {
      form.setValue("country", "Nepal");
    }
  }, [countryCode, watchCountry, form]);

  // Log the watched country for debugging
  console.log("Watched country in RegistrationForm:", watchCountry);

  // Update districts when state changes (only for India)
  useEffect(() => {
    if (watchState && watchCountry === "India") {
      const districts = getDistrictsByState(watchState);
      setAvailableDistricts(districts);

      // Reset district if current selection is not in the new list of districts
      const currentDistrict = form.getValues("district");
      if (currentDistrict && !districts.includes(currentDistrict)) {
        form.setValue("district", "");
      }
    }
  }, [watchState, watchCountry, form]);

  // Effect to log when prefill data is available
  useEffect(() => {
    if (prefillData) {
      console.log("Registration form prefilled with data:", prefillData);
    }
  }, [prefillData]);

  // Function to get the user's current location
  const getGeolocation = () => {
    setIsGettingLocation(true);
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsGettingLocation(false);
      return;
    }

    // First try with standard settings
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          // Format to 6 decimal places for better readability
          const formattedLat = latitude.toFixed(6);
          const formattedLng = longitude.toFixed(6);

          // Update form values
          form.setValue("latitude", formattedLat);
          form.setValue("longitude", formattedLng);

          console.log(`Location captured: ${formattedLat}, ${formattedLng}`);
          setIsGettingLocation(false);
          setLocationError(""); // Clear any previous errors
        },
        (error) => {
          console.error("Error getting location:", error);
          let errorMessage = "Failed to get your location";
          let helpText = "";

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied.";
              helpText =
                "Please enable location access in your browser settings and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable.";
              helpText =
                "Please check if your device has GPS enabled, try moving to an area with better GPS signal, or try a different browser.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              helpText = "Please try again or enter your coordinates manually.";
              break;
            default:
              errorMessage = `Location error: ${error.message}`;
          }

          setLocationError(`${errorMessage} ${helpText}`);

          // If position is unavailable or timed out, try with lower accuracy as fallback
          if (
            error.code === error.POSITION_UNAVAILABLE ||
            error.code === error.TIMEOUT
          ) {
            setTimeout(() => {
              tryFallbackGeolocation();
            }, 500);
          } else {
            setIsGettingLocation(false);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000, // Reduced timeout for faster fallback
          maximumAge: 0,
        },
      );
    } catch (e) {
      console.error("Unexpected error in geolocation:", e);
      setLocationError(
        "An unexpected error occurred. Trying alternative method...",
      );
      setTimeout(() => {
        tryFallbackGeolocation();
      }, 500);
    }
  };

  // Fallback geolocation with less strict settings
  const tryFallbackGeolocation = () => {
    setLocationError("Trying alternative location method...");

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const formattedLat = latitude.toFixed(6);
          const formattedLng = longitude.toFixed(6);

          form.setValue("latitude", formattedLat);
          form.setValue("longitude", formattedLng);

          console.log(
            `Location captured with fallback: ${formattedLat}, ${formattedLng}`,
          );
          setLocationError("");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Fallback geolocation also failed:", error);

          // Try one last time with maximum compatibility settings
          tryLastResortGeolocation();
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000, // Accept cached positions up to 1 minute old
        },
      );
    } catch (e) {
      console.error("Unexpected error in fallback geolocation:", e);
      tryLastResortGeolocation();
    }
  };

  // Last resort geolocation with maximum compatibility
  const tryLastResortGeolocation = () => {
    setLocationError("Trying one last method to get your location...");

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const formattedLat = latitude.toFixed(6);
          const formattedLng = longitude.toFixed(6);

          form.setValue("latitude", formattedLat);
          form.setValue("longitude", formattedLng);

          console.log(
            `Location captured with last resort method: ${formattedLat}, ${formattedLng}`,
          );
          setLocationError("");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("All geolocation attempts failed:", error);
          setLocationError(
            "Unable to detect your location. Please ensure location services are enabled in your browser and device settings, or enter coordinates manually.",
          );
          setIsGettingLocation(false);
        },
        {
          enableHighAccuracy: false,
          timeout: 30000,
          maximumAge: 300000, // Accept positions up to 5 minutes old
        },
      );
    } catch (e) {
      console.error("Final geolocation attempt failed:", e);
      setLocationError(
        "Unable to access location services. Please check your browser permissions and try again, or enter coordinates manually.",
      );
      setIsGettingLocation(false);
    }
  };

  const onSubmit = async (data: RegistrationFormValues) => {
    console.log("Form submitted with data:", data);
    console.log("Nepal city value:", data.nepalCity);
    console.log("Current country:", watchCountry);
    console.log("Country code:", countryCode);
    console.log("Phone number for registration:", phone);
    setIsLoading(true);

    try {
      // Prefer user-provided lat/lng if present and valid
      let latitude =
        data.latitude && data.latitude.trim() !== "" ? data.latitude : "";
      let longitude =
        data.longitude && data.longitude.trim() !== "" ? data.longitude : "";

      // If not provided, use geocoding
      if (!latitude || !longitude) {
        const addressParts = [
          data.address,
          data.city || data.nepalCity,
          data.district,
          data.state,
          data.pinCode,
          data.country,
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

      // Prepare customer data
      const customerData = {
        name: data.name,
        email: data.email,
        company_name: data.company,
        gst_details: data.isBusinessWithGST ? data.gstDetails : null,
        biz_gst: null, // Business GST field removed
        exim_code: null, // No longer using exim_code for Nepal
        pan_no: null, // No longer using pan_no for Nepal
        address: data.address, // Map address field to address column
        city:
          watchCountry === "Nepal" || countryCode === "+977"
            ? data.nepalCity || ""
            : data.city || "", // For Nepal, use nepalCity field
        pin_code: data.pinCode || "", // Ensure pin_code is never undefined
        country: countryCode === "+977" ? "Nepal" : "India", // Ensure country is set based on countryCode
        state: data.state || "",
        district: data.addressDistrict || "", // Use addressDistrict for the district field
        latitude: latitude || null,
        longitude: longitude || null,
        from_brick_owner_onboarding: true,
      };

      console.log(
        "Submitting customer data:",
        JSON.stringify(customerData, null, 2),
      );

      console.log(
        "About to register customer with data:",
        JSON.stringify(customerData, null, 2),
        "and phone:",
        phone,
      );
      // Register customer
      // For Nepal numbers, use a simplified approach
      if (countryCode === "+977") {
        console.log("Using simplified approach for Nepal numbers");
        // Create a record for Nepal users with GST details included
        const nepalCustomerData = {
          name: data.name,
          email: data.email || `nepal_${Date.now()}@example.com`, // Ensure email is never empty
          company_name: data.company,
          gst_details: data.isBusinessWithGST ? data.gstDetails : null, // Include GST/VAT/PAN details
          biz_gst: data.isBusinessWithGST ? data.gstDetails : null, // Also include in biz_gst for compatibility
          country: "Nepal",
          state: data.state || "",
          district: data.addressDistrict || "", // Use addressDistrict for the district field
          city: data.nepalCity || data.city || "", // Use the dedicated Nepal city field or fallback to regular city field
          pin_code: data.pinCode || "00000", // Ensure pin code is never empty
        };

        console.log(
          "Nepal GST/VAT/PAN details:",
          data.isBusinessWithGST ? data.gstDetails : "Not provided",
        );

        try {
          // Add explicit logging for GST/VAT/PAN details
          console.log(
            "Submitting Nepal customer data:",
            JSON.stringify(nepalCustomerData, null, 2),
          );
          console.log(
            "GST/VAT/PAN field value being sent:",
            nepalCustomerData.gst_details,
          );
          const result = await registerCustomer(nepalCustomerData, phone);
          console.log("Nepal registration result:", result);

          if (result.success && result.customerId) {
            console.log(
              "Nepal registration successful with ID:",
              result.customerId,
            );
            // Use setTimeout to ensure state updates properly
            setTimeout(() => {
              onSuccess(result.customerId!);
            }, 200);
            return; // Exit early after successful Nepal registration
          } else {
            console.error("Nepal registration failed:", result.message);
            onError(result.message || "Nepal registration failed");
            return; // Exit early after failed Nepal registration
          }
        } catch (nepalError) {
          console.error("Nepal registration exception:", nepalError);
          onError(
            `Nepal registration error: ${nepalError.message || "Unknown error"}`,
          );
          return; // Exit early after Nepal registration exception
        }
      } else {
        // Standard approach for other countries
        const result = await registerCustomer(customerData, phone);
        console.log("Registration result:", result);

        if (result.success && result.customerId) {
          // Pass the customerId to onSuccess for automatic login
          onSuccess(result.customerId);
        } else {
          // Handle specific error messages
          if (result.message === "Phone number already registered") {
            onError(
              "USER ALREADY EXISTS: This phone number is already registered. Please login with your existing account or contact support for assistance.",
            );
          } else if (result.message === "GST number already registered") {
            onError(
              "USER ALREADY EXISTS: This GST number is already registered. Please login with your existing account or contact support for assistance.",
            );
          } else {
            onError(result.message);
          }
        }
      }
    } catch (registrationError) {
      console.error("Error during registration process:", registrationError);
      onError(
        `Registration failed: ${registrationError.message || "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = form.getValues();
          onSubmit(data);
        }}
        className="space-y-4"
      >
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
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
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
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter your address" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {watchCountry === "India" ? (
            <>
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <Select
                      onValueChange={field.onChange}
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressDistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address District</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!watchState || availableDistricts.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select address district" />
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
                      {!watchState
                        ? "Please select a state first"
                        : "Select the district where your address is located"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter province" {...field} />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="addressDistrict"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address District</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter address district" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the district where your address is located
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Show city field based on country */}
          {watchCountry === "Nepal" || countryCode === "+977" ? (
            <>
              <FormField
                control={form.control}
                name="nepalCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (Nepal)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city in Nepal" {...field} />
                    </FormControl>
                    <FormDescription></FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Pin Code <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pin code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          ) : (
            <>
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="City" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pinCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pin Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter pin code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
        </div>

        {!countryCode && (
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
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
        )}

        {/* Nepal fields removed as requested */}

        <FormField
          control={form.control}
          name="isBusinessWithGST"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => {
                    field.onChange(checked);
                    // Clear GST details if unchecked
                    if (!checked) {
                      form.setValue("gstDetails", "");
                    }
                  }}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  {watchCountry === "Nepal"
                    ? "BIZ VAT/PAN NO."
                    : "BIZ GST NUMBER"}
                </FormLabel>
                <FormDescription>
                  {watchCountry === "Nepal"
                    ? "Check this if you have a BIZ VAT PAN registration number"
                    : "Check this if you have a GST registration number"}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {watchIsBusinessWithGST && (
          <FormField
            control={form.control}
            name="gstDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {watchCountry === "Nepal" ? "PAN/VAT Number" : "GST Number"}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={
                      watchCountry === "Nepal"
                        ? "PAN/VAT Registration Number"
                        : "GST Registration Number"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">
              Location Coordinates (Optional)
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => getGeolocation()}
              disabled={isGettingLocation}
              className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 border-blue-300"
            >
              {isGettingLocation ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Get Current Location
                </>
              )}
            </Button>
          </div>

          {locationError && (
            <div className="text-sm text-red-500 p-3 border border-red-200 rounded-md bg-red-50 shadow-sm">
              {locationError}
              {locationError.includes("Trying") && (
                <div className="mt-1 flex items-center">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  <span className="text-amber-600">Please wait...</span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter latitude" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter longitude" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onError("Registration cancelled")}
            disabled={isLoading}
          >
            Back
          </Button>

          <Button
            type="button"
            onClick={() => {
              const data = form.getValues();
              onSubmit(data);
            }}
            className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
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
        </div>
      </form>
    </Form>
  );
};

export default RegistrationForm;
