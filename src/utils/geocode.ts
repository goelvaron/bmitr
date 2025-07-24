const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

export async function geocodeAddress(address: string): Promise<{ latitude: number, longitude: number } | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    console.error("Google Maps API key is not set in environment variables.");
    return null;
  }
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.status === "OK" && data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      console.error("Geocoding failed:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Error in geocodeAddress:", error);
    return null;
  }
} 