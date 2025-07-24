import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
export type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

/**
 * Get all products for a manufacturer
 */
export const getManufacturerProducts = async (
  manufacturerId: string,
): Promise<{ data: Product[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (error) {
    console.error("Error fetching manufacturer products:", error);
    return { data: null, error };
  }
};

/**
 * Get a single product by ID
 */
export const getProductById = async (
  productId: string,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", productId)
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error fetching product:", error);
    return { data: null, error };
  }
};

/**
 * Create a new product
 */
export const createProduct = async (
  product: ProductInsert,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error creating product:", error);
    return { data: null, error };
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (
  productId: string,
  updates: ProductUpdate,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", productId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error updating product:", error);
    return { data: null, error };
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (
  productId: string,
): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    return { success: !error, error };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error };
  }
};

/**
 * Toggle product active status
 */
export const toggleProductStatus = async (
  productId: string,
  isAvailable: boolean,
): Promise<{ data: Product | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from("products")
      .update({ is_available: isAvailable })
      .eq("id", productId)
      .select()
      .single();

    return { data, error };
  } catch (error) {
    console.error("Error toggling product status:", error);
    return { data: null, error };
  }
};
