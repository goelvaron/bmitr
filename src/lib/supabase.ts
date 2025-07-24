import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || "",
  import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        "Content-Type": "application/json",
      },
    },
  },
);

// Enhanced connection status interface
interface ConnectionStatus {
  isConnected: boolean;
  duration: number;
  table: string;
  recordCount?: number;
  error?: {
    code?: string;
    message: string;
    details?: string;
    hint?: string;
    type:
      | "validation"
      | "network"
      | "auth"
      | "permission"
      | "table"
      | "unknown";
  };
  diagnostics: {
    urlValid: boolean;
    keyValid: boolean;
    envVarsSet: boolean;
  };
}

// Helper function to check if Supabase connection is working with enhanced diagnostics
export const checkSupabaseConnection = async (
  table: string = "manufacturers",
): Promise<boolean> => {
  const status: ConnectionStatus = {
    isConnected: false,
    duration: 0,
    table,
    diagnostics: {
      urlValid: false,
      keyValid: false,
      envVarsSet: false,
    },
  };

  const startTime = Date.now();

  try {
    // Step 1: Environment variables validation
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    console.log(`🔍 Starting Supabase connection check for table: ${table}`);
    console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);

    if (!supabaseUrl || !supabaseKey) {
      status.error = {
        type: "validation",
        message: "Missing required environment variables",
        details: `VITE_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Missing"}, VITE_SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Set" : "❌ Missing"}`,
      };

      console.error("❌ Environment Variables Check Failed:");
      console.error(
        `   VITE_SUPABASE_URL: ${supabaseUrl ? "✅ Set" : "❌ Not set"}`,
      );
      console.error(
        `   VITE_SUPABASE_ANON_KEY: ${supabaseKey ? "✅ Set" : "❌ Not set"}`,
      );
      console.error(
        "💡 Solution: Configure these environment variables in your project settings",
      );

      return false;
    }

    status.diagnostics.envVarsSet = true;
    console.log("✅ Environment variables are set");

    // Step 2: URL format validation
    try {
      const url = new URL(supabaseUrl);
      status.diagnostics.urlValid = true;
      console.log(`✅ URL format valid: ${url.origin}`);

      // Additional URL checks
      if (
        !supabaseUrl.includes("supabase.co") &&
        !supabaseUrl.includes("localhost")
      ) {
        console.warn("⚠️  URL doesn't appear to be a standard Supabase URL");
      }
    } catch (urlError) {
      status.error = {
        type: "validation",
        message: `Invalid Supabase URL format: ${supabaseUrl}`,
        details:
          urlError instanceof Error ? urlError.message : "URL parsing failed",
      };

      console.error("❌ URL Validation Failed:");
      console.error(`   Provided URL: ${supabaseUrl}`);
      console.error(
        `   Error: ${urlError instanceof Error ? urlError.message : "Unknown error"}`,
      );
      console.error(
        "💡 Solution: Check your VITE_SUPABASE_URL format (should be https://xxx.supabase.co)",
      );

      return false;
    }

    // Step 3: API key format validation
    if (!supabaseKey.startsWith("eyJ")) {
      status.error = {
        type: "validation",
        message: "Invalid Supabase anon key format",
        details: `Key should start with 'eyJ' but starts with '${supabaseKey.substring(0, 10)}...'`,
      };

      console.error("❌ API Key Validation Failed:");
      console.error(`   Key prefix: ${supabaseKey.substring(0, 10)}...`);
      console.error("   Expected: Should start with 'eyJ'");
      console.error(
        "💡 Solution: Verify your VITE_SUPABASE_ANON_KEY is correct",
      );

      return false;
    }

    status.diagnostics.keyValid = true;
    console.log(`✅ API key format valid (${supabaseKey.substring(0, 20)}...)`);

    // Step 4: Database connection test with enhanced error handling
    console.log(`🔗 Testing database connection to table '${table}'...`);
    console.log(`   Query: SELECT "id" FROM "${table}" LIMIT 1`);
    console.log(`   Timeout: 10 seconds`);

    let data, error;
    const queryStartTime = Date.now();

    try {
      // Add timeout wrapper for the query
      const queryPromise = supabase.from(table).select("id").limit(1);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Query timeout after 10 seconds")),
          10000,
        );
      });

      const result = (await Promise.race([
        queryPromise,
        timeoutPromise,
      ])) as any;
      data = result.data;
      error = result.error;

      const queryDuration = Date.now() - queryStartTime;
      console.log(`   Query completed in ${queryDuration}ms`);
    } catch (queryError) {
      const queryDuration = Date.now() - queryStartTime;
      console.error(`   Query failed after ${queryDuration}ms`);

      // Handle timeout and other query exceptions
      if (queryError instanceof Error) {
        if (queryError.message.includes("timeout")) {
          error = {
            code: "TIMEOUT",
            message: `Database query timeout after ${queryDuration}ms`,
            details: `Query to table '${table}' exceeded 10 second timeout`,
            hint: "Database might be overloaded or unreachable",
          };
        } else {
          error = {
            code: "QUERY_EXCEPTION",
            message: queryError.message,
            details: `Unexpected error during query execution: ${queryError.name}`,
            hint: "Check network connectivity and database availability",
          };
        }
      } else {
        error = {
          code: "UNKNOWN_QUERY_ERROR",
          message: "Unknown error during database query",
          details: String(queryError),
          hint: "Unexpected query failure",
        };
      }
    }

    status.duration = Date.now() - startTime;

    if (error) {
      // Enhanced error categorization and handling
      let errorType: ConnectionStatus["error"]["type"] = "unknown";
      let hint = "";
      let additionalInfo: string[] = [];

      // Database-specific error codes
      if (error.code === "PGRST116") {
        errorType = "table";
        hint = `Table '${table}' does not exist in the database schema`;
        additionalInfo = [
          `Available tables might include: manufacturers, coal_providers, transport_providers, endcustomers, products`,
          `Run this query to see all tables: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`,
        ];
      } else if (error.code === "42501") {
        errorType = "permission";
        hint =
          "Permission denied - check RLS policies or use service key for admin operations";
        additionalInfo = [
          `Current key type: ${supabaseKey.startsWith("eyJ") ? "JWT (anon/service)" : "Invalid format"}`,
          `For admin operations, ensure you're using the service key, not anon key`,
          `Check if Row Level Security (RLS) is enabled on table '${table}'`,
        ];
      } else if (error.code === "42P01") {
        errorType = "table";
        hint = `Relation '${table}' does not exist in the database schema`;
        additionalInfo = [
          `This usually means the table hasn't been created yet`,
          `Check your database migrations and ensure they've been applied`,
          `Verify the table name spelling and case sensitivity`,
        ];
      } else if (error.code === "TIMEOUT") {
        errorType = "network";
        hint =
          "Database query timeout - connection is slow or database is overloaded";
        additionalInfo = [
          `Query took longer than 10 seconds to complete`,
          `This might indicate network issues or database performance problems`,
          `Try again in a few moments or check Supabase dashboard for status`,
        ];
      } else if (
        error.message.includes("JWT") ||
        error.message.includes("token") ||
        error.message.includes("Invalid JWT")
      ) {
        errorType = "auth";
        hint =
          "Authentication token issue - verify your VITE_SUPABASE_ANON_KEY";
        additionalInfo = [
          `Token format appears ${supabaseKey.startsWith("eyJ") ? "valid" : "invalid"}`,
          `Token length: ${supabaseKey.length} characters`,
          `Ensure you're using the correct key for your environment (anon vs service)`,
          `Check if the key has expired or been regenerated`,
        ];
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch") ||
        error.message.includes("ENOTFOUND") ||
        error.message.includes("ECONNREFUSED")
      ) {
        errorType = "network";
        hint =
          "Network connectivity issue - check internet connection and Supabase URL";
        additionalInfo = [
          `Target URL: ${supabaseUrl}`,
          `DNS resolution might be failing for the Supabase domain`,
          `Check if you're behind a firewall or proxy`,
          `Verify Supabase service status at status.supabase.com`,
        ];
      } else if (error.message.includes("timeout")) {
        errorType = "network";
        hint = "Request timeout - Supabase might be slow or unreachable";
        additionalInfo = [
          `Request exceeded timeout threshold`,
          `This could indicate network latency or server overload`,
          `Try again or check Supabase status`,
        ];
      } else if (error.code === "QUERY_EXCEPTION") {
        errorType = "unknown";
        hint = "Unexpected query execution error";
        additionalInfo = [
          `This is an internal query processing error`,
          `Check browser console for additional details`,
          `Verify Supabase client configuration`,
        ];
      }

      status.error = {
        type: errorType,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint || hint,
      };

      console.error(`❌ Database Connection Failed (${status.duration}ms):`);
      console.error(`   Error Code: ${error.code || "N/A"}`);
      console.error(`   Error Message: ${error.message}`);
      if (error.details) console.error(`   Details: ${error.details}`);
      if (error.hint) console.error(`   Supabase Hint: ${error.hint}`);
      console.error(`   Categorized Type: ${errorType}`);
      if (hint) console.error(`💡 Solution: ${hint}`);

      // Enhanced debugging information
      if (additionalInfo.length > 0) {
        console.log("🔍 Additional Debugging Info:");
        additionalInfo.forEach((info, index) => {
          console.log(`   ${index + 1}. ${info}`);
        });
      }

      // Table-specific debugging
      if (errorType === "table") {
        console.log("📋 Table Debugging:");
        console.log(`   - Attempted table: "${table}"`);
        console.log(
          `   - Case sensitive: PostgreSQL table names are case sensitive`,
        );
        console.log(`   - Schema: Checking 'public' schema by default`);
        console.log(
          `   - Migration status: Ensure database migrations have been applied`,
        );
      }

      // Network-specific debugging
      if (errorType === "network") {
        console.log("🌐 Network Debugging:");
        console.log(`   - Target host: ${new URL(supabaseUrl).hostname}`);
        console.log(
          `   - Connection protocol: ${new URL(supabaseUrl).protocol}`,
        );
        console.log(`   - Request duration: ${status.duration}ms`);
        console.log(`   - User agent: ${navigator.userAgent}`);
      }

      // Auth-specific debugging
      if (errorType === "auth") {
        console.log("🔐 Authentication Debugging:");
        console.log(`   - Key prefix: ${supabaseKey.substring(0, 20)}...`);
        console.log(
          `   - Key type: ${supabaseKey.includes("anon") ? "Anonymous" : supabaseKey.includes("service") ? "Service" : "Unknown"}`,
        );
        console.log(
          `   - Project URL match: ${supabaseUrl.includes(".supabase.co") ? "Standard Supabase URL" : "Custom/Local URL"}`,
        );
      }

      return false;
    }

    // Success!
    status.isConnected = true;
    status.recordCount = data?.length || 0;

    console.log(`✅ Database Connection Successful!`);
    console.log(`   Table: ${table}`);
    console.log(`   Duration: ${status.duration}ms`);
    console.log(`   Records found: ${status.recordCount}`);
    console.log(
      `   Connection quality: ${status.duration < 500 ? "🟢 Excellent" : status.duration < 1000 ? "🟡 Good" : "🔴 Slow"}`,
    );

    return true;
  } catch (err) {
    status.duration = Date.now() - startTime;

    console.error(`💥 Connection Check Exception (${status.duration}ms):`);

    if (err instanceof Error) {
      console.error(`   Error Name: ${err.name}`);
      console.error(`   Error Message: ${err.message}`);

      // Categorize exception types
      if (err instanceof TypeError && err.message.includes("fetch")) {
        console.error("   Type: Network Error");
        console.error(
          "💡 Solution: Check if Supabase URL is accessible and correct",
        );
      } else if (err.message.includes("AbortError")) {
        console.error("   Type: Request Timeout");
        console.error(
          "💡 Solution: Supabase might be slow or unreachable. Try again later",
        );
      } else if (err.message.includes("CORS")) {
        console.error("   Type: CORS Error");
        console.error("💡 Solution: Check Supabase project CORS settings");
      } else {
        console.error("   Type: Unknown Exception");
        console.error(`   Stack: ${err.stack}`);
      }
    } else {
      console.error(`   Unknown error type: ${typeof err}`);
      console.error(`   Error value:`, err);
    }

    return false;
  }
};

// Enhanced connection test with multiple fallback tables
export const testSupabaseConnectionWithFallback = async (): Promise<{
  success: boolean;
  workingTable?: string;
  testedTables: string[];
}> => {
  const commonTables = [
    "manufacturers",
    "coal_providers",
    "transport_providers",
    "endcustomers",
    "products",
    "customers",
  ];
  const testedTables: string[] = [];

  console.log("🔄 Testing Supabase connection with multiple tables...");

  for (const table of commonTables) {
    testedTables.push(table);
    const isConnected = await checkSupabaseConnection(table);

    if (isConnected) {
      console.log(`✅ Found working table: ${table}`);
      return {
        success: true,
        workingTable: table,
        testedTables,
      };
    }
  }

  console.error("❌ No working tables found");
  return {
    success: false,
    testedTables,
  };
};

// Test database connection on module load with enhanced reporting
checkSupabaseConnection()
  .then((isConnected) => {
    if (isConnected) {
      console.log("🎉 Supabase connection verified and ready!");
    } else {
      console.warn("⚠️  Supabase connection failed - check your configuration");
      console.log(
        "🔧 Run testSupabaseConnectionWithFallback() for detailed diagnostics",
      );
    }
  })
  .catch((error) => {
    console.error(
      "💥 Failed to test Supabase connection on module load:",
      error,
    );
  });
