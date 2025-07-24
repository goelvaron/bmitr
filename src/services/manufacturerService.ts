import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type Manufactureres =
  Database["public"]["Tables"]["manufacturers"]["Row"];
export type ManufactureresInsert =
  Database["public"]["Tables"]["manufacturers"]["Insert"];
export type ManufactureresUpdate =
  Database["public"]["Tables"]["manufacturers"]["Update"];

/**
 * Get manufacturer profile by manufacturer ID
 */
export const getManufacturerProfile = async (
  manufacturerId: string,
): Promise<{ data: Manufactureres | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("manufacturers")
      .select("*")
      .eq("id", manufacturerId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching manufacturer profile:", error);
    return { data: null, error };
  }
};

/**
 * Update an existing manufacturer profile
 */
export const updateManufacturerProfile = async (
  manufacturerId: string,
  updates: ManufactureresUpdate,
): Promise<{ data: Manufactureres | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("manufacturers")
      .update(updates)
      .eq("id", manufacturerId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating manufacturer profile:", error);
    return { data: null, error };
  }
};

/**
 * Add a new manufacturer to the database
 */
export const addManufacturer = async (
  manufacturerData: any, // Using any type to avoid type errors with missing fields
): Promise<Manufactureres | null> => {
  try {
    console.log("Attempting to add manufacturer with data:", manufacturerData);

    // Clean up the data to ensure no undefined values
    const cleanedData = Object.entries(manufacturerData).reduce(
      (acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Explicitly set status to waitlist for all new manufacturers
    cleanedData.status = "waitlist";
    cleanedData.joined_date = new Date().toISOString();
    cleanedData.is_test_entry = false;

    console.log("Cleaned data for insert:", cleanedData);

    // Proceed with insert
    const { data, error } = await supabase
      .from("manufacturers")
      .insert(cleanedData)
      .select()
      .single();

    if (error) {
      console.error("Error adding manufacturer:", error);
      throw new Error(`Insert error: ${error.message}`);
    }

    console.log("Manufacturer added successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception in addManufacturer:", err);
    throw err; // Re-throw the error so it can be caught and displayed to the user
  }
};

/**
 * Check if a manufacturer profile exists
 */
export const checkManufacturerProfileExists = async (
  manufacturerId: string,
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("manufacturers")
      .select("id")
      .eq("id", manufacturerId)
      .maybeSingle();

    if (error) {
      console.error("Error checking manufacturer profile:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Exception checking manufacturer profile:", error);
    return false;
  }
};
