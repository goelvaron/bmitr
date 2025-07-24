import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type ManufacturerTransportInquiry =
  Database["public"]["Tables"]["manufacturer_transport_inquiries"]["Row"];
export type ManufacturerTransportInquiryInsert =
  Database["public"]["Tables"]["manufacturer_transport_inquiries"]["Insert"];

export type ManufacturerTransportQuotation =
  Database["public"]["Tables"]["manufacturer_transport_quotations"]["Row"];
export type ManufacturerTransportQuotationInsert =
  Database["public"]["Tables"]["manufacturer_transport_quotations"]["Insert"];

export type ManufacturerTransportOrder =
  Database["public"]["Tables"]["manufacturer_transport_orders"]["Row"];
export type ManufacturerTransportOrderInsert =
  Database["public"]["Tables"]["manufacturer_transport_orders"]["Insert"];

export type ManufacturerTransportRating =
  Database["public"]["Tables"]["manufacturer_transport_ratings"]["Row"];
export type ManufacturerTransportRatingInsert =
  Database["public"]["Tables"]["manufacturer_transport_ratings"]["Insert"];

/**
 * Create a new transport inquiry from manufacturer
 */
export const createManufacturerTransportInquiry = async (
  inquiry: ManufacturerTransportInquiryInsert,
): Promise<ManufacturerTransportInquiry | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_inquiries")
      .insert(inquiry)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer transport inquiry:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in createManufacturerTransportInquiry:", err);
    return null;
  }
};

/**
 * Get all transport inquiries for a manufacturer
 */
export const getManufacturerTransportInquiries = async (
  manufacturerId: string,
): Promise<ManufacturerTransportInquiry[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_inquiries")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer transport inquiries:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerTransportInquiries:", err);
    return [];
  }
};

/**
 * Create a new transport quotation request from manufacturer
 */
export const createManufacturerTransportQuotation = async (
  quotation: ManufacturerTransportQuotationInsert,
): Promise<ManufacturerTransportQuotation | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_quotations")
      .insert(quotation)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer transport quotation:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in createManufacturerTransportQuotation:", err);
    return null;
  }
};

/**
 * Get all transport quotations for a manufacturer
 */
export const getManufacturerTransportQuotations = async (
  manufacturerId: string,
): Promise<ManufacturerTransportQuotation[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_quotations")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer transport quotations:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerTransportQuotations:", err);
    return [];
  }
};

/**
 * Create a new transport order from manufacturer
 */
export const createManufacturerTransportOrder = async (
  order: ManufacturerTransportOrderInsert,
): Promise<ManufacturerTransportOrder | null> => {
  try {
    // Always ensure order starts with pending status - never allow completed on creation
    // Remove any status fields that might cause confusion
    const {
      order_status,
      actual_delivery_date,
      pickup_date,
      tracking_number,
      actual_pickup_date,
      ...orderData
    } = order;
    const orderWithStatus = {
      ...orderData,
      order_status: "pending", // Force pending status on creation - only transport providers can change this
      payment_status: "pending", // Always start with pending payment
      // Ensure no delivery dates are set on creation - only transport providers can set these
      actual_delivery_date: null,
      pickup_date: null,
      actual_pickup_date: null,
      tracking_number: null,
    };

    const { data, error } = await supabase
      .from("manufacturer_transport_orders")
      .insert(orderWithStatus)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer transport order:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in createManufacturerTransportOrder:", err);
    return null;
  }
};

/**
 * Get all transport orders for a manufacturer
 */
export const getManufacturerTransportOrders = async (
  manufacturerId: string,
): Promise<ManufacturerTransportOrder[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_orders")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer transport orders:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerTransportOrders:", err);
    return [];
  }
};

/**
 * Create a new transport rating from manufacturer
 */
export const createManufacturerTransportRating = async (
  rating: ManufacturerTransportRatingInsert,
): Promise<ManufacturerTransportRating | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_ratings")
      .insert(rating)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer transport rating:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in createManufacturerTransportRating:", err);
    return null;
  }
};

/**
 * Get all transport ratings for a manufacturer
 */
export const getManufacturerTransportRatings = async (
  manufacturerId: string,
): Promise<ManufacturerTransportRating[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_ratings")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer transport ratings:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerTransportRatings:", err);
    return [];
  }
};

/**
 * Update transport quotation status
 */
export const updateManufacturerTransportQuotationStatus = async (
  quotationId: string,
  status: string,
): Promise<ManufacturerTransportQuotation | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_transport_quotations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quotationId)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating manufacturer transport quotation status:",
        error,
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error(
      "Exception in updateManufacturerTransportQuotationStatus:",
      err,
    );
    return null;
  }
};

/**
 * Update transport order status (RESTRICTED - Only for manufacturer cancellations)
 * Transport providers should use updateTransportOrderStatusByProvider instead
 */
export const updateManufacturerTransportOrderStatus = async (
  orderId: string,
  status: string,
): Promise<ManufacturerTransportOrder | null> => {
  try {
    // Only allow manufacturers to cancel their own orders
    // All other status updates should come from transport providers
    if (status !== "cancelled") {
      console.error(
        "Manufacturers can only cancel orders, not set status to:",
        status,
      );
      return null;
    }

    const updateData: any = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("manufacturer_transport_orders")
      .update(updateData)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating manufacturer transport order status:",
        error,
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in updateManufacturerTransportOrderStatus:", err);
    return null;
  }
};

/**
 * Update transport order status by transport provider (for provider confirmation)
 */
export const updateTransportOrderStatusByProvider = async (
  orderId: string,
  providerId: string,
  status: string,
  trackingNumber?: string,
): Promise<ManufacturerTransportOrder | null> => {
  try {
    const updateData: any = {
      order_status: status,
      updated_at: new Date().toISOString(),
    };

    // Add tracking number if provided
    if (trackingNumber) {
      updateData.tracking_number = trackingNumber;
    }

    // Set pickup date when order is confirmed
    if (status === "confirmed") {
      updateData.pickup_date = new Date().toISOString();
    }

    // Set actual pickup date when order is in transit
    if (status === "in_transit") {
      updateData.actual_pickup_date = new Date().toISOString();
    }

    // Set actual delivery date when order is completed/delivered
    if (status === "completed" || status === "delivered") {
      updateData.actual_delivery_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("manufacturer_transport_orders")
      .update(updateData)
      .eq("id", orderId)
      .eq("transport_provider_id", providerId) // Ensure only the assigned provider can update
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating transport order status by provider:",
        error,
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in updateTransportOrderStatusByProvider:", err);
    return null;
  }
};
