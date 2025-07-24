import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type ManufacturerCoalInquiry =
  Database["public"]["Tables"]["manufacturer_coal_inquiries"]["Row"];
export type ManufacturerCoalInquiryInsert =
  Database["public"]["Tables"]["manufacturer_coal_inquiries"]["Insert"];

export type ManufacturerCoalQuotation =
  Database["public"]["Tables"]["manufacturer_coal_quotations"]["Row"];
export type ManufacturerCoalQuotationInsert =
  Database["public"]["Tables"]["manufacturer_coal_quotations"]["Insert"];

export type ManufacturerCoalOrder =
  Database["public"]["Tables"]["manufacturer_coal_orders"]["Row"];
export type ManufacturerCoalOrderInsert =
  Database["public"]["Tables"]["manufacturer_coal_orders"]["Insert"];

export type ManufacturerCoalRating =
  Database["public"]["Tables"]["manufacturer_coal_ratings"]["Row"];
export type ManufacturerCoalRatingInsert =
  Database["public"]["Tables"]["manufacturer_coal_ratings"]["Insert"];

export type InquiryResponseHistory =
  Database["public"]["Tables"]["inquiry_response_history"]["Row"];
export type InquiryResponseHistoryInsert =
  Database["public"]["Tables"]["inquiry_response_history"]["Insert"];

/**
 * Create a new coal inquiry from manufacturer
 * Creates ONLY an inquiry record - no other records are created automatically
 */
export const createManufacturerCoalInquiry = async (
  inquiry: ManufacturerCoalInquiryInsert,
): Promise<ManufacturerCoalInquiry | null> => {
  try {
    // Ensure status is set to pending by default
    const inquiryData = {
      ...inquiry,
      status: inquiry.status || "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(
      "Creating manufacturer coal inquiry (inquiry only - no chained records):",
      inquiryData,
    );
    console.log("Coal provider ID in inquiry:", inquiryData.coal_provider_id);

    const { data, error } = await supabase
      .from("manufacturer_coal_inquiries")
      .insert(inquiryData)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer coal inquiry:", error);
      return null;
    }

    console.log(
      "Successfully created manufacturer coal inquiry (standalone record only):",
      data,
    );
    return data;
  } catch (err) {
    console.error("Exception in createManufacturerCoalInquiry:", err);
    return null;
  }
};

/**
 * Get all coal inquiries for a manufacturer
 */
export const getManufacturerCoalInquiries = async (
  manufacturerId: string,
): Promise<ManufacturerCoalInquiry[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_inquiries")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer coal inquiries:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerCoalInquiries:", err);
    return [];
  }
};

/**
 * Create a new coal quotation request from manufacturer
 * Creates ONLY a quotation request record - completely standalone, no inquiry records created
 */
export const createManufacturerCoalQuotationRequest = async (
  quotationRequest: ManufacturerCoalQuotationInsert,
): Promise<ManufacturerCoalQuotation | null> => {
  try {
    // Ensure status is set to pending by default and inquiry_id is explicitly null for standalone quotations
    const quotationData = {
      ...quotationRequest,
      inquiry_id: null, // Always null for standalone quotation requests
      status: "pending", // Always pending for new quotation requests
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(
      "Creating standalone manufacturer coal quotation request (no inquiry record created):",
      quotationData,
    );
    console.log(
      "Coal provider ID in quotation request:",
      quotationData.coal_provider_id,
    );
    console.log(
      "This is a standalone quotation request - no inquiry dependency",
    );

    const { data, error } = await supabase
      .from("manufacturer_coal_quotations")
      .insert(quotationData)
      .select()
      .single();

    if (error) {
      console.error(
        "Error creating manufacturer coal quotation request:",
        error,
      );
      return null;
    }

    console.log(
      "Successfully created standalone manufacturer coal quotation request:",
      data,
    );
    return data;
  } catch (err) {
    console.error("Exception in createManufacturerCoalQuotationRequest:", err);
    return null;
  }
};

/**
 * Coal provider responds to quotation request by updating the quotation with their offer
 * This is the ONLY way coal providers can respond to quotation requests
 */
export const respondToCoalQuotationRequest = async (
  quotationId: string,
  response: {
    price_per_unit: number;
    total_amount: number;
    delivery_timeline?: string;
    payment_terms?: string;
    additional_notes?: string;
    delivery_location?: string;
  },
): Promise<ManufacturerCoalQuotation | null> => {
  try {
    console.log("Coal provider responding to quotation request:", quotationId);
    console.log("Response data:", response);

    // Update the quotation with the provider's response
    const updateData = {
      price_per_unit: response.price_per_unit,
      total_amount: response.total_amount,
      delivery_timeline: response.delivery_timeline || null,
      payment_terms: response.payment_terms || null,
      additional_notes: response.additional_notes || null,
      delivery_location: response.delivery_location || null,
      status: "quoted", // Status changes to quoted when provider responds
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("manufacturer_coal_quotations")
      .update(updateData)
      .eq("id", quotationId)
      .select()
      .single();

    if (error) {
      console.error("Error responding to coal quotation request:", error);
      return null;
    }

    console.log("Successfully responded to coal quotation request:", data);
    return data;
  } catch (err) {
    console.error("Exception in respondToCoalQuotationRequest:", err);
    return null;
  }
};

/**
 * Get all coal quotations for a manufacturer (both requests and responses)
 */
export const getManufacturerCoalQuotations = async (
  manufacturerId: string,
): Promise<ManufacturerCoalQuotation[]> => {
  try {
    console.log("=== FETCHING MANUFACTURER COAL QUOTATIONS ===");
    console.log("Manufacturer ID:", manufacturerId);
    console.log("Manufacturer ID type:", typeof manufacturerId);
    console.log("Fetch timestamp:", new Date().toISOString());

    // Use a fresh query with no caching to ensure we get the latest data
    const { data, error } = await supabase
      .from("manufacturer_coal_quotations")
      .select(
        `
        *,
        coal_providers!inner(company_name, name, phone, email)
      `,
      )
      .eq("manufacturer_id", manufacturerId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer coal quotations:", error);
      console.error("Error details:", error.details);
      console.error("Error message:", error.message);
      return [];
    }

    console.log("Raw quotations data from database:", data);
    console.log("Number of quotations found:", data?.length || 0);

    if (data && data.length > 0) {
      console.log("Sample quotation (first record):", {
        id: data[0].id,
        status: data[0].status,
        price_per_unit: data[0].price_per_unit,
        total_amount: data[0].total_amount,
        updated_at: data[0].updated_at,
        created_at: data[0].created_at,
      });

      console.log("Quotations by status:");
      const statusCounts = data.reduce((acc: any, q: any) => {
        acc[q.status] = (acc[q.status] || 0) + 1;
        return acc;
      }, {});
      console.log(statusCounts);

      // Log all quotations with their key fields for debugging
      console.log(
        "All quotations summary:",
        data.map((q) => ({
          id: q.id,
          status: q.status,
          coal_type: q.coal_type,
          price_per_unit: q.price_per_unit,
          total_amount: q.total_amount,
          provider: q.coal_providers?.company_name,
          updated_at: q.updated_at,
        })),
      );
    }

    console.log("=== END FETCHING MANUFACTURER COAL QUOTATIONS ===");
    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerCoalQuotations:", err);
    return [];
  }
};

/**
 * Get all coal quotation requests for a coal provider (only pending requests they can respond to)
 */
export const getCoalProviderQuotationRequests = async (
  coalProviderId: string,
): Promise<ManufacturerCoalQuotation[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_quotations")
      .select(
        `
        *,
        manufacturers!inner(name, company_name, phone, email)
      `,
      )
      .eq("coal_provider_id", coalProviderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coal provider quotation requests:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getCoalProviderQuotationRequests:", err);
    return [];
  }
};

/**
 * Create a new coal order from manufacturer
 * Creates ONLY an order record - no other records are created automatically
 */
export const createManufacturerCoalOrder = async (
  order: ManufacturerCoalOrderInsert,
): Promise<ManufacturerCoalOrder | null> => {
  try {
    // Ensure status is set to pending by default and quotation_id is explicitly null for standalone orders
    const orderData = {
      ...order,
      quotation_id: order.quotation_id || null, // Explicitly set to null for standalone orders
      order_status: order.order_status || "pending",
      payment_status: order.payment_status || "pending",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(
      "Creating manufacturer coal order (standalone order only - no inquiry/quotation created):",
      orderData,
    );
    console.log("Coal provider ID in order:", orderData.coal_provider_id);
    console.log(
      "Quotation ID in order (should be null for standalone):",
      orderData.quotation_id,
    );

    const { data, error } = await supabase
      .from("manufacturer_coal_orders")
      .insert(orderData)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer coal order:", error);
      console.error("Error details:", error.details);
      console.error("Error message:", error.message);
      return null;
    }

    console.log(
      "Successfully created manufacturer coal order (standalone record only):",
      data,
    );
    return data;
  } catch (err) {
    console.error("Exception in createManufacturerCoalOrder:", err);
    return null;
  }
};

/**
 * Get all coal orders for a manufacturer
 */
export const getManufacturerCoalOrders = async (
  manufacturerId: string,
): Promise<ManufacturerCoalOrder[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_orders")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer coal orders:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerCoalOrders:", err);
    return [];
  }
};

/**
 * Create a new coal rating from manufacturer
 * Creates ONLY a rating record - order_id is REQUIRED and must reference a completed order
 */
export const createManufacturerCoalRating = async (
  rating: ManufacturerCoalRatingInsert,
): Promise<ManufacturerCoalRating | null> => {
  try {
    // Validate that order_id is provided
    if (!rating.order_id) {
      console.error("Order ID is required for creating a rating");
      return null;
    }

    // Verify that the order exists and belongs to the manufacturer
    const { data: orderData, error: orderError } = await supabase
      .from("manufacturer_coal_orders")
      .select("id, manufacturer_id, coal_provider_id, order_status")
      .eq("id", rating.order_id)
      .eq("manufacturer_id", rating.manufacturer_id)
      .single();

    if (orderError || !orderData) {
      console.error(
        "Order not found or does not belong to manufacturer:",
        orderError,
      );
      return null;
    }

    // Verify that the order is for the same coal provider
    if (orderData.coal_provider_id !== rating.coal_provider_id) {
      console.error("Order coal provider does not match rating coal provider");
      return null;
    }

    // Check if order is completed (optional - can be removed if ratings are allowed for any order status)
    // if (orderData.order_status !== 'completed' && orderData.order_status !== 'delivered') {
    //   console.error('Order must be completed before rating can be created');
    //   return null;
    // }

    const ratingData = {
      ...rating,
      order_id: rating.order_id, // Required field
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log(
      "Creating manufacturer coal rating (dependent on order completion):",
      ratingData,
    );
    console.log("Coal provider ID in rating:", ratingData.coal_provider_id);
    console.log("Order ID in rating (required):", ratingData.order_id);

    const { data, error } = await supabase
      .from("manufacturer_coal_ratings")
      .insert(ratingData)
      .select()
      .single();

    if (error) {
      console.error("Error creating manufacturer coal rating:", error);
      console.error("Error details:", error.details);
      console.error("Error message:", error.message);
      return null;
    }

    console.log(
      "Successfully created manufacturer coal rating (dependent on order):",
      data,
    );
    return data;
  } catch (err) {
    console.error("Exception in createManufacturerCoalRating:", err);
    return null;
  }
};

/**
 * Get all coal ratings for a manufacturer
 */
export const getManufacturerCoalRatings = async (
  manufacturerId: string,
): Promise<ManufacturerCoalRating[]> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_ratings")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer coal ratings:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerCoalRatings:", err);
    return [];
  }
};

/**
 * Add text response to coal inquiry with history tracking
 */
export const addInquiryTextResponse = async (
  inquiryId: string,
  response: string,
  respondedBy?: string,
): Promise<ManufacturerCoalInquiry | null> => {
  try {
    console.log("Adding text response to inquiry:", inquiryId);
    console.log("Response text:", response);
    console.log("Responded by:", respondedBy);

    // First, get the inquiry details to extract coal_provider_id and manufacturer_id
    const { data: inquiryData, error: inquiryError } = await supabase
      .from("manufacturer_coal_inquiries")
      .select("coal_provider_id, manufacturer_id")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiryData) {
      console.error("Error fetching inquiry details:", inquiryError);
      return null;
    }

    // Check if there are existing responses
    const { data: existingResponses, error: historyError } = await supabase
      .from("inquiry_response_history")
      .select("response_number")
      .eq("inquiry_id", inquiryId)
      .order("response_number", { ascending: false })
      .limit(1);

    if (historyError) {
      console.error("Error checking response history:", historyError);
      return null;
    }

    const nextResponseNumber =
      existingResponses && existingResponses.length > 0
        ? existingResponses[0].response_number + 1
        : 1;

    // Mark all previous responses as not current
    if (nextResponseNumber > 1) {
      await supabase
        .from("inquiry_response_history")
        .update({ is_current_response: false })
        .eq("inquiry_id", inquiryId);
    }

    // Add new response to history
    const historyData: InquiryResponseHistoryInsert = {
      inquiry_id: inquiryId,
      coal_provider_id: inquiryData.coal_provider_id,
      manufacturer_id: inquiryData.manufacturer_id,
      response_text: response,
      response_type: "text_response",
      response_number: nextResponseNumber,
      responded_by: respondedBy || null,
      is_current_response: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: historyInsertError } = await supabase
      .from("inquiry_response_history")
      .insert(historyData);

    if (historyInsertError) {
      console.error("Error adding response to history:", historyInsertError);
      return null;
    }

    // Update the main inquiry record with the latest response
    const updateData = {
      provider_response: response,
      provider_response_date: new Date().toISOString(),
      responded_by: respondedBy || null,
      status: "responded",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("manufacturer_coal_inquiries")
      .update(updateData)
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) {
      console.error("Error adding text response to inquiry:", error);
      return null;
    }

    console.log(
      "Successfully added text response to inquiry with history:",
      data,
    );
    return data;
  } catch (err) {
    console.error("Exception in addInquiryTextResponse:", err);
    return null;
  }
};

/**
 * Update coal quotation status
 */
export const updateManufacturerCoalQuotationStatus = async (
  quotationId: string,
  status: string,
): Promise<ManufacturerCoalQuotation | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_quotations")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", quotationId)
      .select()
      .single();

    if (error) {
      console.error(
        "Error updating manufacturer coal quotation status:",
        error,
      );
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in updateManufacturerCoalQuotationStatus:", err);
    return null;
  }
};

/**
 * Update coal order status
 */
export const updateManufacturerCoalOrderStatus = async (
  orderId: string,
  status: string,
): Promise<ManufacturerCoalOrder | null> => {
  try {
    const { data, error } = await supabase
      .from("manufacturer_coal_orders")
      .update({
        order_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating manufacturer coal order status:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in updateManufacturerCoalOrderStatus:", err);
    return null;
  }
};

/**
 * Delete all coal inquiries for a specific coal provider
 */
export const deleteAllCoalProviderInquiries = async (
  coalProviderId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting all inquiries for coal provider:", coalProviderId);

    const { error } = await supabase
      .from("manufacturer_coal_inquiries")
      .delete()
      .eq("coal_provider_id", coalProviderId);

    if (error) {
      console.error("Error deleting coal provider inquiries:", error);
      return false;
    }

    console.log("Successfully deleted all inquiries for coal provider");
    return true;
  } catch (err) {
    console.error("Exception in deleteAllCoalProviderInquiries:", err);
    return false;
  }
};

/**
 * Delete all coal quotations for a specific coal provider
 */
export const deleteAllCoalProviderQuotations = async (
  coalProviderId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting all quotations for coal provider:", coalProviderId);

    const { error } = await supabase
      .from("manufacturer_coal_quotations")
      .delete()
      .eq("coal_provider_id", coalProviderId);

    if (error) {
      console.error("Error deleting coal provider quotations:", error);
      return false;
    }

    console.log("Successfully deleted all quotations for coal provider");
    return true;
  } catch (err) {
    console.error("Exception in deleteAllCoalProviderQuotations:", err);
    return false;
  }
};

/**
 * Delete all coal orders for a specific coal provider
 */
export const deleteAllCoalProviderOrders = async (
  coalProviderId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting all orders for coal provider:", coalProviderId);

    const { error } = await supabase
      .from("manufacturer_coal_orders")
      .delete()
      .eq("coal_provider_id", coalProviderId);

    if (error) {
      console.error("Error deleting coal provider orders:", error);
      return false;
    }

    console.log("Successfully deleted all orders for coal provider");
    return true;
  } catch (err) {
    console.error("Exception in deleteAllCoalProviderOrders:", err);
    return false;
  }
};

/**
 * Delete individual coal inquiry
 */
export const deleteManufacturerCoalInquiry = async (
  inquiryId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting coal inquiry:", inquiryId);

    const { error } = await supabase
      .from("manufacturer_coal_inquiries")
      .delete()
      .eq("id", inquiryId);

    if (error) {
      console.error("Error deleting coal inquiry:", error);
      return false;
    }

    console.log("Successfully deleted coal inquiry");
    return true;
  } catch (err) {
    console.error("Exception in deleteManufacturerCoalInquiry:", err);
    return false;
  }
};

/**
 * Delete individual coal quotation
 */
export const deleteManufacturerCoalQuotation = async (
  quotationId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting coal quotation:", quotationId);

    const { error } = await supabase
      .from("manufacturer_coal_quotations")
      .delete()
      .eq("id", quotationId);

    if (error) {
      console.error("Error deleting coal quotation:", error);
      return false;
    }

    console.log("Successfully deleted coal quotation");
    return true;
  } catch (err) {
    console.error("Exception in deleteManufacturerCoalQuotation:", err);
    return false;
  }
};

/**
 * Delete individual coal order
 */
export const deleteManufacturerCoalOrder = async (
  orderId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting coal order:", orderId);

    const { error } = await supabase
      .from("manufacturer_coal_orders")
      .delete()
      .eq("id", orderId);

    if (error) {
      console.error("Error deleting coal order:", error);
      return false;
    }

    console.log("Successfully deleted coal order");
    return true;
  } catch (err) {
    console.error("Exception in deleteManufacturerCoalOrder:", err);
    return false;
  }
};

/**
 * Delete individual coal rating
 */
export const deleteManufacturerCoalRating = async (
  ratingId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting coal rating:", ratingId);

    const { error } = await supabase
      .from("manufacturer_coal_ratings")
      .delete()
      .eq("id", ratingId);

    if (error) {
      console.error("Error deleting coal rating:", error);
      return false;
    }

    console.log("Successfully deleted coal rating");
    return true;
  } catch (err) {
    console.error("Exception in deleteManufacturerCoalRating:", err);
    return false;
  }
};

/**
 * Delete multiple coal inquiries by IDs
 */
export const deleteMultipleManufacturerCoalInquiries = async (
  inquiryIds: string[],
): Promise<boolean> => {
  try {
    console.log("Deleting multiple coal inquiries:", inquiryIds);

    const { error } = await supabase
      .from("manufacturer_coal_inquiries")
      .delete()
      .in("id", inquiryIds);

    if (error) {
      console.error("Error deleting multiple coal inquiries:", error);
      return false;
    }

    console.log("Successfully deleted multiple coal inquiries");
    return true;
  } catch (err) {
    console.error("Exception in deleteMultipleManufacturerCoalInquiries:", err);
    return false;
  }
};

/**
 * Delete multiple coal quotations by IDs
 */
export const deleteMultipleManufacturerCoalQuotations = async (
  quotationIds: string[],
): Promise<boolean> => {
  try {
    console.log("Deleting multiple coal quotations:", quotationIds);

    const { error } = await supabase
      .from("manufacturer_coal_quotations")
      .delete()
      .in("id", quotationIds);

    if (error) {
      console.error("Error deleting multiple coal quotations:", error);
      return false;
    }

    console.log("Successfully deleted multiple coal quotations");
    return true;
  } catch (err) {
    console.error(
      "Exception in deleteMultipleManufacturerCoalQuotations:",
      err,
    );
    return false;
  }
};

/**
 * Delete multiple coal orders by IDs
 */
export const deleteMultipleManufacturerCoalOrders = async (
  orderIds: string[],
): Promise<boolean> => {
  try {
    console.log("Deleting multiple coal orders:", orderIds);

    const { error } = await supabase
      .from("manufacturer_coal_orders")
      .delete()
      .in("id", orderIds);

    if (error) {
      console.error("Error deleting multiple coal orders:", error);
      return false;
    }

    console.log("Successfully deleted multiple coal orders");
    return true;
  } catch (err) {
    console.error("Exception in deleteMultipleManufacturerCoalOrders:", err);
    return false;
  }
};

/**
 * Delete multiple coal ratings by IDs
 */
export const deleteMultipleManufacturerCoalRatings = async (
  ratingIds: string[],
): Promise<boolean> => {
  try {
    console.log("Deleting multiple coal ratings:", ratingIds);

    const { error } = await supabase
      .from("manufacturer_coal_ratings")
      .delete()
      .in("id", ratingIds);

    if (error) {
      console.error("Error deleting multiple coal ratings:", error);
      return false;
    }

    console.log("Successfully deleted multiple coal ratings");
    return true;
  } catch (err) {
    console.error("Exception in deleteMultipleManufacturerCoalRatings:", err);
    return false;
  }
};

/**
 * Get all coal ratings for a specific coal provider
 */
export const getCoalProviderRatings = async (
  coalProviderId: string,
): Promise<ManufacturerCoalRating[]> => {
  try {
    console.log("Fetching ratings for coal provider:", coalProviderId);

    const { data, error } = await supabase
      .from("manufacturer_coal_ratings")
      .select(
        `
        *,
        manufacturers!inner(name, company_name, phone, email)
      `,
      )
      .eq("coal_provider_id", coalProviderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coal provider ratings:", error);
      return [];
    }

    console.log("Fetched ratings for coal provider:", data?.length || 0);
    return data || [];
  } catch (err) {
    console.error("Exception in getCoalProviderRatings:", err);
    return [];
  }
};

/**
 * Get inquiry response history for a specific inquiry
 */
export const getInquiryResponseHistory = async (
  inquiryId: string,
): Promise<InquiryResponseHistory[]> => {
  try {
    console.log("Fetching response history for inquiry:", inquiryId);

    const { data, error } = await supabase
      .from("inquiry_response_history")
      .select("*")
      .eq("inquiry_id", inquiryId)
      .order("response_number", { ascending: true });

    if (error) {
      console.error("Error fetching inquiry response history:", error);
      return [];
    }

    console.log("Fetched response history:", data?.length || 0, "responses");
    return data || [];
  } catch (err) {
    console.error("Exception in getInquiryResponseHistory:", err);
    return [];
  }
};

/**
 * Edit/Update an existing inquiry response
 */
export const editInquiryResponse = async (
  inquiryId: string,
  newResponse: string,
  respondedBy?: string,
): Promise<ManufacturerCoalInquiry | null> => {
  try {
    console.log("Editing response for inquiry:", inquiryId);
    console.log("New response text:", newResponse);
    console.log("Responded by:", respondedBy);

    // Get the inquiry details
    const { data: inquiryData, error: inquiryError } = await supabase
      .from("manufacturer_coal_inquiries")
      .select("coal_provider_id, manufacturer_id")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiryData) {
      console.error("Error fetching inquiry details:", inquiryError);
      return null;
    }

    // Get the current response number
    const { data: existingResponses, error: historyError } = await supabase
      .from("inquiry_response_history")
      .select("response_number")
      .eq("inquiry_id", inquiryId)
      .order("response_number", { ascending: false })
      .limit(1);

    if (historyError) {
      console.error("Error checking response history:", historyError);
      return null;
    }

    const nextResponseNumber =
      existingResponses && existingResponses.length > 0
        ? existingResponses[0].response_number + 1
        : 1;

    // Mark all previous responses as not current
    await supabase
      .from("inquiry_response_history")
      .update({ is_current_response: false })
      .eq("inquiry_id", inquiryId);

    // Add the edited response as a new entry in history
    const historyData: InquiryResponseHistoryInsert = {
      inquiry_id: inquiryId,
      coal_provider_id: inquiryData.coal_provider_id,
      manufacturer_id: inquiryData.manufacturer_id,
      response_text: newResponse,
      response_type: "text_response_edited",
      response_number: nextResponseNumber,
      responded_by: respondedBy || null,
      is_current_response: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error: historyInsertError } = await supabase
      .from("inquiry_response_history")
      .insert(historyData);

    if (historyInsertError) {
      console.error(
        "Error adding edited response to history:",
        historyInsertError,
      );
      return null;
    }

    // Update the main inquiry record with the edited response
    const updateData = {
      provider_response: newResponse,
      provider_response_date: new Date().toISOString(),
      responded_by: respondedBy || null,
      status: "responded",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("manufacturer_coal_inquiries")
      .update(updateData)
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating inquiry with edited response:", error);
      return null;
    }

    console.log("Successfully edited inquiry response with history:", data);
    return data;
  } catch (err) {
    console.error("Exception in editInquiryResponse:", err);
    return null;
  }
};

/**
 * Get all response history for inquiries by a coal provider
 */
export const getCoalProviderResponseHistory = async (
  coalProviderId: string,
): Promise<InquiryResponseHistory[]> => {
  try {
    console.log(
      "Fetching all response history for coal provider:",
      coalProviderId,
    );

    const { data, error } = await supabase
      .from("inquiry_response_history")
      .select(
        `
        *,
        manufacturer_coal_inquiries!inner(
          coal_type,
          message,
          quantity,
          unit,
          delivery_location,
          manufacturers!inner(name, company_name, phone, email)
        )
      `,
      )
      .eq("coal_provider_id", coalProviderId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching coal provider response history:", error);
      return [];
    }

    console.log("Fetched response history:", data?.length || 0, "responses");
    return data || [];
  } catch (err) {
    console.error("Exception in getCoalProviderResponseHistory:", err);
    return [];
  }
};

/**
 * Delete all coal data (inquiries, quotations, and orders) for a specific coal provider
 */
export const deleteAllCoalProviderData = async (
  coalProviderId: string,
): Promise<boolean> => {
  try {
    console.log("Deleting all data for coal provider:", coalProviderId);

    // Delete all inquiries, quotations, and orders in parallel
    const [inquiriesResult, quotationsResult, ordersResult] = await Promise.all(
      [
        deleteAllCoalProviderInquiries(coalProviderId),
        deleteAllCoalProviderQuotations(coalProviderId),
        deleteAllCoalProviderOrders(coalProviderId),
      ],
    );

    const success = inquiriesResult && quotationsResult && ordersResult;

    if (success) {
      console.log("Successfully deleted all data for coal provider");
    } else {
      console.error("Some deletions failed for coal provider");
    }

    return success;
  } catch (err) {
    console.error("Exception in deleteAllCoalProviderData:", err);
    return false;
  }
};
