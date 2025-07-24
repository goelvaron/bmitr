import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useWebsiteContent } from "@/services/contentService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { requestOtp, verifyOtp } from "@/services/authService";
import {
  findNearbyManufacturers,
  type Manufacturer,
} from "@/services/productMatchingService";
import { supabase } from "@/lib/supabase";
// Removed Header and Footer imports - using custom ones below
import RegistrationForm from "@/components/RegistrationForm";
import MatchedProducts from "@/components/MatchedProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  ArrowRight,
  CheckCircle,
  Search,
  MapPin,
  Eye,
} from "lucide-react";

// Form schema for phone input
const phoneFormSchema = z.object({
  countryCode: z.string().default("+91"),
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .refine((val) => /^[0-9]{10,15}$/.test(val), {
      message: "Please enter a valid phone number",
    }),
});

// Form schema for OTP verification
const otpFormSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "OTP must be exactly 6 digits" })
    .refine((val) => /^[0-9]{6}$/.test(val), {
      message: "OTP must contain only digits",
    }),
});

type PhoneFormValues = z.infer<typeof phoneFormSchema>;
type OtpFormValues = z.infer<typeof otpFormSchema>;

// Error Boundary Component
interface BrowseErrorBoundaryProps {
  children: ReactNode;
}

interface BrowseErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class BrowseErrorBoundary extends Component<
  BrowseErrorBoundaryProps,
  BrowseErrorBoundaryState
> {
  constructor(props: BrowseErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): BrowseErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 [BROWSE ERROR BOUNDARY] Caught error:", error);
    console.error("🚨 [BROWSE ERROR BOUNDARY] Error info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Something went wrong
            </h3>
            <p className="text-red-600 mb-4">
              We encountered an error while loading the manufacturers. Please
              try again.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reload Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const EENTMarketPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { content } = useWebsiteContent();
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [step, setStep] = useState<"phone" | "otp" | "register" | "success">(
    "phone",
  );
  const [authMode, setAuthMode] = useState<"signin" | "register">("signin");
  const [phone, setPhone] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [showProductsDialog, setShowProductsDialog] = useState<boolean>(false);
  const [nearbyManufacturers, setNearbyManufacturers] = useState<
    Manufacturer[]
  >([]);
  const [isLoadingManufacturers, setIsLoadingManufacturers] =
    useState<boolean>(false);
  const [showBrowseBox, setShowBrowseBox] = useState<boolean>(true);
  const [browseManufacturers, setBrowseManufacturers] = useState<
    Manufacturer[]
  >([]);
  const [isBrowseLoading, setIsBrowseLoading] = useState<boolean>(false);

  // Form for phone input
  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: {
      countryCode: "+91",
      phone: "",
    },
  });

  // Form for OTP verification
  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Effect for splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 4500); // Show splash for 4.5 seconds

    return () => clearTimeout(timer);
  }, []);

  // Effect for OTP resend countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle phone form submission
  const onPhoneSubmit = async (data: PhoneFormValues) => {
    console.log("🔍 [EENT DEBUG] Starting phone form submission");
    console.log("🔍 [EENT DEBUG] Form data:", data);
    console.log("🔍 [EENT DEBUG] Auth mode:", authMode);

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Format phone number with selected country code
      const formattedPhone = `${data.countryCode}${data.phone}`;
      console.log("🔍 [EENT DEBUG] Formatted phone number:", formattedPhone);

      // Request OTP
      console.log("🔍 [EENT DEBUG] Requesting OTP...");
      const result = await requestOtp(formattedPhone);
      console.log("🔍 [EENT DEBUG] OTP request result:", result);

      if (result.success) {
        console.log("✅ [EENT DEBUG] OTP request successful");
        setPhone(formattedPhone);
        setSuccessMessage(
          `OTP sent successfully to your phone for ${authMode === "signin" ? "sign in" : "registration"}`,
        );
        setStep("otp");
        setCountdown(30); // Start 30 second countdown for resend
      } else {
        console.error("🚨 [EENT DEBUG] OTP request failed:", result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error("🚨 [EENT DEBUG] Exception during OTP request:", err);
      console.error("🚨 [EENT DEBUG] Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      setError(
        `Failed to send OTP: ${err.message || "Unknown error"}. Please try again.`,
      );
    } finally {
      setIsLoading(false);
      console.log("🔍 [EENT DEBUG] Phone form submission completed");
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;

    console.log("🔍 [EENT DEBUG] Resending OTP to:", phone);
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await requestOtp(phone);
      console.log("🔍 [EENT DEBUG] Resend OTP result:", result);

      if (result.success) {
        console.log("✅ [EENT DEBUG] OTP resent successfully");
        setSuccessMessage("OTP resent successfully");
        setCountdown(30); // Reset countdown
      } else {
        console.error("🚨 [EENT DEBUG] OTP resend failed:", result.message);
        setError(result.message);
      }
    } catch (err) {
      console.error("🚨 [EENT DEBUG] Exception during OTP resend:", err);
      setError(
        `Failed to resend OTP: ${err.message || "Unknown error"}. Please try again.`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP form submission
  const onOtpSubmit = async (data: OtpFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Verify OTP
      const result = await verifyOtp(phone, data.otp);

      if (result.success) {
        setSuccessMessage(result.message);

        if (result.customerId) {
          // User is already registered, set customer ID and show success
          setCustomerId(result.customerId);
          setSuccessMessage("Login successful! Welcome to e-ENT BAZAAR.");
          setStep("success");
          console.log(
            "User already registered, customerId:",
            result.customerId,
          );
        } else {
          // User needs to complete registration
          if (authMode === "signin") {
            // If trying to sign in but user doesn't exist
            setError(
              "No account found with this phone number. Please register first.",
            );
            setStep("phone");
            setAuthMode("register");
          } else {
            // Proceed with registration
            console.log("User not registered yet, proceeding to registration");
            setStep("register");
          }
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration success
  const handleRegistrationSuccess = (newCustomerId: string) => {
    console.log("Registration success handler called with ID:", newCustomerId);
    try {
      // Force a small delay to ensure state updates properly
      setTimeout(() => {
        setCustomerId(newCustomerId);
        setSuccessMessage("Registration successful! Welcome to e-ENT BAZAAR.");
        // User is now automatically logged in
        setStep("success");
        console.log(
          "State updated: customerId =",
          newCustomerId,
          "step =",
          "success",
        );
      }, 200); // Increased delay for more reliable state updates
    } catch (err) {
      console.error("Error in registration success handler:", err);
      setError(
        "Registration completed but there was an error displaying the success page. Please refresh the page.",
      );
    }
  };

  // Handle registration error
  const handleRegistrationError = (message: string) => {
    setError(message);
    // If user cancels registration, go back to OTP step
    if (message === "Registration cancelled") {
      setError(null);
      setStep("otp");
    }
  };

  // Handle browse manufacturers (for the browse box)
  const handleBrowseManufacturers = async () => {
    console.log("🔍 [BROWSE] Starting handleBrowseManufacturers function");

    // Prevent multiple simultaneous calls
    if (isBrowseLoading) {
      console.log("⚠️ [BROWSE] Already loading, skipping duplicate call");
      return;
    }

    setIsBrowseLoading(true);
    setError(null); // Clear any previous errors

    try {
      console.log("🔍 [BROWSE] Starting location-based manufacturer search...");

      // Add timeout wrapper to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000); // 30 second timeout
      });

      // First attempt: Try to get user's precise location
      let searchResult;
      try {
        console.log("🔍 [BROWSE] Attempting to get user's precise location...");
        const searchPromise = findNearbyManufacturers();
        searchResult = (await Promise.race([
          searchPromise,
          timeoutPromise,
        ])) as Awaited<ReturnType<typeof findNearbyManufacturers>>;

        if (searchResult?.manufacturers?.length > 0) {
          console.log(
            `✅ [BROWSE] Found ${searchResult.manufacturers.length} manufacturers using precise location`,
          );
        }
      } catch (locationError) {
        console.log(
          "⚠️ [BROWSE] Precise location failed, trying fallback strategies...",
        );
        searchResult = null;
      }

      // If precise location failed or returned no results, try fallback strategies
      if (!searchResult?.manufacturers?.length) {
        console.log("🔍 [BROWSE] Trying fallback location strategies...");

        // Strategy 1: Try to get user's approximate location from browser/IP
        // This could be enhanced with IP geolocation services

        // Strategy 2: Use major Indian cities as fallback locations
        const fallbackCities = [
          { city: "Delhi", state: "Delhi", lat: 28.6139, lng: 77.209 },
          { city: "Mumbai", state: "Maharashtra", lat: 19.076, lng: 72.8777 },
          { city: "Kolkata", state: "West Bengal", lat: 22.5726, lng: 88.3639 },
          { city: "Chennai", state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
          { city: "Bangalore", state: "Karnataka", lat: 12.9716, lng: 77.5946 },
        ];

        for (const fallbackCity of fallbackCities) {
          try {
            console.log(
              `🔍 [BROWSE] Trying fallback city: ${fallbackCity.city}`,
            );

            const fallbackPromise = findNearbyManufacturers(
              fallbackCity.lat,
              fallbackCity.lng,
              undefined,
              { city: fallbackCity.city, state: fallbackCity.state },
            );

            const fallbackResult = (await Promise.race([
              fallbackPromise,
              timeoutPromise,
            ])) as Awaited<ReturnType<typeof findNearbyManufacturers>>;

            if (fallbackResult?.manufacturers?.length > 0) {
              console.log(
                `✅ [BROWSE] Found ${fallbackResult.manufacturers.length} manufacturers using ${fallbackCity.city} fallback`,
              );
              searchResult = fallbackResult;
              break;
            }
          } catch (fallbackError) {
            console.log(
              `⚠️ [BROWSE] Fallback city ${fallbackCity.city} failed:`,
              fallbackError.message,
            );
            continue;
          }
        }

        // Strategy 3: If city-based fallback fails, try state-based filtering
        if (!searchResult?.manufacturers?.length) {
          console.log("🔍 [BROWSE] Trying state-based fallback...");

          const majorStates = [
            "Uttar Pradesh",
            "Maharashtra",
            "West Bengal",
            "Tamil Nadu",
            "Karnataka",
          ];

          for (const state of majorStates) {
            try {
              const statePromise = findNearbyManufacturers(
                undefined,
                undefined,
                undefined,
                { state: state },
              );

              const stateResult = (await Promise.race([
                statePromise,
                timeoutPromise,
              ])) as Awaited<ReturnType<typeof findNearbyManufacturers>>;

              if (stateResult?.manufacturers?.length > 0) {
                console.log(
                  `✅ [BROWSE] Found ${stateResult.manufacturers.length} manufacturers in ${state}`,
                );
                searchResult = stateResult;
                break;
              }
            } catch (stateError) {
              console.log(
                `⚠️ [BROWSE] State fallback ${state} failed:`,
                stateError.message,
              );
              continue;
            }
          }
        }
      }

      // Validate final result
      if (!searchResult || typeof searchResult !== "object") {
        throw new Error("Invalid response from manufacturer search");
      }

      if (
        searchResult?.manufacturers &&
        Array.isArray(searchResult.manufacturers) &&
        searchResult.manufacturers.length > 0
      ) {
        console.log(
          `✅ [BROWSE] Final result: ${searchResult.manufacturers?.length || 0} manufacturers found`,
        );

        // Add success message based on the type of search used
        let successMessage = "";
        if (searchResult?.locationSuccess) {
          successMessage = "Showing manufacturers near your location";
        } else if (searchResult?.fallbackUsed) {
          switch (searchResult.fallbackUsed) {
            case "city":
              successMessage = "Showing manufacturers in your city";
              break;
            case "district":
              successMessage = "Showing manufacturers in your district";
              break;
            case "state":
              successMessage = "Showing manufacturers in your state";
              break;
            case "default":
              successMessage = "Showing manufacturers across India";
              break;
          }
        }

        if (successMessage) {
          setSuccessMessage(successMessage);
          setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
        }

        setBrowseManufacturers(searchResult.manufacturers || []);
        setNearbyManufacturers(searchResult.manufacturers || []);
        setShowProductsDialog(true);
        console.log(
          "✅ [BROWSE] Successfully loaded manufacturers and opened dialog",
        );
      } else {
        console.log("❌ [BROWSE] No manufacturers found with any strategy");
        // Still show dialog with empty state to provide user feedback
        setBrowseManufacturers([]);
        setNearbyManufacturers([]);
        setShowProductsDialog(true);
        setError(
          "No manufacturers found in your area. Please try again later or contact support.",
        );
        console.log(
          "ℹ️ [BROWSE] Opened dialog with empty state for user feedback",
        );
      }
    } catch (error) {
      console.error("🚨 [BROWSE] Error in manufacturer search:", error);
      console.error("🚨 [BROWSE] Error details:", {
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
      });

      // Always show dialog, even if empty, to provide user feedback
      setBrowseManufacturers([]);
      setNearbyManufacturers([]);
      setShowProductsDialog(true);
      setError(
        "Unable to load manufacturers. Please check your internet connection and try again.",
      );
      console.log("ℹ️ [BROWSE] Opened dialog with error state");
    } finally {
      setIsBrowseLoading(false);
      console.log(
        "🔍 [BROWSE] Browse operation completed, loading state cleared",
      );
    }
  };

  // Close products dialog
  const handleCloseProductsDialog = () => {
    setShowProductsDialog(false);
  };

  // Splash screen component
  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center animate-fade-in w-full h-full flex flex-col items-center justify-center">
          <div className="mb-8 flex-1 flex items-center justify-center">
            <img
              src="/eentbazaarlogo.svg"
              alt="e-ENT BAZAAR Logo"
              className="max-w-[98%] max-h-[85%] object-contain"
            />
          </div>
          <div className="animate-pulse mb-8">
            <div className="w-16 h-1 bg-redFiredMustard-600 rounded-full mx-auto opacity-80"></div>
          </div>
        </div>
      </div>
    );
  }

  // Custom Header Component for e-ENT BAZAAR
  const EENTHeader = () => (
    <header className="sticky top-0 z-10 bg-white backdrop-blur-sm border-b border-redFiredMustard-200">
      <div className="container mx-auto px-4 py-4">
        <div className="bg-redFiredMustard-50 backdrop-blur-sm rounded-2xl px-6 py-4 border border-redFiredMustard-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-redFiredMustard-100 rounded-xl p-2 border border-redFiredMustard-300">
                <img
                  src="/eentbazaarlogo.svg"
                  alt="e-ENT BAZAAR Logo"
                  className="h-10 w-auto"
                />
              </div>
              <div className="bg-redFiredMustard-100 backdrop-blur-sm rounded-xl px-4 py-2 border border-redFiredMustard-200">
                <h1 className="text-2xl font-extrabold text-redFiredMustard-800 tracking-wide drop-shadow-sm">
                  e-ENT BAZAAR™
                </h1>
                <p className="text-base font-semibold text-redFiredMustard-700 tracking-wide">
                  Quality Bricks at your Click
                </p>
              </div>
            </div>
            <nav className="hidden md:flex gap-3">
              <div className="bg-redFiredMustard-100 backdrop-blur-sm rounded-xl px-1 py-1 border border-redFiredMustard-200 flex gap-1">
                <button
                  onClick={() => navigate("/")}
                  className="px-4 py-2 text-redFiredMustard-700 hover:text-redFiredMustard-800 hover:bg-redFiredMustard-200 transition-all duration-200 font-bold text-base tracking-wide drop-shadow-sm rounded-lg"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    // Create a modal or section to show e-ENT BAZAAR specific about content
                    alert(
                      `${content?.eentAboutTitle || "About e-ENT BAZAAR™"}\n\n${content?.eentAboutDescription || "e-ENT BAZAAR™ is your trusted marketplace for premium quality bricks and construction materials."}`,
                    );
                  }}
                  className="px-4 py-2 text-redFiredMustard-700 hover:text-redFiredMustard-800 hover:bg-redFiredMustard-200 transition-all duration-200 font-bold text-base tracking-wide drop-shadow-sm rounded-lg"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    // Create a modal or section to show e-ENT BAZAAR specific contact content
                    alert(
                      `${content?.eentContactTitle || "Contact e-ENT BAZAAR™"}\n\n${content?.eentContactDescription || "Get in touch with our e-ENT BAZAAR™ team."}\n\nEmail: ${content?.eentContactEmail || "eentbazaar@protonmail.com"}\nPhone: ${content?.eentContactPhone || "+918008009560"}\nAddress: ${content?.eentContactAddress || "e-ENT BAZAAR™ Operations, Saharanpur, UP, India"}\n\nBusiness Hours:\n${content?.eentBusinessHours || "Monday - Saturday: 9:00 AM - 7:00 PM"}`,
                    );
                  }}
                  className="px-4 py-2 text-redFiredMustard-700 hover:text-redFiredMustard-800 hover:bg-redFiredMustard-200 transition-all duration-200 font-bold text-base tracking-wide drop-shadow-sm rounded-lg"
                >
                  Contact
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );

  // Custom Footer Component for e-ENT BAZAAR
  const EENTFooter = () => (
    <footer className="bg-redFiredMustard-50 py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-12">
          {/* Brand Section */}
          <div className="bg-redFiredMustard-100 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-redFiredMustard-200">
            <div className="flex items-center gap-3">
              <img
                src="/eentbazaarlogo.svg"
                alt="e-ENT BAZAAR Logo"
                className="h-12 w-auto"
              />
              <div>
                <h3 className="font-extrabold text-redFiredMustard-800 text-2xl tracking-wide drop-shadow-sm">
                  e-ENT BAZAAR™
                </h3>
                <p className="text-sm font-semibold text-redFiredMustard-700 tracking-wide">
                  BY BHATTA MITRA™
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-bold text-redFiredMustard-700 tracking-wide">
                Quality Bricks at your Click
              </p>
              <p className="text-sm font-medium text-redFiredMustard-600 leading-relaxed max-w-sm">
                Your trusted marketplace for premium quality bricks, tiles and
                others.
              </p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-redFiredMustard-50 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-redFiredMustard-200">
            <h4 className="font-bold text-redFiredMustard-800 text-xl tracking-wide">
              {content?.eentContactTitle || "Contact Us"}
            </h4>
            <p className="text-sm font-medium text-redFiredMustard-600 leading-relaxed">
              {content?.eentContactDescription ||
                "Get in touch with our e-ENT BAZAAR™ team."}
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-redFiredMustard-600"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <span className="font-semibold text-redFiredMustard-700 tracking-wide text-sm break-all">
                  {content?.eentContactEmail || "EENTBAZAAR@PROTONMAIL.COM"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-redFiredMustard-600"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <span className="font-semibold text-redFiredMustard-700 tracking-wide text-sm">
                  {content?.eentContactPhone || "+918008009560"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-redFiredMustard-600"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <span className="font-semibold text-redFiredMustard-600 tracking-wide leading-relaxed text-sm">
                  {content?.eentContactAddress ||
                    "SAHARANPUR, UTTAR PRADESH (UP), INDIA 247232"}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-redFiredMustard-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                </div>
                <div className="font-semibold text-redFiredMustard-700 tracking-wide text-sm">
                  {content?.eentBusinessHours
                    ?.split("\n")
                    .map((line, index) => <div key={index}>{line}</div>) ||
                    "Monday - Saturday: 9:00 AM - 7:00 PM"}
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-redFiredMustard-100 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-redFiredMustard-200">
            <h4 className="font-bold text-redFiredMustard-800 text-xl tracking-wide">
              Follow Us
            </h4>
            <p className="text-sm font-medium text-redFiredMustard-600 leading-relaxed">
              Stay connected with us on social media for updates and news.
            </p>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/bhattamitra"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-redFiredMustard-200 rounded-full transition-all duration-300 hover:bg-redFiredMustard-300 hover:scale-110"
                aria-label="Follow us on Twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#b91c1c"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61574884373376"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-redFiredMustard-200 rounded-full transition-all duration-300 hover:bg-redFiredMustard-300 hover:scale-110"
                aria-label="Follow us on Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/bhattamitra_sint/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-redFiredMustard-200 rounded-full transition-all duration-300 hover:bg-redFiredMustard-300 hover:scale-110"
                aria-label="Follow us on Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/106747205/admin/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-redFiredMustard-200 rounded-full transition-all duration-300 hover:bg-redFiredMustard-300 hover:scale-110"
                aria-label="Follow us on LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b91c1c"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@bhattamitra"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center w-12 h-12 bg-redFiredMustard-200 rounded-full transition-all duration-300 hover:bg-redFiredMustard-300 hover:scale-110"
                aria-label="Follow us on YouTube"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="#b91c1c"
                  className="group-hover:scale-110 transition-transform"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-redFiredMustard-200 mt-12 pt-8">
          <div className="bg-redFiredMustard-100 backdrop-blur-sm rounded-xl p-4 text-center border border-redFiredMustard-200">
            <p className="text-base font-semibold text-redFiredMustard-700 tracking-wide">
              &copy; {new Date().getFullYear()} e-ENT BAZAAR™ BY BHATTA
              MITRA™. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <div className="flex flex-col min-h-screen animate-fade-in">
      <EENTHeader />

      <main className="flex-grow bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-redFiredMustard-800 mb-2">
              Welcome to e-ENT BAZAAR™
            </h1>
            <p className="text-lg text-redFiredMustard-600">
              Quality Bricks at your Click - Your Trusted Marketplace
            </p>
          </div>

          {/* Browse Products Box - Before Authentication */}
          {showBrowseBox && (
            <div className="max-w-4xl mx-auto mb-8">
              <Card className="shadow-xl border-0 overflow-hidden bg-redFiredMustard-50">
                <CardHeader className="bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-bold flex items-center">
                        <Eye className="mr-2 h-6 w-6" />
                        Browse Before You Buy
                      </CardTitle>
                      <CardDescription className="text-white/90 text-base">
                        Explore quality bricks and find manufacturers near you -
                        No sign-up required!
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBrowseBox(false)}
                      className="text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      ×
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left side - Browse Action */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-redFiredMustard-200">
                        <h3 className="font-semibold text-redFiredMustard-800 mb-2 flex items-center">
                          <Search className="mr-2 h-5 w-5 text-redFiredMustard-600" />
                          Discover Quality Bricks
                        </h3>
                        <p className="text-redFiredMustard-600 text-sm mb-4">
                          Browse our extensive collection of premium bricks from
                          verified manufacturers across India and Nepal.
                        </p>
                        <Button
                          onClick={handleBrowseManufacturers}
                          disabled={isBrowseLoading}
                          className="w-full bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 hover:from-redFiredMustard-700 hover:to-redFiredMustard-800 text-white font-semibold"
                        >
                          {isBrowseLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Finding Products...
                            </>
                          ) : (
                            <>
                              <Search className="mr-2 h-4 w-4" />
                              Browse Products Now
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Right side - Location Benefits */}
                    <div className="space-y-4">
                      <div className="bg-white rounded-lg p-4 shadow-sm border border-redFiredMustard-200">
                        <h3 className="font-semibold text-redFiredMustard-800 mb-2 flex items-center">
                          <MapPin className="mr-2 h-5 w-5 text-redFiredMustard-600" />
                          Find Nearby Manufacturers
                        </h3>
                        <p className="text-redFiredMustard-600 text-sm mb-3">
                          Get location-based recommendations to find the closest
                          brick manufacturers and save on transportation costs.
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-redFiredMustard-600">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Compare prices from multiple suppliers
                          </div>
                          <div className="flex items-center text-sm text-redFiredMustard-600">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            View product specifications
                          </div>
                          <div className="flex items-center text-sm text-redFiredMustard-600">
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                            Check manufacturer ratings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      💡 <strong>Pro Tip:</strong> Browse products first to make
                      informed decisions, then sign up to place orders and
                      contact manufacturers directly.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-xl border-0 overflow-hidden bg-redFiredMustard-50">
              <CardHeader className="bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {step === "phone" && "Sign In / Register"}
                      {step === "otp" && "Verify OTP"}
                      {step === "register" && "Complete Registration"}
                    </CardTitle>
                    <CardDescription className="text-white/90 text-base">
                      {step === "phone" &&
                        "Enter your phone number to get started"}
                      {step === "otp" &&
                        "Enter the 6-digit code sent to your phone"}
                      {step === "register" &&
                        "Complete your profile to access e-ENT BAZAAR"}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                    {error.includes("USER ALREADY EXISTS") ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg mb-1">
                          User Already Exists
                        </span>
                        <span>
                          {error.replace("USER ALREADY EXISTS: ", "")}
                        </span>
                      </div>
                    ) : error.includes("environment variables") ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-lg mb-1">
                          Configuration Error
                        </span>
                        <span className="mb-2">{error}</span>
                        <span className="text-sm">
                          Please contact support if this issue persists.
                        </span>
                      </div>
                    ) : (
                      error
                    )}
                  </div>
                )}

                {successMessage && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
                    {successMessage}
                  </div>
                )}

                {step === "phone" && (
                  <div>
                    <div className="flex justify-center gap-4 mb-6">
                      <Button
                        variant="outline"
                        className="flex-1 border-redFiredMustard-600 text-redFiredMustard-600 hover:bg-redFiredMustard-50"
                        onClick={() => setAuthMode("signin")}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-redFiredMustard-600 text-redFiredMustard-600 hover:bg-redFiredMustard-50"
                        onClick={() => setAuthMode("register")}
                      >
                        Register
                      </Button>
                    </div>

                    <div className="text-center mb-4">
                      <p className="text-sm text-muted-foreground">
                        {authMode === "signin"
                          ? "Sign in to your existing account"
                          : "Create a new account"}
                      </p>
                    </div>

                    <Form {...phoneForm}>
                      <form
                        onSubmit={phoneForm.handleSubmit(onPhoneSubmit)}
                        className="space-y-4"
                      >
                        <div className="space-y-4">
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
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Select country code" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="+91">
                                      India (+91)
                                    </SelectItem>
                                    <SelectItem value="+977">
                                      Nepal (+977)
                                    </SelectItem>
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
                                  <Input {...field} />
                                </FormControl>
                                <FormDescription>
                                  We'll send a one-time password to this number
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white font-semibold"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              {authMode === "signin" ? "Sign In" : "Register"}
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </form>
                    </Form>
                  </div>
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
                            className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white font-semibold"
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
                            className={`text-sm ${countdown > 0 ? "text-gray-400" : "text-redFiredMustard-600 hover:text-redFiredMustard-700 font-medium"}`}
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

                {step === "register" && (
                  <div className="py-4">
                    <p className="mb-4 text-center font-medium text-green-600">
                      Your phone number has been verified!
                    </p>
                    <p className="mb-4 text-center">
                      Please complete your registration to access e-ENT BAZAAR.
                    </p>
                    <RegistrationForm
                      phone={phone}
                      countryCode={phoneForm.getValues().countryCode}
                      onSuccess={handleRegistrationSuccess}
                      onError={handleRegistrationError}
                    />
                  </div>
                )}

                {step === "success" && (
                  <div className="text-center py-4">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-xl font-medium text-green-700 mb-2">
                      Success!
                    </h3>
                    <p className="mb-6">
                      {successMessage ||
                        "You have successfully logged in to e-ENT BAZAAR."}
                    </p>
                    <Button
                      className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white font-semibold"
                      onClick={() => {
                        // Store customerId in localStorage before navigating
                        if (customerId) {
                          localStorage.setItem("customerId", customerId);
                        }
                        navigate("/end-user-dashboard");
                      }}
                    >
                      Continue to Dashboard
                    </Button>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-center border-t pt-4">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy
                  Policy
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>

      <EENTFooter />

      {/* Products Dialog */}
      <Dialog open={showProductsDialog} onOpenChange={setShowProductsDialog}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Search className="mr-2 h-5 w-5 text-redFiredMustard-600" />
              Quality Bricks & Manufacturers Near You
            </DialogTitle>
            <DialogDescription>
              Explore premium brick options from verified manufacturers. Based
              on your location, we've found these trusted suppliers near you.
            </DialogDescription>
          </DialogHeader>
          <BrowseErrorBoundary>
            <MatchedProducts
              manufacturers={nearbyManufacturers}
              isLoading={isLoadingManufacturers || isBrowseLoading}
              onClose={handleCloseProductsDialog}
              customerId={customerId}
            />
          </BrowseErrorBoundary>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EENTMarketPage;
