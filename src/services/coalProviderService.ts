import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type CoalProvider =
  Database["public"]["Tables"]["coal_providers"]["Row"];
export type CoalProviderInsert =
  Database["public"]["Tables"]["coal_providers"]["Insert"];

/**
 * Get all coal/fuel providers
 */
export const getAllCoalProviders = async (): Promise<CoalProvider[]> => {
  try {
    const { data, error } = await supabase
      .from("coal_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coal providers:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getAllCoalProviders:", err);
    return [];
  }
};

/**
 * Get coal provider by ID
 */
export const getCoalProviderById = async (
  id: string,
): Promise<CoalProvider | null> => {
  try {
    const { data, error } = await supabase
      .from("coal_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching coal provider by ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in getCoalProviderById:", err);
    return null;
  }
};

/**
 * Search coal providers by fuel type or location
 */
export const searchCoalProviders = async (
  searchTerm: string,
  fuelType?: string,
  location?: string,
): Promise<CoalProvider[]> => {
  try {
    let query = supabase.from("coal_providers").select("*");

    if (searchTerm) {
      query = query.or(
        `company_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`,
      );
    }

    if (fuelType) {
      query = query.contains("fuel_types", [fuelType]);
    }

    if (location) {
      query = query.or(
        `city.ilike.%${location}%,state.ilike.%${location}%,district.ilike.%${location}%`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error searching coal providers:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in searchCoalProviders:", err);
    return [];
  }
};

/**
 * Add a new coal provider
 */
export const addCoalProvider = async (
  providerData: CoalProviderInsert,
): Promise<CoalProvider | null> => {
  try {
    const { data, error } = await supabase
      .from("coal_providers")
      .insert(providerData)
      .select()
      .single();

    if (error) {
      console.error("Error adding coal provider:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in addCoalProvider:", err);
    return null;
  }
};
