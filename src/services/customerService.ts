import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";
import type { Product, Manufacturer } from "@/services/productMatchingService";

export type Customer = Database["public"]["Tables"]["endcustomers"]["Row"];
export type CustomerInsert =
  Database["public"]["Tables"]["endcustomers"]["Insert"];

export type EndCustomer = Database["public"]["Tables"]["endcustomers"]["Row"];
export type EndCustomerInsert =
  Database["public"]["Tables"]["endcustomers"]["Insert"];

export type BrickOwner = Database["public"]["Tables"]["manufacturers"]["Row"];
export type BrickOwnerInsert =
  Database["public"]["Tables"]["manufacturers"]["Insert"];

/**
 * Add a new customer to the database
 */
export const addCustomer = async (
  customerData: CustomerInsert,
): Promise<Customer | null> => {
  try {
    console.log("Attempting to add customer with data:", customerData);

    // First check if the connection is working
    const { data: connectionTest, error: connectionError } = await supabase
      .from("endcustomers")
      .select("count")
      .limit(1);
    if (connectionError) {
      console.error("Connection test failed before insert:", connectionError);
      throw new Error(`Database connection error: ${connectionError.message}`);
    }

    // Proceed with insert
    const { data, error } = await supabase
      .from("endcustomers")
      .insert(customerData)
      .select()
      .single();

    if (error) {
      console.error("Error adding customer:", error);
      throw new Error(`Insert error: ${error.message}`);
    }

    console.log("Customer added successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception in addCustomer:", err);
    return null;
  }
};

/**
 * Add a new brick owner to the database
 */
export const addBrickOwner = async (
  ownerData: any, // Using any type to avoid type errors with missing fields
): Promise<BrickOwner | null> => {
  try {
    console.log("Attempting to add brick owner with data:", ownerData);

    // First check if the connection is working
    const { data: connectionTest, error: connectionError } = await supabase
      .from("manufacturers")
      .select("count")
      .limit(1);
    if (connectionError) {
      console.error("Connection test failed before insert:", connectionError);
      throw new Error(`Database connection error: ${connectionError.message}`);
    }

    // Clean up the data to ensure no undefined values
    const cleanedData = Object.entries(ownerData).reduce(
      (acc, [key, value]) => {
        acc[key] = value === undefined ? null : value;
        return acc;
      },
      {} as Record<string, any>,
    );

    console.log("Cleaned data for insert:", cleanedData);

    // Proceed with insert
    const { data, error } = await supabase
      .from("manufacturers")
      .insert(cleanedData as BrickOwnerInsert)
      .select();

    if (error) {
      console.error("Error adding brick owner:", error);
      throw new Error(`Insert error: ${error.message}`);
    }

    console.log("Brick owner added successfully:", data);
    return data[0] || null;
  } catch (err) {
    console.error("Exception in addBrickOwner:", err);
    throw err; // Re-throw the error so it can be caught and displayed to the user
  }
};

/**
 * Get all customers from the database
 */
export const getAllCustomers = async (): Promise<Customer[]> => {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Attempt ${attempt}: Fetching customers from customers table...`,
      );

      // Check if environment variables are set
      if (
        !import.meta.env.VITE_SUPABASE_URL ||
        !import.meta.env.VITE_SUPABASE_ANON_KEY
      ) {
        console.error("Supabase environment variables not set");
        throw new Error(
          "Database configuration error. Please check environment variables.",
        );
      }

      // First check if the connection is working with a simple query
      const { data: connectionTest, error: connectionError } = await supabase
        .from("endcustomers")
        .select("id")
        .limit(1);

      if (connectionError) {
        console.error(
          `Connection test failed (attempt ${attempt}):`,
          connectionError,
        );
        // Check for specific error types
        if (connectionError.code === "PGRST116") {
          throw new Error(
            "Table 'endcustomers' does not exist. Please check your database schema.",
          );
        } else if (connectionError.code === "42P01") {
          throw new Error(
            "Database table not found. Please run database migrations.",
          );
        } else if (connectionError.code === "PGRST301") {
          throw new Error(
            "Database connection timeout. Please check your network connection.",
          );
        } else {
          // For network/timeout errors, we'll retry
          if (
            attempt < maxRetries &&
            (connectionError.message.includes("timeout") ||
              connectionError.message.includes("network"))
          ) {
            lastError = new Error(
              `Database connection error: ${connectionError.message}`,
            );
            console.log(`Retrying in ${attempt * 1000}ms...`);
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            continue;
          }
          throw new Error(
            `Database connection error: ${connectionError.message}`,
          );
        }
      }

      console.log(
        `Connection test successful (attempt ${attempt}), fetching customers...`,
      );

      // Fetch all customers with proper error handling
      const { data, error } = await supabase
        .from("endcustomers")
        .select(
          `
          id,
          name,
          email,
          phone,
          company_name,
          state,
          district,
          category,
          created_at
        `,
        )
        .order("created_at", { ascending: false, nullsFirst: false });

      if (error) {
        console.error(`Error fetching customers (attempt ${attempt}):`, error);
        // For network/timeout errors, we'll retry
        if (
          attempt < maxRetries &&
          (error.message.includes("timeout") ||
            error.message.includes("network"))
        ) {
          lastError = new Error(`Failed to fetch customers: ${error.message}`);
          console.log(`Retrying in ${attempt * 1000}ms...`);
          await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
          continue;
        }
        throw new Error(`Failed to fetch customers: ${error.message}`);
      }

      console.log(
        `Successfully fetched ${data?.length || 0} customers on attempt ${attempt}`,
      );

      // Ensure we return an array even if data is null
      const customers = data || [];

      // Validate the data structure and provide defaults
      const validatedCustomers = customers.map((customer) => ({
        ...customer,
        name: customer.name || "N/A",
        email: customer.email || "N/A",
        phone: customer.phone || "N/A",
        company_name: customer.company_name || "N/A",
        state: customer.state || "N/A",
        district: customer.district || "N/A",
        category: customer.category || "N/A",
        joined_date: customer.created_at || new Date().toISOString(),
      }));

      return validatedCustomers;
    } catch (err) {
      console.error(`Exception in getAllCustomers (attempt ${attempt}):`, err);
      lastError =
        err instanceof Error ? err : new Error("Unknown error occurred");

      // If it's not a retryable error or we've exhausted retries, throw immediately
      if (
        attempt >= maxRetries ||
        (err instanceof Error &&
          !err.message.includes("timeout") &&
          !err.message.includes("network") &&
          !err.message.includes("connection"))
      ) {
        break;
      }

      // Wait before retrying
      console.log(`Retrying in ${attempt * 1000}ms...`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }

  // If we get here, all retries failed
  console.error("All retry attempts failed");
  if (lastError) {
    throw lastError;
  }
  throw new Error(
    "An unexpected error occurred while fetching customers. Please try again.",
  );
};

/**
 * Get a customer by email
 */
export const getCustomerByEmail = async (
  email: string,
): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from("endcustomers")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching customer by email:", error);
    return null;
  }

  return data;
};

/**
 * Update manufacturer status
 */
export const updateManufacturerStatus = async (
  manufacturerId: string,
  status: string,
): Promise<BrickOwner | null> => {
  try {
    console.log(`Updating manufacturer ${manufacturerId} status to ${status}`);

    const { data, error } = await supabase
      .from("manufacturers")
      .update({ status })
      .eq("id", manufacturerId)
      .select()
      .single();

    if (error) {
      console.error("Error updating manufacturer status:", error);
      throw new Error(`Status update error: ${error.message}`);
    }

    console.log("Manufacturer status updated successfully:", data);
    return data;
  } catch (err) {
    console.error("Exception in updateManufacturerStatus:", err);
    throw err;
  }
};

/**
 * Get all manufacturers from the database
 */
export const getAllManufacturers = async (): Promise<BrickOwner[]> => {
  try {
    console.log(
      "Attempting to fetch manufacturers from manufacturers table...",
    );

    const { data, error } = await supabase
      .from("manufacturers")
      .select(
        `
        id,
        name,
        email,
        phone,
        company_name,
        state,
        district,
        city,
        kiln_type,
        status,
        created_at,
        interested_in_exclusive_services
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching manufacturers:", error);
      throw new Error(`Failed to fetch manufacturers: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} manufacturers`);
    return data || [];
  } catch (err) {
    console.error("Exception in getAllManufacturers:", err);
    throw err;
  }
};

/**
 * Get customer analytics data
 */
export const getCustomerAnalytics = async () => {
  const customers = await getAllCustomers();

  // Calculate analytics
  const totalCustomers = customers.length;

  // Count by state
  const byState: Record<string, number> = {};
  // Count by kiln type
  const byKilnType: Record<string, number> = {};
  // Count by category
  const byCategory: Record<string, number> = {};
  // Count by month
  const joinedByMonth: Record<string, number> = {};

  customers.forEach((customer) => {
    // Count by state
    byState[customer.state] = (byState[customer.state] || 0) + 1;

    // Count by category
    byCategory[customer.category] = (byCategory[customer.category] || 0) + 1;

    // Count by month
    const date = new Date(customer.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    joinedByMonth[monthKey] = (joinedByMonth[monthKey] || 0) + 1;
  });

  return {
    totalCustomers,
    byState,
    byCategory,
    joinedByMonth,
  };
};
