import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import type { Database } from "@/types/supabase";

export interface TransparencyStats {
  manufacturers: number;
  coalProviders: number;
  transportProviders: number;
  labour: number;
}

/**
 * Get count of all registered stakeholders with enhanced error handling and debugging
 */
export const getTransparencyStats = async (): Promise<TransparencyStats> => {
  try {
    console.log("🔍 [TRANSPARENCY] Starting to fetch transparency stats...");
    console.log("🔍 [TRANSPARENCY] Timestamp:", new Date().toISOString());

    // Initialize stats with default values
    const stats: TransparencyStats = {
      manufacturers: 0,
      coalProviders: 0,
      transportProviders: 0,
      labour: 0,
    };

    // Test basic connection first
    console.log("🔗 [TRANSPARENCY] Testing basic Supabase connection...");
    try {
      const { data: testData, error: testError } = await supabase
        .from("manufacturers")
        .select("id")
        .limit(1);

      if (testError) {
        console.error(
          "❌ [TRANSPARENCY] Basic connection test failed:",
          testError,
        );
        console.error("❌ [TRANSPARENCY] Error details:", {
          code: testError.code,
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
        });
        return stats; // Return zeros if basic connection fails
      }

      console.log("✅ [TRANSPARENCY] Basic connection test passed");
    } catch (connectionErr) {
      console.error("❌ [TRANSPARENCY] Connection exception:", connectionErr);
      return stats;
    }

    // Get manufacturers count with enhanced error handling
    console.log("📊 [TRANSPARENCY] Fetching manufacturers count...");
    try {
      const startTime = Date.now();

      // Query with explicit category filter to ensure we only count valid records
      const { data: manufacturersData, error: manufacturersError } =
        await supabase
          .from("manufacturers")
          .select("id, category")
          .not("category", "is", null)
          .neq("category", "");

      const duration = Date.now() - startTime;
      console.log(`⏱️  [TRANSPARENCY] Manufacturers query took ${duration}ms`);

      if (manufacturersError) {
        console.error(
          "❌ [TRANSPARENCY] Error fetching manufacturers:",
          manufacturersError,
        );
        console.error("❌ [TRANSPARENCY] Manufacturers error details:", {
          code: manufacturersError.code,
          message: manufacturersError.message,
          details: manufacturersError.details,
          hint: manufacturersError.hint,
        });
      } else {
        stats.manufacturers = manufacturersData?.length || 0;
        console.log(
          "✅ [TRANSPARENCY] Manufacturers count:",
          stats.manufacturers,
        );
        console.log(
          "✅ [TRANSPARENCY] Manufacturers sample data:",
          manufacturersData?.slice(0, 3),
        );
      }
    } catch (err) {
      console.error("❌ [TRANSPARENCY] Exception fetching manufacturers:", err);
    }

    // Get coal providers count with enhanced error handling
    console.log("📊 [TRANSPARENCY] Fetching coal providers count...");
    try {
      const startTime = Date.now();

      // First, let's get the total count to debug
      const { data: allCoalProviders, error: allCoalError } = await supabase
        .from("coal_providers")
        .select("id, category, name");

      console.log("🔍 [TRANSPARENCY] All coal providers:", {
        total: allCoalProviders?.length || 0,
        sample: allCoalProviders?.slice(0, 5),
      });

      // Query with explicit category filter to ensure we only count valid records
      const { data: coalProvidersData, error: coalProvidersError } =
        await supabase
          .from("coal_providers")
          .select("id, category, name")
          .not("category", "is", null)
          .neq("category", "");

      const duration = Date.now() - startTime;
      console.log(`⏱️  [TRANSPARENCY] Coal providers query took ${duration}ms`);

      if (coalProvidersError) {
        console.error(
          "❌ [TRANSPARENCY] Error fetching coal providers:",
          coalProvidersError,
        );
        console.error("❌ [TRANSPARENCY] Coal providers error details:", {
          code: coalProvidersError.code,
          message: coalProvidersError.message,
          details: coalProvidersError.details,
          hint: coalProvidersError.hint,
        });
      } else {
        stats.coalProviders = coalProvidersData?.length || 0;
        console.log(
          "✅ [TRANSPARENCY] Coal providers count:",
          stats.coalProviders,
        );
        console.log(
          "✅ [TRANSPARENCY] Coal providers sample data:",
          coalProvidersData?.slice(0, 3),
        );
      }
    } catch (err) {
      console.error(
        "❌ [TRANSPARENCY] Exception fetching coal providers:",
        err,
      );
    }

    // Get transport providers count with enhanced error handling
    console.log("📊 [TRANSPARENCY] Fetching transport providers count...");
    try {
      const startTime = Date.now();

      // Query with explicit category filter to ensure we only count valid records
      const { data: transportProvidersData, error: transportProvidersError } =
        await supabase
          .from("transport_providers")
          .select("id, category")
          .not("category", "is", null)
          .neq("category", "");

      const duration = Date.now() - startTime;
      console.log(
        `⏱️  [TRANSPARENCY] Transport providers query took ${duration}ms`,
      );

      if (transportProvidersError) {
        console.error(
          "❌ [TRANSPARENCY] Error fetching transport providers:",
          transportProvidersError,
        );
        console.error("❌ [TRANSPARENCY] Transport providers error details:", {
          code: transportProvidersError.code,
          message: transportProvidersError.message,
          details: transportProvidersError.details,
          hint: transportProvidersError.hint,
        });
      } else {
        stats.transportProviders = transportProvidersData?.length || 0;
        console.log(
          "✅ [TRANSPARENCY] Transport providers count:",
          stats.transportProviders,
        );
        console.log(
          "✅ [TRANSPARENCY] Transport providers sample data:",
          transportProvidersData?.slice(0, 3),
        );
      }
    } catch (err) {
      console.error(
        "❌ [TRANSPARENCY] Exception fetching transport providers:",
        err,
      );
    }

    // Get labour contractors count with enhanced error handling
    console.log("📊 [TRANSPARENCY] Fetching labour contractors count...");
    try {
      const startTime = Date.now();

      // First, let's get the total count to debug
      const { data: allLabourContractors, error: allLabourError } =
        await supabase.from("labour_contractors").select("id, category, name");

      console.log("🔍 [TRANSPARENCY] All labour contractors:", {
        total: allLabourContractors?.length || 0,
        sample: allLabourContractors?.slice(0, 5),
      });

      // Query with explicit category filter to ensure we only count valid records
      const { data: labourData, error: labourError } = await supabase
        .from("labour_contractors")
        .select("id, category, name")
        .not("category", "is", null)
        .neq("category", "");

      const duration = Date.now() - startTime;
      console.log(
        `⏱️  [TRANSPARENCY] Labour contractors query took ${duration}ms`,
      );

      if (labourError) {
        console.error(
          "❌ [TRANSPARENCY] Error fetching labour contractors:",
          labourError,
        );
        console.error("❌ [TRANSPARENCY] Labour contractors error details:", {
          code: labourError.code,
          message: labourError.message,
          details: labourError.details,
          hint: labourError.hint,
        });
      } else {
        stats.labour = labourData?.length || 0;
        console.log(
          "✅ [TRANSPARENCY] Labour contractors count:",
          stats.labour,
        );
        console.log(
          "✅ [TRANSPARENCY] Labour contractors sample data:",
          labourData?.slice(0, 3),
        );
      }
    } catch (err) {
      console.error(
        "❌ [TRANSPARENCY] Exception fetching labour contractors:",
        err,
      );
    }

    console.log("🎉 [TRANSPARENCY] Final transparency stats:", stats);
    console.log("🎉 [TRANSPARENCY] Stats summary:", {
      total:
        stats.manufacturers +
        stats.coalProviders +
        stats.transportProviders +
        stats.labour,
      breakdown: stats,
    });

    return stats;
  } catch (error) {
    console.error(
      "💥 [TRANSPARENCY] Exception while fetching transparency stats:",
      error,
    );
    console.error("💥 [TRANSPARENCY] Error type:", typeof error);
    console.error("💥 [TRANSPARENCY] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });

    return {
      manufacturers: 0,
      coalProviders: 0,
      transportProviders: 0,
      labour: 0,
    };
  }
};

/**
 * Hook to use transparency stats in React components
 */
export const useTransparencyStats = () => {
  const [stats, setStats] = useState<TransparencyStats>({
    manufacturers: 0,
    coalProviders: 0,
    transportProviders: 0,
    labour: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTransparencyStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: loadStats,
  };
};
