import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export type InquiryInsert = Database["public"]["Tables"]["inquiries"]["Insert"];
export type InquiryUpdate = Database["public"]["Tables"]["inquiries"]["Update"];

/**
 * Get all inquiries for a manufacturer
 */
export const getManufacturerInquiries = async (
  manufacturerId: string,
): Promise<{ data: Inquiry[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select(
        "id, created_at, customer_id, manufacturer_id, message, status, subject, updated_at",
      )
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error fetching manufacturer inquiries:", error);
    return { data: null, error };
  }
};

/**
 * Get a single inquiry by ID
 */
export const getInquiryById = async (
  inquiryId: string,
): Promise<{ data: Inquiry | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select(
        "id, created_at, customer_id, manufacturer_id, message, status, subject, updated_at",
      )
      .eq("id", inquiryId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching inquiry:", error);
    return { data: null, error };
  }
};

/**
 * Create a new inquiry
 */
export const createInquiry = async (
  inquiry: InquiryInsert,
): Promise<{ data: Inquiry | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .insert(inquiry)
      .select(
        "id, created_at, customer_id, manufacturer_id, message, status, subject, updated_at",
      )
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error creating inquiry:", error);
    return { data: null, error };
  }
};

/**
 * Update an inquiry status
 */
export const updateInquiryStatus = async (
  inquiryId: string,
  status: string,
): Promise<{ data: Inquiry | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select(
        "id, created_at, customer_id, manufacturer_id, message, status, subject, updated_at",
      )
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    return { data: null, error };
  }
};

/**
 * Respond to an inquiry
 */
export const respondToInquiry = async (
  inquiryId: string,
  response: string,
): Promise<{ data: Inquiry | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .update({
        status: "resolved",
        updated_at: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select(
        "id, created_at, customer_id, manufacturer_id, message, status, subject, updated_at",
      )
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error responding to inquiry:", error);
    return { data: null, error };
  }
};

/**
 * Get inquiry statistics for a manufacturer
 */
export const getInquiryStatistics = async (
  manufacturerId: string,
): Promise<{
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  closed: number;
  error: any;
}> => {
  try {
    const { data, error } = await supabase
      .from("inquiries")
      .select("id, status")
      .eq("manufacturer_id", manufacturerId);

    if (error) throw error;

    const stats = {
      total: data.length,
      new: data.filter((item) => item.status === "new").length,
      inProgress: data.filter((item) => item.status === "in-progress").length,
      resolved: data.filter((item) => item.status === "resolved").length,
      closed: data.filter((item) => item.status === "closed").length,
      error: null,
    };

    return stats;
  } catch (error) {
    console.error("Error fetching inquiry statistics:", error);
    return { total: 0, new: 0, inProgress: 0, resolved: 0, closed: 0, error };
  }
};
