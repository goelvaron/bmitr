import { supabase } from "@/lib/supabase";
import {
  Order,
  OrderInsert,
  OrderUpdate,
  OrderWithDetails,
} from "@/types/order";

/**
 * Get all orders for a specific customer
 */
export const getCustomerOrders = async (
  customerId: string,
): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching customer orders:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getCustomerOrders:", err);
    return [];
  }
};

/**
 * Get a specific order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (error) {
      console.error("Error fetching order by ID:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in getOrderById:", err);
    return null;
  }
};

/**
 * Get order with product and manufacturer details
 */
export const getOrderWithDetails = async (
  orderId: string,
): Promise<OrderWithDetails | null> => {
  try {
    // First get the order
    const order = await getOrderById(orderId);
    if (!order) return null;

    // Get product details
    const { data: productData, error: productError } = await supabase
      .from("products")
      .select("name, description")
      .eq("id", order.product_id)
      .single();

    if (productError) {
      console.error("Error fetching product details:", productError);
    }

    // Get manufacturer details
    const { data: manufacturerData, error: manufacturerError } = await supabase
      .from("manufacturers")
      .select("name, company_name")
      .eq("id", order.manufacturer_id)
      .single();

    if (manufacturerError) {
      console.error("Error fetching manufacturer details:", manufacturerError);
    }

    // Combine all data
    return {
      ...order,
      product_name: productData?.name || "Unknown Product",
      product_description: productData?.description,
      manufacturer_name:
        manufacturerData?.company_name ||
        manufacturerData?.name ||
        "Unknown Manufacturer",
    };
  } catch (err) {
    console.error("Exception in getOrderWithDetails:", err);
    return null;
  }
};

/**
 * Update an order
 */
export const updateOrder = async (
  orderId: string,
  updates: OrderUpdate,
): Promise<Order | null> => {
  try {
    // Calculate new total amount if quantity is updated
    if (updates.quantity !== undefined) {
      const order = await getOrderById(orderId);
      if (order) {
        updates.total_amount = order.price * updates.quantity;
      }
    }

    const { data, error } = await supabase
      .from("orders")
      .update(updates)
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error updating order:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in updateOrder:", err);
    return null;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ status: "cancelled" })
      .eq("id", orderId)
      .select()
      .single();

    if (error) {
      console.error("Error cancelling order:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Exception in cancelOrder:", err);
    return null;
  }
};

/**
 * Get all orders for a specific manufacturer, including customer and product details
 */
export const getManufacturerOrdersWithDetails = async (
  manufacturerId: string,
) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`*, endcustomers(name), products(name)`) // join customer and product tables
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer orders:", error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerOrdersWithDetails:", err);
    return [];
  }
};

/**
 * Get all orders for a specific manufacturer, fetching product and customer details separately.
 */
export const getManufacturerOrdersWithDetailsNoJoin = async (
  manufacturerId: string,
) => {
  try {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturer orders:", error);
      return [];
    }

    // For each order, fetch product and customer details separately
    const results = await Promise.all(
      (orders || []).map(async (order: any) => {
        let product = null;
        let customer = null;
        try {
          const { data: productData } = await supabase
            .from("products")
            .select("name")
            .eq("id", order.product_id)
            .maybeSingle();
          product = productData;
        } catch {}
        try {
          const { data: customerData } = await supabase
            .from("endcustomers")
            .select("name")
            .eq("id", order.customer_id)
            .maybeSingle();
          customer = customerData;
        } catch {}
        return {
          ...order,
          product_name: product?.name || "-",
          customer_name: customer?.name || "-",
        };
      })
    );
    return results;
  } catch (err) {
    console.error("Exception in getManufacturerOrdersWithDetailsNoJoin:", err);
    return [];
  }
};
