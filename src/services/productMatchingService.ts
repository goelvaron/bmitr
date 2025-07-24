import { supabase } from "@/lib/supabase";

// Product data with location information
interface Manufacturer {
  id: string;
  name: string;
  products: Product[];
  location: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    state: string;
  };
  distance?: number; // Will be calculated based on user location
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

/**
 * Calculate distance between two coordinates using the Haversine formula
 */
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Get user's current location using browser geolocation API
 */
export const getUserLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      });
    }
  });
};

/**
 * Fetch manufacturers and their products from Supabase
 */
const fetchManufacturersFromSupabase = async (): Promise<Manufacturer[]> => {
  try {
    // First, let's check total manufacturers in database for debugging
    const { count: totalCount } = await supabase
      .from("manufacturers")
      .select("*", { count: "exact", head: true });

    console.log("🔍 Total manufacturers in database:", totalCount);

    // Fetch manufacturers with their location data
    const { data: manufacturersData, error: manufacturersError } =
      await supabase.from("manufacturers").select(
        `
        id,
        name: company_name,
        city,
        state,
        district,
        latitude,
        longitude,
        status,
        is_test_entry
      `,
      );
    // Removed the filters to get all manufacturers first

    if (manufacturersError) {
      console.error("Error fetching manufacturers:", manufacturersError);
      return [];
    }

    console.log(
      "🔍 Raw manufacturers data:",
      manufacturersData?.length,
      "manufacturers found",
    );
    console.log("🔍 Sample manufacturer:", manufacturersData?.[0]);

    if (!manufacturersData || manufacturersData.length === 0) {
      console.log("No manufacturers found in database");
      return [];
    }

    // Filter for active manufacturers (but be more flexible)
    const activeManufacturers = manufacturersData
      .filter(
        (m) => m.status === "active" || m.status === "approved" || !m.status,
      )
      .filter(
        (m) =>
          !m.is_test_entry ||
          m.is_test_entry === false ||
          m.is_test_entry === null,
      );

    console.log(
      "🔍 Active manufacturers after filtering:",
      activeManufacturers.length,
    );

    if (activeManufacturers.length === 0) {
      console.log("No active manufacturers found after filtering");
      // Return all manufacturers if no active ones found
      console.log("🔍 Returning all manufacturers instead");
    }

    const manufacturersToUse =
      activeManufacturers.length > 0 ? activeManufacturers : manufacturersData;

    // Fetch products for all manufacturers
    const { data: productsData, error: productsError } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        image_url,
        manufacturer_id,
        is_available
      `,
      );
    // Removed is_available filter to get all products first

    if (productsError) {
      console.error("Error fetching products:", productsError);
    }

    console.log("🔍 Total products found:", productsData?.length || 0);

    // Filter for available products (but be more flexible)
    const availableProducts = (productsData || []).filter(
      (p) =>
        p.is_available === true ||
        p.is_available === null ||
        p.is_available === undefined,
    );

    console.log(
      "🔍 Available products after filtering:",
      availableProducts.length,
    );

    // Group products by manufacturer
    const productsByManufacturer = availableProducts.reduce(
      (acc, product) => {
        if (!acc[product.manufacturer_id]) {
          acc[product.manufacturer_id] = [];
        }
        acc[product.manufacturer_id].push({
          id: product.id,
          name: product.name,
          description: product.description || "Quality brick product",
          price: product.price || 0,
          imageUrl:
            product.image_url ||
            "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=500&q=80",
        });
        return acc;
      },
      {} as Record<string, Product[]>,
    );

    // Transform manufacturers data to match our interface
    const manufacturers: Manufacturer[] = manufacturersToUse.map(
      (manufacturer) => {
        const manufacturerProducts =
          productsByManufacturer[manufacturer.id] || [];

        // If no products, create a default product for display
        const productsToShow =
          manufacturerProducts.length > 0
            ? manufacturerProducts
            : [
                {
                  id: `default-${manufacturer.id}`,
                  name: "Standard Bricks",
                  description: "Quality brick products available",
                  price: 5,
                  imageUrl:
                    "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=500&q=80",
                },
              ];

        return {
          id: manufacturer.id,
          name:
            manufacturer.name ||
            manufacturer.company_name ||
            "Brick Manufacturer",
          products: productsToShow,
          location: {
            latitude: manufacturer.latitude || 28.6139, // Default to Delhi if no coordinates
            longitude: manufacturer.longitude || 77.209,
            address:
              `${manufacturer.district || ""}, ${manufacturer.city || ""}`.replace(
                /^,\s*|,\s*$/g,
                "",
              ) || "Location not specified",
            city: manufacturer.city || "Unknown",
            state: manufacturer.state || "Unknown",
          },
        };
      },
    );

    console.log("🔍 Final manufacturers to return:", manufacturers.length);
    console.log("🔍 Sample final manufacturer:", manufacturers[0]);

    // Return all manufacturers (don't filter out those without products anymore)
    return manufacturers;
  } catch (error) {
    console.error("Error in fetchManufacturersFromSupabase:", error);
    return [];
  }
};

/**
 * Find manufacturers near the user's location with fallback options
 */
export const findNearbyManufacturers = async (
  userLatitude?: number,
  userLongitude?: number,
  customManufacturers?: Manufacturer[],
  fallbackLocation?: { city?: string; district?: string; state?: string },
): Promise<{
  manufacturers: Manufacturer[];
  locationSuccess: boolean;
  fallbackUsed?: string;
}> => {
  try {
    // Fetch manufacturers from Supabase if not provided
    const manufacturersToProcess =
      customManufacturers || (await fetchManufacturersFromSupabase());

    if (manufacturersToProcess.length === 0) {
      console.log("No manufacturers available");
      return {
        manufacturers: [],
        locationSuccess: false,
      };
    }

    // If no coordinates provided, try to get user's location
    if (!userLatitude || !userLongitude) {
      try {
        const position = await getUserLocation();
        userLatitude = position.coords.latitude;
        userLongitude = position.coords.longitude;
        console.log("✅ User location obtained:", {
          userLatitude,
          userLongitude,
        });
      } catch (error) {
        console.error("Error getting user location:", error);

        // Try fallback location filtering if provided
        if (
          fallbackLocation &&
          (fallbackLocation.city ||
            fallbackLocation.district ||
            fallbackLocation.state)
        ) {
          console.log(
            "🔍 Using fallback location filtering:",
            fallbackLocation,
          );

          const filteredManufacturers = manufacturersToProcess.filter(
            (manufacturer) => {
              const manufacturerCity =
                manufacturer.location.city?.toLowerCase();
              const manufacturerState =
                manufacturer.location.state?.toLowerCase();

              // Check for city match first (most specific)
              if (fallbackLocation.city) {
                const targetCity = fallbackLocation.city.toLowerCase();
                if (
                  manufacturerCity?.includes(targetCity) ||
                  targetCity.includes(manufacturerCity || "")
                ) {
                  return true;
                }
              }

              // Check for district match (if city doesn't match)
              if (fallbackLocation.district && manufacturer.location.address) {
                const targetDistrict = fallbackLocation.district.toLowerCase();
                const manufacturerAddress =
                  manufacturer.location.address.toLowerCase();
                if (
                  manufacturerAddress.includes(targetDistrict) ||
                  targetDistrict.includes(manufacturerAddress)
                ) {
                  return true;
                }
              }

              // Check for state match (least specific)
              if (fallbackLocation.state) {
                const targetState = fallbackLocation.state.toLowerCase();
                if (
                  manufacturerState?.includes(targetState) ||
                  targetState.includes(manufacturerState || "")
                ) {
                  return true;
                }
              }

              return false;
            },
          );

          if (filteredManufacturers.length > 0) {
            console.log(
              `✅ Found ${filteredManufacturers.length} manufacturers using fallback location`,
            );
            return {
              manufacturers: filteredManufacturers,
              locationSuccess: false,
              fallbackUsed: fallbackLocation.city
                ? "city"
                : fallbackLocation.district
                  ? "district"
                  : "state",
            };
          }
        }

        // Final fallback - return all manufacturers sorted by a default location (New Delhi)
        console.log("🔍 Using default location fallback (New Delhi)");
        userLatitude = 28.6139;
        userLongitude = 77.209;

        const manufacturersWithDistance = manufacturersToProcess.map(
          (manufacturer) => {
            const distance = calculateDistance(
              userLatitude!,
              userLongitude!,
              manufacturer.location.latitude,
              manufacturer.location.longitude,
            );
            return {
              ...manufacturer,
              distance: parseFloat(distance.toFixed(2)),
            };
          },
        );

        return {
          manufacturers: manufacturersWithDistance.sort(
            (a, b) => a.distance! - b.distance!,
          ),
          locationSuccess: false,
          fallbackUsed: "default",
        };
      }
    }

    // Calculate distance for each manufacturer using precise location
    const manufacturersWithDistance = manufacturersToProcess.map(
      (manufacturer) => {
        const distance = calculateDistance(
          userLatitude!,
          userLongitude!,
          manufacturer.location.latitude,
          manufacturer.location.longitude,
        );

        return {
          ...manufacturer,
          distance: parseFloat(distance.toFixed(2)),
        };
      },
    );

    // Sort by distance (closest first) and optionally filter by radius
    const sortedManufacturers = manufacturersWithDistance.sort(
      (a, b) => a.distance! - b.distance!,
    );

    // Optionally filter by reasonable radius (e.g., within 500km for initial results)
    const nearbyManufacturers = sortedManufacturers.filter(
      (m) => m.distance! <= 500,
    );

    return {
      manufacturers:
        nearbyManufacturers.length > 0
          ? nearbyManufacturers
          : sortedManufacturers,
      locationSuccess: true,
    };
  } catch (error) {
    console.error("Error finding nearby manufacturers:", error);
    // Return empty array on error
    return {
      manufacturers: [],
      locationSuccess: false,
    };
  }
};

/**
 * Get all available manufacturers (without distance calculation)
 */
export const getAllManufacturers = async (): Promise<Manufacturer[]> => {
  return await fetchManufacturersFromSupabase();
};

/**
 * Get manufacturer by ID
 */
export const getManufacturerById = async (
  id: string,
): Promise<Manufacturer | undefined> => {
  const manufacturers = await fetchManufacturersFromSupabase();
  return manufacturers.find((m) => m.id === id);
};

/**
 * Get product by ID
 */
export const getProductById = async (
  id: string,
): Promise<Product | undefined> => {
  try {
    const { data: product, error } = await supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        image_url
      `,
      )
      .eq("id", id)
      .eq("is_available", true)
      .single();

    if (error || !product) {
      console.error("Error fetching product:", error);
      return undefined;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description || "Quality brick product",
      price: product.price || 0,
      imageUrl:
        product.image_url ||
        "https://images.unsplash.com/photo-1590086782957-93c06ef21604?w=500&q=80",
    };
  } catch (error) {
    console.error("Error in getProductById:", error);
    return undefined;
  }
};

export type { Manufacturer, Product };
