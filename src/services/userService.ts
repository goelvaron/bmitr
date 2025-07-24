import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

// Define types for user data
export type EndCustomer = Database["public"]["Tables"]["endcustomers"]["Row"];

/**
 * Fetch user profile data by customer ID
 */
export const getUserProfile = async (
  customerId: string,
): Promise<{
  success: boolean;
  data?: EndCustomer;
  message?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("endcustomers")
      .select("*")
      .eq("id", customerId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return { success: false, message: "Failed to fetch user profile" };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Exception in getUserProfile:", error);
    return { success: false, message: "An unexpected error occurred" };
  }
};

/**
 * Update user profile data
 */
export const updateUserProfile = async (
  customerId: string,
  userData: Partial<EndCustomer>,
): Promise<{ success: boolean; message: string; data?: EndCustomer }> => {
  try {
    // Remove id from update data if present
    const { id, ...updateData } = userData as any;

    const { data, error } = await supabase
      .from("endcustomers")
      .update(updateData)
      .eq("id", customerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      return {
        success: false,
        message: `Failed to update profile: ${error.message}`,
      };
    }

    return {
      success: true,
      message: "Profile updated successfully",
      data,
    };
  } catch (error) {
    console.error("Exception in updateUserProfile:", error);
    return {
      success: false,
      message: `An unexpected error occurred: ${error.message || "Unknown error"}`,
    };
  }
};
