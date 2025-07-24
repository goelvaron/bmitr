import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

// Types for labour contractor services
export type LabourContractor =
  Database["public"]["Tables"]["labour_contractors"]["Row"];
export type LabourContractorInquiry =
  Database["public"]["Tables"]["labour_contractor_inquiries"]["Row"];
export type LabourContractorProject =
  Database["public"]["Tables"]["labour_contractor_projects"]["Row"];
export type LabourContractorRating =
  Database["public"]["Tables"]["labour_contractor_ratings"]["Row"];

/**
 * Get labour contractor by ID
 */
export const getLabourContractorById = async (
  id: string,
): Promise<{ success: boolean; data?: LabourContractor; message: string }> => {
  try {
    const { data, error } = await supabase
      .from("labour_contractors")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching labour contractor:", error);
      return { success: false, message: "Failed to fetch labour contractor" };
    }

    return {
      success: true,
      data,
      message: "Labour contractor fetched successfully",
    };
  } catch (error) {
    console.error("Exception in getLabourContractorById:", error);
    return { success: false, message: "Failed to fetch labour contractor" };
  }
};

/**
 * Get labour contractor by phone number
 */
export const getLabourContractorByPhone = async (
  phone: string,
): Promise<{ success: boolean; data?: LabourContractor; message: string }> => {
  try {
    const { data, error } = await supabase
      .from("labour_contractors")
      .select("*")
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("Error fetching labour contractor by phone:", error);
      return { success: false, message: "Failed to fetch labour contractor" };
    }

    return {
      success: true,
      data: data || undefined,
      message: "Query completed successfully",
    };
  } catch (error) {
    console.error("Exception in getLabourContractorByPhone:", error);
    return { success: false, message: "Failed to fetch labour contractor" };
  }
};

/**
 * Update labour contractor profile
 */
export const updateLabourContractorProfile = async (
  id: string,
  updates: Partial<Omit<LabourContractor, "id" | "created_at" | "updated_at">>,
): Promise<{ success: boolean; data?: LabourContractor; message: string }> => {
  try {
    // Convert service_area array to string if needed for database storage
    const processedUpdates = { ...updates };
    if (
      processedUpdates.service_area &&
      Array.isArray(processedUpdates.service_area)
    ) {
      processedUpdates.service_area = processedUpdates.service_area.join(", ");
    }

    const { data, error } = await supabase
      .from("labour_contractors")
      .update(processedUpdates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating labour contractor:", error);
      return { success: false, message: "Failed to update profile" };
    }

    return { success: true, data, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Exception in updateLabourContractorProfile:", error);
    return { success: false, message: "Failed to update profile" };
  }
};

/**
 * Get inquiries for a labour contractor
 */
export const getLabourContractorInquiries = async (
  labourContractorId: string,
  status?: string,
): Promise<{
  success: boolean;
  data?: LabourContractorInquiry[];
  message: string;
}> => {
  try {
    let query = supabase
      .from("labour_contractor_inquiries")
      .select("*")
      .eq("labour_contractor_id", labourContractorId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching inquiries:", error);
      return { success: false, message: "Failed to fetch inquiries" };
    }

    return {
      success: true,
      data: data || [],
      message: "Inquiries fetched successfully",
    };
  } catch (error) {
    console.error("Exception in getLabourContractorInquiries:", error);
    return { success: false, message: "Failed to fetch inquiries" };
  }
};

/**
 * Update inquiry status and response
 */
export const updateInquiryResponse = async (
  inquiryId: string,
  response: string,
  status: string = "responded",
): Promise<{
  success: boolean;
  data?: LabourContractorInquiry;
  message: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("labour_contractor_inquiries")
      .update({
        response,
        status,
        response_date: new Date().toISOString(),
      })
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) {
      console.error("Error updating inquiry response:", error);
      return { success: false, message: "Failed to update inquiry" };
    }

    return { success: true, data, message: "Inquiry updated successfully" };
  } catch (error) {
    console.error("Exception in updateInquiryResponse:", error);
    return { success: false, message: "Failed to update inquiry" };
  }
};

/**
 * Get projects for a labour contractor
 */
export const getLabourContractorProjects = async (
  labourContractorId: string,
  status?: string,
): Promise<{
  success: boolean;
  data?: LabourContractorProject[];
  message: string;
}> => {
  try {
    let query = supabase
      .from("labour_contractor_projects")
      .select("*")
      .eq("labour_contractor_id", labourContractorId)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching projects:", error);
      return { success: false, message: "Failed to fetch projects" };
    }

    return {
      success: true,
      data: data || [],
      message: "Projects fetched successfully",
    };
  } catch (error) {
    console.error("Exception in getLabourContractorProjects:", error);
    return { success: false, message: "Failed to fetch projects" };
  }
};

/**
 * Create a new project from an inquiry
 */
export const createProjectFromInquiry = async (
  inquiryId: string,
  projectData: {
    project_name: string;
    start_date?: string;
    end_date?: string;
    estimated_budget?: number;
    notes?: string;
  },
): Promise<{
  success: boolean;
  data?: LabourContractorProject;
  message: string;
}> => {
  try {
    // First get the inquiry details
    const { data: inquiry, error: inquiryError } = await supabase
      .from("labour_contractor_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return { success: false, message: "Inquiry not found" };
    }

    // Create the project
    const { data, error } = await supabase
      .from("labour_contractor_projects")
      .insert({
        labour_contractor_id: inquiry.labour_contractor_id,
        inquiry_id: inquiryId,
        project_name: projectData.project_name,
        client_name: inquiry.client_name,
        client_contact: inquiry.client_phone,
        service_type: inquiry.service_type,
        project_description: inquiry.project_description,
        location: inquiry.location,
        start_date: projectData.start_date,
        end_date: projectData.end_date,
        estimated_budget: projectData.estimated_budget,
        status: "active",
        notes: projectData.notes,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return { success: false, message: "Failed to create project" };
    }

    // Update inquiry status to "converted"
    await supabase
      .from("labour_contractor_inquiries")
      .update({ status: "converted" })
      .eq("id", inquiryId);

    return { success: true, data, message: "Project created successfully" };
  } catch (error) {
    console.error("Exception in createProjectFromInquiry:", error);
    return { success: false, message: "Failed to create project" };
  }
};

/**
 * Update project progress
 */
export const updateProjectProgress = async (
  projectId: string,
  updates: {
    progress_percentage?: number;
    status?: string;
    actual_cost?: number;
    notes?: string;
  },
): Promise<{
  success: boolean;
  data?: LabourContractorProject;
  message: string;
}> => {
  try {
    const { data, error } = await supabase
      .from("labour_contractor_projects")
      .update(updates)
      .eq("id", projectId)
      .select()
      .single();

    if (error) {
      console.error("Error updating project:", error);
      return { success: false, message: "Failed to update project" };
    }

    return { success: true, data, message: "Project updated successfully" };
  } catch (error) {
    console.error("Exception in updateProjectProgress:", error);
    return { success: false, message: "Failed to update project" };
  }
};

/**
 * Get ratings for a labour contractor
 */
export const getLabourContractorRatings = async (
  labourContractorId: string,
): Promise<{
  success: boolean;
  data?: LabourContractorRating[];
  message: string;
  averageRating?: number;
}> => {
  try {
    const { data, error } = await supabase
      .from("labour_contractor_ratings")
      .select("*")
      .eq("labour_contractor_id", labourContractorId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching ratings:", error);
      return { success: false, message: "Failed to fetch ratings" };
    }

    const ratings = data || [];
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.rating, 0) /
          ratings.length
        : 0;

    return {
      success: true,
      data: ratings,
      message: "Ratings fetched successfully",
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
    };
  } catch (error) {
    console.error("Exception in getLabourContractorRatings:", error);
    return { success: false, message: "Failed to fetch ratings" };
  }
};

/**
 * Search labour contractors by location and service type
 */
export const searchLabourContractors = async (filters: {
  country?: string;
  state?: string;
  city?: string;
  service_types?: string[];
  experience_years?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // in kilometers
}): Promise<{
  success: boolean;
  data?: LabourContractor[];
  message: string;
}> => {
  try {
    let query = supabase
      .from("labour_contractors")
      .select("*")
      .eq("is_active", true);

    if (filters.country) {
      query = query.eq("country", filters.country);
    }

    if (filters.state) {
      query = query.eq("state", filters.state);
    }

    if (filters.city) {
      query = query.ilike("city", `%${filters.city}%`);
    }

    if (filters.service_types && filters.service_types.length > 0) {
      query = query.overlaps("service_types", filters.service_types);
    }

    if (filters.experience_years) {
      query = query.eq("experience_years", filters.experience_years);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Error searching labour contractors:", error);
      return { success: false, message: "Failed to search labour contractors" };
    }

    let results = data || [];

    // If location-based search is requested, filter by distance
    if (filters.latitude && filters.longitude && filters.radius) {
      results = results.filter((contractor) => {
        if (!contractor.latitude || !contractor.longitude) return false;

        const distance = calculateDistance(
          filters.latitude!,
          filters.longitude!,
          parseFloat(contractor.latitude.toString()),
          parseFloat(contractor.longitude.toString()),
        );

        return distance <= filters.radius!;
      });
    }

    return {
      success: true,
      data: results,
      message: "Search completed successfully",
    };
  } catch (error) {
    console.error("Exception in searchLabourContractors:", error);
    return { success: false, message: "Failed to search labour contractors" };
  }
};

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}
