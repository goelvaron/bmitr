import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MatchedProducts from "@/components/MatchedProducts";
import {
  findNearbyManufacturers,
  type Manufacturer,
  type Product,
} from "@/services/productMatchingService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  X,
  UserCircle,
  Settings,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  indianStatesDistricts,
  getDistrictsByState,
} from "@/data/indian_states_districts";
import { getManufacturerProducts } from "@/services/productService";
import CustomerQuotationList from "@/components/CustomerQuotationList";
import PlaceOrderDialog from "@/components/PlaceOrderDialog";

import { haversineDistance } from "@/utils/haversine";
import CustomerOrderManagement from "@/components/CustomerOrderManagement";
import CustomerInquiryList from "@/components/CustomerInquiryList";

type LocalManufacturerLocation = {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  district: string;
  pincode: string;
};

type LocalManufacturer = {
  id: string;
  name: string;
  products: any[];
  location: LocalManufacturerLocation;
  distance?: number;
};

const EndUserDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [manufacturers, setManufacturers] = useState<LocalManufacturer[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userData, setUserData] = useState<any>(null);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

  // Advanced filtering states
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 20]);
  const [selectedProductTypes, setSelectedProductTypes] = useState<string[]>(
    [],
  );
  const [selectedCity, setSelectedCity] = useState<string>("__all__");
  const [selectedState, setSelectedState] = useState<string>("__all__");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("__all__");
  const [selectedPincode, setSelectedPincode] = useState<string>("");
  const [filtersVisible, setFiltersVisible] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("marketplace");
  const [disableDistanceLimit, setDisableDistanceLimit] =
    useState<boolean>(false);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearMeActive, setNearMeActive] = useState(false);
  const [nearMeManufacturers, setNearMeManufacturers] = useState<
    LocalManufacturer[] | null
  >(null);
  const NEAR_ME_RADIUS_KM = 100;
  const [totalManufacturerCount, setTotalManufacturerCount] =
    useState<number>(0);

  useEffect(() => {
    // Check if user is logged in and get user data
    const getUserData = async () => {
      try {
        // Get customer ID from URL params or localStorage
        const params = new URLSearchParams(location.search);
        const customerId =
          params.get("customerId") || localStorage.getItem("customerId");

        if (!customerId) {
          // Redirect to login if no customer ID
          navigate("/e-ent-bazaar");
          return;
        }

        // Store customerId in localStorage for future use
        localStorage.setItem("customerId", customerId);

        // Fetch user data from Supabase
        const { data, error } = await supabase
          .from("endcustomers")
          .select("*")
          .eq("id", customerId)
          .single();

        if (error || !data) {
          console.error("Error fetching user data:", error);
          navigate("/e-ent-bazaar");
          return;
        }

        setUserData(data);

        // Set initial state and district if user has them
        if (data.state) {
          setSelectedState(data.state);
          if (data.state && data.country === "India") {
            setAvailableDistricts(getDistrictsByState(data.state));
          }
        } else {
          setSelectedState("__all__");
        }

        if (data.district) {
          setSelectedDistrict(data.district);
        } else {
          setSelectedDistrict("__all__");
        }

        if (data.city) {
          setSelectedCity(data.city);
        } else {
          setSelectedCity("__all__");
        }

        if (data.pin_code) {
          setSelectedPincode(data.pin_code);
        }
      } catch (error) {
        console.error("Error in getUserData:", error);
        navigate("/e-ent-bazaar");
      }
    };

    getUserData();
    // Do NOT call loadManufacturers here
  }, [navigate, location]);

  // New effect: load manufacturers only after userData is loaded
  useEffect(() => {
    if (userData && userData.latitude && userData.longitude) {
      loadManufacturers();
    }
  }, [userData]);

  // Update available districts when state changes
  useEffect(() => {
    if (selectedState && userData?.country === "India") {
      setAvailableDistricts(getDistrictsByState(selectedState));
      setSelectedDistrict("__all__");
    }
  }, [selectedState, userData?.country]);

  const handleNearMe = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        setNearMeActive(true);
        // Clear all filters
        setSelectedProductTypes([]);
        setSelectedState("__all__");
        setSelectedDistrict("__all__");
        setSelectedCity("__all__");
        setSelectedPincode("");
        setMaxDistance(100);
        setPriceRange([0, 20]);
        // Filter manufacturers within radius
        filterManufacturersNearMe(
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        toast({
          title: "Location Error",
          description:
            "Could not get your current location. Using profile location instead.",
          variant: "destructive",
        });
        setIsLocating(false);
        setNearMeActive(false);
        setNearMeManufacturers(null);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const filterManufacturersNearMe = (lat: number, lng: number) => {
    const filtered = manufacturers.filter((m) => {
      const manuLat = m.location.latitude;
      const manuLng = m.location.longitude;

      // Calculate distance for all manufacturers
      const dist =
        manuLat && manuLng
          ? haversineDistance(lat, lng, manuLat, manuLng)
          : 999;
      m.distance = dist;

      // Always include featured manufacturers regardless of distance or coordinates
      if (m.is_featured) {
        return true;
      }

      // For non-featured manufacturers, require valid coordinates and apply distance filter
      if (!manuLat || !manuLng) return false;
      return dist <= NEAR_ME_RADIUS_KM;
    });
    setNearMeManufacturers(filtered);
    if (filtered.length === 0) {
      toast({
        title: "No Nearby Manufacturers",
        description: `No manufacturers found within ${NEAR_ME_RADIUS_KM} km of your location.`,
        variant: "destructive",
      });
    }
  };

  const handleClearNearMe = () => {
    setNearMeActive(false);
    setNearMeManufacturers(null);
    // Optionally, reload manufacturers or restore filters
  };

  const fetchTotalManufacturerCount = async () => {
    try {
      const { count, error } = await supabase
        .from("manufacturers")
        .select("*", { count: "exact", head: true });

      if (error) {
        console.error("Error fetching manufacturer count:", error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error("Error in fetchTotalManufacturerCount:", error);
      return 0;
    }
  };

  const loadManufacturers = async (
    overrideLat?: number,
    overrideLng?: number,
  ) => {
    setIsLoading(true);
    try {
      // Fetch total manufacturer count
      const totalCount = await fetchTotalManufacturerCount();
      setTotalManufacturerCount(totalCount);

      // Fetch all manufacturers except rejected ones
      const { data: allOwners, error: allOwnersError } = await supabase
        .from("manufacturers")
        .select("*");

      if (allOwnersError) {
        console.error("Error fetching all manufacturers:", allOwnersError);
        throw allOwnersError;
      }

      // Filter out rejected manufacturers and test entries
      let ownersToUse = (allOwners || []).filter((manufacturer) => {
        // Exclude rejected manufacturers
        if (manufacturer.status === "rejected") {
          return false;
        }
        // Exclude test entries
        if (manufacturer.is_test_entry === true) {
          return false;
        }
        return true;
      });

      console.log(
        `Found ${ownersToUse?.length || 0} manufacturers to display out of ${totalCount} total (excluding rejected and test entries):`,
        ownersToUse?.map((m) => ({
          id: m.id,
          name: m.company_name || m.name,
          status: m.status,
          is_test_entry: m.is_test_entry,
        })),
      );

      // Log status breakdown for debugging
      const statusBreakdown = (allOwners || []).reduce(
        (acc, m) => {
          const status = m.status || "null";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );
      console.log("Status breakdown of all manufacturers:", statusBreakdown);

      const testEntryCount = (allOwners || []).filter(
        (m) => m.is_test_entry === true,
      ).length;
      console.log(`Test entries excluded: ${testEntryCount}`);
      console.log(
        `Rejected manufacturers excluded: ${statusBreakdown["rejected"] || 0}`,
      );

      if (!ownersToUse || ownersToUse.length === 0) {
        console.log("No manufacturers found in database");
        setManufacturers([]);
        setIsLoading(false);
        return;
      }

      // Get customer lat/lng (use override if provided)
      const customerLat =
        overrideLat !== undefined
          ? overrideLat
          : userData?.latitude
            ? parseFloat(userData.latitude)
            : null;
      const customerLng =
        overrideLng !== undefined
          ? overrideLng
          : userData?.longitude
            ? parseFloat(userData.longitude)
            : null;

      const formattedManufacturers = await Promise.all(
        ownersToUse.map(async (owner) => {
          let realProducts = [];
          try {
            const { data: fetchedProducts, error } =
              await getManufacturerProducts(owner.id);
            if (!error && fetchedProducts) {
              realProducts = fetchedProducts;
            }
          } catch (err) {
            console.error(
              "Error fetching products for manufacturer",
              owner.id,
              err,
            );
          }
          // Calculate distance if both customer and manufacturer have lat/lng
          let distance = 0;
          const manuLat = owner.latitude
            ? parseFloat(String(owner.latitude))
            : null;
          const manuLng = owner.longitude
            ? parseFloat(String(owner.longitude))
            : null;
          if (
            customerLat !== null &&
            customerLng !== null &&
            manuLat !== null &&
            manuLng !== null &&
            !isNaN(customerLat) &&
            !isNaN(customerLng) &&
            !isNaN(manuLat) &&
            !isNaN(manuLng)
          ) {
            distance = haversineDistance(
              customerLat,
              customerLng,
              manuLat,
              manuLng,
            );
          } else {
            // If coordinates are missing, set a default distance that won't filter out the manufacturer
            distance = 50; // Default distance in km
          }
          return {
            id: owner.id,
            name: owner.company_name || owner.name || "Brick Manufacturer",
            products: realProducts,
            location: {
              latitude: manuLat || 0,
              longitude: manuLng || 0,
              address: owner.additional_info || "",
              city: owner.city || "",
              state: owner.state || "",
              district: owner.district || "",
              pincode: owner.pincode || "",
            },
            distance,
            is_featured: owner.is_featured || false,
          };
        }),
      );

      console.log(
        "Formatted brick owners with real products:",
        formattedManufacturers,
      );

      // Sort manufacturers to show featured ones first, then by distance
      const sortedManufacturers = formattedManufacturers.sort((a, b) => {
        // Featured manufacturers come first
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;

        // If both have same featured status, sort by distance
        return a.distance - b.distance;
      });

      setManufacturers(sortedManufacturers);

      // If you want to implement location-based filtering, do it here using formattedManufacturers only
    } catch (error) {
      console.error("Error loading manufacturers:", error);
      // Show empty list instead of falling back to mock data
      setManufacturers([]);

      toast({
        title: "Error",
        description:
          "Failed to load manufacturer data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract all available product types and location data for filters
  const allProductTypes = Array.from(
    new Set(
      manufacturers.flatMap((m) => m.products.map((p) => p.name.split(" ")[0])),
    ),
  );

  const allCities = Array.from(
    new Set(manufacturers.map((m) => m.location.city).filter(Boolean)),
  );

  const allStates = Array.from(
    new Set(manufacturers.map((m) => m.location.state).filter(Boolean)),
  );

  // Districts would typically come from a data source based on selected state
  // For now, we'll just extract them from manufacturers
  const allDistricts = selectedState
    ? Array.from(
        new Set(
          manufacturers
            .filter((m) => m.location.state === selectedState)
            .map((m) => m.location.city)
            .filter(Boolean),
        ),
      ) // Using city as district for now
    : [];

  // Update active filters whenever filter values change
  useEffect(() => {
    const newActiveFilters: string[] = [];

    if (maxDistance < 100 && !disableDistanceLimit) {
      newActiveFilters.push(`Distance: ${maxDistance}km`);
    }

    if (disableDistanceLimit) {
      newActiveFilters.push(`Distance: Unlimited`);
    }

    if (priceRange[0] > 0 || priceRange[1] < 20) {
      newActiveFilters.push(`Price: ₹${priceRange[0]}-₹${priceRange[1]}`);
    }

    if (selectedProductTypes.length > 0) {
      newActiveFilters.push(`Types: ${selectedProductTypes.length} selected`);
    }

    if (selectedState && selectedState !== "__all__") {
      newActiveFilters.push(`State: ${selectedState}`);
    }

    if (selectedDistrict && selectedDistrict !== "__all__") {
      newActiveFilters.push(`District: ${selectedDistrict}`);
    }

    if (selectedCity && selectedCity !== "__all__") {
      newActiveFilters.push(`City: ${selectedCity}`);
    }

    if (selectedPincode) {
      newActiveFilters.push(`Pin Code: ${selectedPincode}`);
    }

    setActiveFilters(newActiveFilters);
  }, [
    maxDistance,
    priceRange,
    selectedProductTypes,
    selectedState,
    selectedDistrict,
    selectedCity,
    selectedPincode,
    disableDistanceLimit,
  ]);

  // Apply all filters to manufacturers
  const filteredManufacturers = manufacturers.filter((manufacturer) => {
    // ALWAYS include featured manufacturers regardless of any filters
    if (manufacturer.is_featured) {
      return true;
    }

    const searchLower = searchQuery.toLowerCase();

    // Normalize manufacturer fields for comparison
    const mName = manufacturer.name?.toLowerCase() || "";
    const mState = manufacturer.location.state?.toLowerCase() || "";
    const mDistrict = manufacturer.location.district?.toLowerCase() || "";
    const mCity = manufacturer.location.city?.toLowerCase() || "";
    const mPincode = manufacturer.location.pincode?.toLowerCase() || "";
    const mAddress = manufacturer.location.address?.toLowerCase() || "";
    const mProducts = manufacturer.products || [];

    // Basic search filter
    const matchesSearch =
      searchQuery === "" ||
      mName.includes(searchLower) ||
      mCity.includes(searchLower) ||
      mState.includes(searchLower) ||
      mProducts.some(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower),
      );

    if (!matchesSearch) return false;

    // Check if all filters are at their default values
    const noFilters =
      (maxDistance === 100 || disableDistanceLimit) &&
      priceRange[0] === 0 &&
      priceRange[1] === 20 &&
      selectedProductTypes.length === 0 &&
      (selectedState === "__all__" || !selectedState) &&
      (selectedDistrict === "__all__" || !selectedDistrict) &&
      (selectedCity === "__all__" || !selectedCity) &&
      !selectedPincode;

    // If no filters are applied, show all manufacturers that match the search
    if (noFilters) return true;

    // Distance filter - only apply if distance limit is not disabled
    if (!disableDistanceLimit) {
      if (
        manufacturer.distance &&
        !isNaN(manufacturer.distance) &&
        manufacturer.distance > 0 &&
        manufacturer.distance !== 50 && // Don't filter out default distance
        manufacturer.distance > maxDistance
      ) {
        return false;
      }
    }

    // State filter - only apply if a specific state is selected
    if (selectedState && selectedState !== "__all__") {
      if (mState !== selectedState.toLowerCase()) {
        return false;
      }
    }

    // District filter - only apply if a specific district is selected
    if (selectedDistrict && selectedDistrict !== "__all__") {
      if (mDistrict !== selectedDistrict.toLowerCase()) {
        return false;
      }
    }

    // City filter - only apply if a specific city is selected
    if (selectedCity && selectedCity !== "__all__") {
      if (mCity !== selectedCity.toLowerCase()) {
        return false;
      }
    }

    // Pin code filter - only apply if a pincode is entered
    if (selectedPincode) {
      if (
        mPincode !== selectedPincode.toLowerCase() &&
        !mAddress.includes(selectedPincode.toLowerCase())
      ) {
        return false;
      }
    }

    // Product type filter - only apply if specific product types are selected
    if (selectedProductTypes.length > 0) {
      // If manufacturer has no products, don't filter them out
      if (mProducts.length === 0) {
        return true;
      }

      const hasMatchingProductType = mProducts.some((product) =>
        selectedProductTypes.some((type) =>
          product.name?.toLowerCase().includes(type.toLowerCase()),
        ),
      );
      if (!hasMatchingProductType) return false;
    }

    // Price range filter - only apply if price range is not at default values
    if (priceRange[0] !== 0 || priceRange[1] !== 20) {
      // If manufacturer has no products, don't filter them out
      if (mProducts.length === 0) {
        return true;
      }

      const hasValidPrices = mProducts.some(
        (product) => product.price && !isNaN(product.price),
      );

      // If no valid prices, don't filter out
      if (!hasValidPrices) {
        return true;
      }

      const hasProductInPriceRange = mProducts.some(
        (product) =>
          product.price &&
          !isNaN(product.price) &&
          product.price >= priceRange[0] &&
          product.price <= priceRange[1],
      );

      if (!hasProductInPriceRange) return false;
    }

    return true;
  });

  // Sort filtered manufacturers to ensure featured ones are always at the top
  const sortedFilteredManufacturers = filteredManufacturers.sort((a, b) => {
    // Featured manufacturers come first
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;

    // If both have same featured status, sort by distance
    return (a.distance || 0) - (b.distance || 0);
  });

  console.log(
    `Filtered manufacturers: ${sortedFilteredManufacturers.length} out of ${manufacturers.length}`,
  );
  console.log("Active filters:", {
    maxDistance,
    disableDistanceLimit,
    priceRange,
    selectedProductTypes,
    selectedState,
    selectedDistrict,
    selectedCity,
    selectedPincode,
  });
  console.log(
    "All manufacturers:",
    manufacturers.map((m) => ({
      id: m.id,
      name: m.name,
      distance: m.distance,
      hasProducts: m.products?.length > 0,
      productCount: m.products?.length || 0,
      is_featured: m.is_featured,
    })),
  );
  console.log(
    "Filtered manufacturers:",
    sortedFilteredManufacturers.map((m) => ({
      id: m.id,
      name: m.name,
      distance: m.distance,
      hasProducts: m.products?.length > 0,
      productCount: m.products?.length || 0,
      is_featured: m.is_featured,
    })),
  );

  // Handle profile actions
  const handleViewProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile");
  };

  const handleEditProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile/edit");
  };

  const handlePlaceOrderFromQuotation = (quotation: any) => {
    setSelectedQuotation(quotation);
    setOrderDialogOpen(true);
  };

  const handleConfirmOrder = async (address: string, contact: string) => {
    if (!selectedQuotation || !userData) return;
    const orderData = {
      customer_id: userData.id, // Use the current user's ID instead of quotation's customer_id
      manufacturer_id: selectedQuotation.manufacturer_id,
      product_id: selectedQuotation.product_id,
      quantity: selectedQuotation.quantity,
      price: selectedQuotation.quoted_price,
      total_amount:
        selectedQuotation.total ||
        selectedQuotation.quoted_price * selectedQuotation.quantity,
      delivery_address: address,
      contact_number: contact,
      status: "pending",
    };
    try {
      const { data: result, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to save order: ${orderError.message}`);
      }

      if (result) {
        setOrderDialogOpen(false);
        setSelectedQuotation(null);
        toast({
          title: "Order Placed!",
          description: "Your order has been placed successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Failed to save order");
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancelOrder = () => {
    setOrderDialogOpen(false);
    setSelectedQuotation(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
      />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-redFiredMustard-800 mb-2">
              e-ENT Bazaar Dashboard
            </h1>
            {userData && (
              <p className="text-redFiredMustard-700">
                Welcome, <span className="font-semibold">{userData.name}</span>!
                Find and connect with brick manufacturers near you
              </p>
            )}
          </div>

          {/* User profile menu */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 hover:bg-redFiredMustard-100 text-redFiredMustard-700"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <UserCircle className="h-5 w-5" />
              {userData?.name?.split(" ")[0] || "Profile"}
            </Button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 py-1">
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-redFiredMustard-700 hover:bg-redFiredMustard-50"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile");
                  }}
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  View Profile
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-redFiredMustard-700 hover:bg-redFiredMustard-50"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/profile/edit");
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </button>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-redFiredMustard-800 hover:bg-redFiredMustard-50"
                  onClick={() => {
                    localStorage.removeItem("customerId");
                    navigate("/e-ent-bazaar");
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search and filter section */}
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for manufacturers, products, or locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex items-center gap-2 border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                onClick={nearMeActive ? handleClearNearMe : handleNearMe}
                disabled={isLocating}
              >
                <MapPin className="h-4 w-4" />
                {isLocating
                  ? "Locating..."
                  : nearMeActive
                    ? "Clear Near Me"
                    : "Near Me"}
              </Button>
              <Popover open={filtersVisible} onOpenChange={setFiltersVisible}>
                <PopoverTrigger asChild>
                  <Button
                    variant={activeFilters.length > 0 ? "default" : "outline"}
                    className={`flex items-center gap-2 ${activeFilters.length > 0 ? "bg-redFiredMustard-600 hover:bg-redFiredMustard-700" : "border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"}`}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters{" "}
                    {activeFilters.length > 0 && `(${activeFilters.length})`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Filters</h3>

                    {/* Distance filter */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Maximum Distance</Label>
                        <span className="text-sm text-gray-500">
                          {disableDistanceLimit
                            ? "Unlimited"
                            : `${maxDistance.toFixed(2)} km`}
                        </span>
                      </div>
                      <Slider
                        defaultValue={[maxDistance]}
                        max={100}
                        step={5}
                        onValueChange={(value) => setMaxDistance(value[0])}
                        disabled={disableDistanceLimit}
                      />
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="disable-distance"
                          checked={disableDistanceLimit}
                          onCheckedChange={(checked) =>
                            setDisableDistanceLimit(checked as boolean)
                          }
                        />
                        <Label htmlFor="disable-distance" className="text-sm">
                          Disable distance limit
                        </Label>
                      </div>
                    </div>

                    {/* Price range filter */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label>Price Range (₹)</Label>
                        <span className="text-sm text-gray-500">
                          ₹{priceRange[0]} - ₹{priceRange[1]}
                        </span>
                      </div>
                      <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={(value) =>
                          setPriceRange([value[0], value[1]])
                        }
                      />
                    </div>

                    {/* State filter */}
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Select
                        value={selectedState || "__all__"}
                        onValueChange={(value) => {
                          setSelectedState(value);
                          setSelectedDistrict("__all__");
                          setSelectedCity("__all__");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All States</SelectItem>
                          {allStates.map((state) => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* District filter */}
                    <div className="space-y-2">
                      <Label>District</Label>
                      <Select
                        value={selectedDistrict || "__all__"}
                        onValueChange={(value) => {
                          setSelectedDistrict(value);
                          setSelectedCity("__all__");
                        }}
                        disabled={selectedState === "__all__"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a district" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Districts</SelectItem>
                          {allDistricts.map((district) => (
                            <SelectItem key={district} value={district}>
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* City filter */}
                    <div className="space-y-2">
                      <Label>City</Label>
                      <Select
                        value={selectedCity || "__all__"}
                        onValueChange={setSelectedCity}
                        disabled={selectedState === "__all__"}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a city" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">All Cities</SelectItem>
                          {allCities
                            .filter((city) => {
                              // Filter cities based on selected state and district
                              const cityManufacturer = manufacturers.find(
                                (m) => m.location.city === city,
                              );
                              if (!cityManufacturer) return false;

                              if (
                                selectedState !== "__all__" &&
                                cityManufacturer.location.state !==
                                  selectedState
                              ) {
                                return false;
                              }

                              if (
                                selectedDistrict !== "__all__" &&
                                city !== selectedDistrict
                              ) {
                                return false;
                              }

                              return true;
                            })
                            .map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pin code filter */}
                    <div className="space-y-2">
                      <Label>Pin Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter pin code"
                        value={selectedPincode}
                        onChange={(e) => setSelectedPincode(e.target.value)}
                      />
                    </div>

                    {/* Product type filter */}
                    <div className="space-y-2">
                      <Label>Product Types</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {allProductTypes.map((type) => (
                          <div
                            key={type}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedProductTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedProductTypes([
                                    ...selectedProductTypes,
                                    type,
                                  ]);
                                } else {
                                  setSelectedProductTypes(
                                    selectedProductTypes.filter(
                                      (t) => t !== type,
                                    ),
                                  );
                                }
                              }}
                            />
                            <Label htmlFor={`type-${type}`} className="text-sm">
                              {type}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reset filters */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setMaxDistance(100);
                        setPriceRange([0, 20]);
                        setSelectedProductTypes([]);
                        setSelectedState("__all__");
                        setSelectedDistrict("__all__");
                        setSelectedCity("__all__");
                        setSelectedPincode("");
                        setDisableDistanceLimit(false);
                        setFiltersVisible(false);
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                onClick={() => loadManufacturers()}
                className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {activeFilters.map((filter, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {filter}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => {
                      // Remove this specific filter
                      if (filter.startsWith("Distance")) {
                        setMaxDistance(100);
                        setDisableDistanceLimit(false);
                      }
                      if (filter.startsWith("Price")) setPriceRange([0, 20]);
                      if (filter.startsWith("Types"))
                        setSelectedProductTypes([]);
                      if (filter.startsWith("State"))
                        setSelectedState("__all__");
                      if (filter.startsWith("District"))
                        setSelectedDistrict("__all__");
                      if (filter.startsWith("City")) setSelectedCity("__all__");
                      if (filter.startsWith("Pin Code")) setSelectedPincode("");
                    }}
                  />
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2"
                onClick={() => {
                  setMaxDistance(100);
                  setPriceRange([0, 20]);
                  setSelectedProductTypes([]);
                  setSelectedState("__all__");
                  setSelectedDistrict("__all__");
                  setSelectedCity("__all__");
                  setSelectedPincode("");
                  setDisableDistanceLimit(false);
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </div>

        {/* Manufacturers list */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex gap-4">
              <Button
                variant={activeTab === "marketplace" ? "default" : "outline"}
                className={
                  activeTab === "marketplace"
                    ? "bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                    : "border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                }
                onClick={() => setActiveTab("marketplace")}
              >
                Marketplace
              </Button>
              <Button
                variant={activeTab === "orders" ? "default" : "outline"}
                className={
                  activeTab === "orders"
                    ? "bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                    : "border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                }
                onClick={() => setActiveTab("orders")}
              >
                Orders
              </Button>
              <Button
                variant={activeTab === "quotations" ? "default" : "outline"}
                className={
                  activeTab === "quotations"
                    ? "bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                    : "border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                }
                onClick={() => setActiveTab("quotations")}
              >
                Quotations
              </Button>
              <Button
                variant={activeTab === "inquiries" ? "default" : "outline"}
                className={
                  activeTab === "inquiries"
                    ? "bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                    : "border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                }
                onClick={() => setActiveTab("inquiries")}
              >
                Inquiries
              </Button>
            </div>
            {activeTab === "marketplace" && (
              <div className="text-sm text-redFiredMustard-700 bg-redFiredMustard-50 px-3 py-2 rounded-lg border border-redFiredMustard-200">
                <span className="font-medium">Total Manufacturers:</span>{" "}
                {totalManufacturerCount}
                {nearMeActive && nearMeManufacturers !== null && (
                  <span className="ml-2 text-redFiredMustard-800">
                    | Nearby: {nearMeManufacturers.length}
                  </span>
                )}
                {!nearMeActive && (
                  <span className="ml-2 text-redFiredMustard-800">
                    | Showing: {sortedFilteredManufacturers.length}
                  </span>
                )}
              </div>
            )}
          </div>
          {activeTab === "marketplace" && (
            <>
              {nearMeActive && (
                <div className="mb-4 flex flex-col items-center justify-center">
                  <span className="text-base text-redFiredMustard-800 font-medium text-center bg-redFiredMustard-50 px-4 py-2 rounded shadow-sm border border-redFiredMustard-200">
                    Showing manufacturers within {NEAR_ME_RADIUS_KM} km of your
                    current location.
                  </span>
                </div>
              )}
              <MatchedProducts
                manufacturers={
                  nearMeActive && nearMeManufacturers !== null
                    ? nearMeManufacturers.sort((a, b) => {
                        // Featured manufacturers come first
                        if (a.is_featured && !b.is_featured) return -1;
                        if (!a.is_featured && b.is_featured) return 1;
                        // If both have same featured status, sort by distance
                        return (a.distance || 0) - (b.distance || 0);
                      })
                    : sortedFilteredManufacturers
                }
                isLoading={isLoading}
                onClose={() => {}}
                customerId={userData?.id || null}
              />
            </>
          )}
          {activeTab === "orders" && userData && (
            <CustomerOrderManagement customerId={userData.id} />
          )}
          {activeTab === "quotations" && userData && (
            <>
              <CustomerQuotationList
                customerId={userData.id}
                onPlaceOrder={handlePlaceOrderFromQuotation}
              />
              <PlaceOrderDialog
                open={orderDialogOpen}
                onOpenChange={setOrderDialogOpen}
                quotation={selectedQuotation}
                onConfirm={handleConfirmOrder}
                onCancel={handleCancelOrder}
                initialAddress={userData?.address || ""}
                initialContact={userData?.phone || ""}
                customerId={userData?.id}
              />
            </>
          )}
          {activeTab === "inquiries" && userData && (
            <CustomerInquiryList customerId={userData.id} />
          )}
        </div>
      </main>

      <Footer
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
      />
    </div>
  );
};

export default EndUserDashboard;
