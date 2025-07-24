import { supabase } from "@/lib/supabase";

export interface QuotationInsert {
  customer_id: string;
  manufacturer_id: string;
  product_id: string;
  quantity: number;
  quoted_price: number;
  total_amount: number;
  message?: string;
  status?: string;
}

export interface QuotationResponse {
  response_message: string;
  response_quantity: number;
  response_price: number;
  offer_expiry: string;
}

export const saveQuotation = async (quotation: QuotationInsert) => {
  try {
    const { data, error } = await supabase
      .from("quotations")
      .insert(quotation)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error saving quotation:", error);
    return null;
  }
};

export const getManufacturerQuotationsWithDetails = async (manufacturerId: string) => {
  try {
    const { data, error } = await supabase
      .from("quotations")
      .select(`*, endcustomers(name, email, phone), products(name, category)`) // join customer and product tables
      .eq("manufacturer_id", manufacturerId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching manufacturer quotations:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getManufacturerQuotationsWithDetails:", err);
    return [];
  }
};

export const updateQuotationStatus = async (quotationId: string, status: string, response?: QuotationResponse) => {
  try {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };

    if (response) {
      updateData.response_message = response.response_message;
      updateData.response_quantity = response.response_quantity;
      updateData.response_price = response.response_price;
      updateData.offer_expiry = response.offer_expiry;
      updateData.responded_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("quotations")
      .update(updateData)
      .eq("id", quotationId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating quotation status:", error);
    return null;
  }
};

export const getCustomerQuotationsWithDetails = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from("quotations")
      .select(`*, manufacturers(name, company_name), products(name, category)`) // join manufacturer and product tables
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching customer quotations:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Exception in getCustomerQuotationsWithDetails:", err);
    return [];
  }
};