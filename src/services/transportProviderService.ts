import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type TransportProvider =
  Database["public"]["Tables"]["transport_providers"]["Row"];
export type TransportProviderInsert =
  Database["public"]["Tables"]["transport_providers"]["Insert"];

/**
 * Get all transport providers
 */
export const getAllTransportProviders = async (): Promise<
  TransportProvider[]
> => {
  try {
    const { data, error } = await supabase
      .from("transport_providers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching transport providers:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getAllTransportProviders:", err);
    return [];
  }
};

/**
 * Get transport provider by ID
 */
export const getTransportProviderById = async (
  id: string,
): Promise<TransportProvider | null> => {
  try {
    const { data, error } = await supabase
      .from("transport_providers")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching transport provider by ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in getTransportProviderById:", err);
    return null;
  }
};

/**
 * Search transport providers by transport type or location
 */
export const searchTransportProviders = async (
  searchTerm: string,
  transportType?: string,
  location?: string,
): Promise<TransportProvider[]> => {
  try {
    let query = supabase.from("transport_providers").select("*");

    if (searchTerm) {
      query = query.or(
        `company_name.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`,
      );
    }

    if (transportType) {
      query = query.ilike("transport_type", `%${transportType}%`);
    }

    if (location) {
      query = query.or(
        `city.ilike.%${location}%,state.ilike.%${location}%,district.ilike.%${location}%,service_area.ilike.%${location}%`,
      );
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error searching transport providers:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in searchTransportProviders:", err);
    return [];
  }
};

/**
 * Add a new transport provider
 */
export const addTransportProvider = async (
  providerData: TransportProviderInsert,
): Promise<TransportProvider | null> => {
  try {
    const { data, error } = await supabase
      .from("transport_providers")
      .insert(providerData)
      .select()
      .single();

    if (error) {
      console.error("Error adding transport provider:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in addTransportProvider:", err);
    return null;
  }
};
