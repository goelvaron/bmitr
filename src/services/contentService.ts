import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

export interface ContentItem {
  id: string;
  key: string;
  value: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ContentData {
  // Landing Page Content
  heroTitle: string;
  heroSubtitle: string;
  countdownTitle: string;
  countdownDescription: string;
  countdownLaunchMessage: string;
  countdownPlatformUnlocked: string;

  // Services Page Content
  servicesTitle: string;
  servicesDescription: string;
  freeServicesTitle: string;
  freeServicesDescription: string;
  exclusiveServicesTitle: string;
  exclusiveServicesDescription: string;
  freeServiceItem1: string;
  freeServiceItem2: string;
  freeServiceItem3: string;
  freeServiceItem4: string;
  freeServiceItem5: string;
  freeServiceItem6: string;
  freeServiceItem7: string;
  exclusiveServiceItem1: string;
  exclusiveServiceItem2: string;
  exclusiveServiceItem3: string;
  exclusiveServiceItem4: string;
  exclusiveServiceItem5: string;
  exclusiveServiceItem6: string;
  exclusiveServiceItem7: string;
  exclusiveServiceNote: string;

  // About Us Page Content
  aboutTitle: string;
  aboutDescription1: string;
  aboutDescription2: string;

  // Blog Page Content
  blogTitle: string;
  blogSubtitle: string;
  blogAboutTitle: string;
  blogAboutDescription: string;

  // Join Waitlist Page Content
  waitlistTitle: string;
  waitlistDescription: string;

  // Reach Us Page Content
  reachUsTitle: string;
  reachUsSubtitle: string;
  reachUsContactInfo: string;
  reachUsEmail: string;
  reachUsPhone: string;
  reachUsAddress: string;
  reachUsHours: string;
  reachUsFollowUs: string;
  reachUsSendMessage: string;
  reachUsFirstName: string;
  reachUsLastName: string;
  reachUsSubject: string;
  reachUsMessage: string;

  // Contact Information
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  businessHours: string;

  // Navigation Menu Items
  navAboutUs: string;
  navEentMarket: string;
  navServices: string;
  navJoinWaitlist: string;
  navBlog: string;
  navReachUs: string;
  headerLoginDashboard: string;
  headerDashboardBrickKilnOwners: string;
  headerDashboardCoalProviders: string;
  headerDashboardTransportProviders: string;
  headerDashboardServiceProviders: string;
  headerDashboardLabour: string;

  // Footer Content
  footerDescription: string;
  footerQuickLinks: string;
  footerContact: string;
  footerFollowUs: string;
  footerCopyright: string;

  // Transparency Section Content
  transparencyTitle: string;
  transparencyDescription: string;
  transparencyManufacturersLabel: string;
  transparencyCoalProvidersLabel: string;
  transparencyTransportProvidersLabel: string;
  transparencyLabourLabel: string;

  // e-ENT BAZAAR Specific Content
  eentAboutTitle: string;
  eentAboutDescription: string;
  eentContactTitle: string;
  eentContactDescription: string;
  eentContactEmail: string;
  eentContactPhone: string;
  eentContactAddress: string;
  eentBusinessHours: string;

  // Dynamic content - allows for any additional fields
  [key: string]: string;
}

export interface ContentSection {
  id: string;
  name: string;
  category: string;
  fields: ContentField[];
  order: number;
  isActive: boolean;
}

export interface ContentField {
  key: string;
  label: string;
  type: "text" | "textarea" | "rich-text" | "image" | "url";
  value: string;
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Get all website content from the database
 */
export const getWebsiteContent = async (): Promise<ContentData> => {
  try {
    const { data, error } = await supabase.from("website_content").select("*");

    if (error) {
      console.error("Error fetching website content:", error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    // Convert array of content items to ContentData object
    const contentData: Partial<ContentData> = {};
    data?.forEach((item: ContentItem) => {
      (contentData as any)[item.key] = item.value;
    });

    // Return with defaults for any missing keys
    return {
      // Landing Page Content
      heroTitle:
        contentData.heroTitle ||
        "Bhatta Mitra™ - Free Digital Platform for Brick Manufacturers & Other Stakeholders",
      heroSubtitle:
        contentData.heroSubtitle ||
        "Bhatta Mitra™ -Free digital platform designed to connect red brick buyers with local brick manufacturers through its e-ENT BAZAAR™ , while also bridging manufacturers with essential service providers such as coal suppliers, transporters, machinery vendors, service providers, labor contractors and much more",
      countdownTitle: contentData.countdownTitle || "Platform Unlocked",
      countdownDescription:
        contentData.countdownDescription ||
        "We are excited to announce that Bhatta Mitra™ will be launching on April 30, 2025. Join our waitlist to be among the first to access our platform.",
      countdownLaunchMessage:
        contentData.countdownLaunchMessage ||
        "LAUNCHED ON 30TH APRIL 2025, BRICK KILN OWNERS (BKOs) CAN FILL UP THE ONBOARDING FORM TO JOIN OUR MEMBERSHIP WAITINGLIST",
      countdownPlatformUnlocked:
        contentData.countdownPlatformUnlocked ||
        "UNLOCKED OUR DIGITAL PLATFORM SERVICES FOR ALL STAKEHOLDERS. PLEASE CONTACT US TO JOIN OUR UNIQUE PLATFORM.",

      // Services Page Content
      servicesTitle: contentData.servicesTitle || "Our Services",
      servicesDescription:
        contentData.servicesDescription ||
        "Comprehensive solutions for the brick kiln industry",
      freeServicesTitle: contentData.freeServicesTitle || "Free Services",
      freeServicesDescription:
        contentData.freeServicesDescription ||
        "Available to all registered users",
      exclusiveServicesTitle:
        contentData.exclusiveServicesTitle || "Exclusive Services",
      exclusiveServicesDescription:
        contentData.exclusiveServicesDescription ||
        "Limited availability premium services",
      freeServiceItem1:
        contentData.freeServiceItem1 ||
        "Buy e-ENT dashboard for Red Brick Buyers",
      freeServiceItem2:
        contentData.freeServiceItem2 ||
        "List of certified Coal/Fuel and Transport providers",
      freeServiceItem3:
        contentData.freeServiceItem3 ||
        "Labor recruitment reports and forms and real-time fraud alerts",
      freeServiceItem4:
        contentData.freeServiceItem4 || "Digital resource management",
      freeServiceItem5:
        contentData.freeServiceItem5 || "Basic stakeholder communication tools",
      freeServiceItem6:
        contentData.freeServiceItem6 || "Industry updates and news",
      freeServiceItem7:
        contentData.freeServiceItem7 ||
        "Blogs and resources for innovative and new technologies",
      exclusiveServiceItem1:
        contentData.exclusiveServiceItem1 || "Free services plus",
      exclusiveServiceItem2:
        contentData.exclusiveServiceItem2 || "Access to bulk sales orders",
      exclusiveServiceItem3:
        contentData.exclusiveServiceItem3 || "Advanced analytics and reporting",
      exclusiveServiceItem4:
        contentData.exclusiveServiceItem4 || "Priority access to new features",
      exclusiveServiceItem5:
        contentData.exclusiveServiceItem5 || "Dedicated support team",
      exclusiveServiceItem6:
        contentData.exclusiveServiceItem6 ||
        "Customized solutions for your business",
      exclusiveServiceItem7:
        contentData.exclusiveServiceItem7 || "Marketing and brand building",
      exclusiveServiceNote:
        contentData.exclusiveServiceNote ||
        "Fill up our Questionnaire- Join the waitlist now!",

      // About Us Page Content
      aboutTitle: contentData.aboutTitle || "About Bhatta Mitra™",
      aboutDescription1:
        contentData.aboutDescription1 ||
        "Bhatta Mitra™ officially launched in April 2025, but its roots trace back to 2013 when the founder, Mr. Varun Goel, entered the brick manufacturing industry. Our founder is well-acquainted with the complexities and daily challenges faced by brick kiln owners. This understanding and hardships led to the development of an idea specifically designed to address these issues and help overcome the difficulties inherent in this otherwise marvelous industry. India is the second-largest producer of bricks globally, producing approximately 250 billion bricks annually, supported by around 140,000 brick kilns employing approximately 15 million workers.",
      aboutDescription2:
        contentData.aboutDescription2 ||
        " The brick kiln industry in India suffers from lack of standardization, minimal policy oversight, and operates largely in an unregulated, informal manner. These issues lead to poor quality control, unsafe labor practices, and environmental harm. Bhatta Mitra aims to address these challenges by introducing digital transparency, standard practices, and formal linkages for kiln owners and workers alike while lifting the economic quotient of Brick kiln owners.",

      // Blog Page Content
      blogTitle: contentData.blogTitle || "Blogs & Resources",
      blogSubtitle:
        contentData.blogSubtitle ||
        "Latest news and updates from Bhatta Mitra™",
      blogAboutTitle: contentData.blogAboutTitle || "About Our Blog",
      blogAboutDescription:
        contentData.blogAboutDescription ||
        "Stay updated with the latest news, innovations, and insights from the brick kiln industry.",

      // Join Waitlist Page Content
      waitlistTitle: contentData.waitlistTitle || "Join our Waiting List",
      waitlistDescription:
        contentData.waitlistDescription ||
        "Bhatta Mitra ™ membership open for only limited number of Brick Manufacturers (BKOs) from each district Pan India.",

      // Reach Us Page Content
      reachUsTitle: contentData.reachUsTitle || "Reach Us",
      reachUsSubtitle:
        contentData.reachUsSubtitle ||
        "Get in touch with us. We are here to help and answer any questions you might have.",
      reachUsContactInfo:
        contentData.reachUsContactInfo || "Contact Information",
      reachUsEmail: contentData.reachUsEmail || "Email",
      reachUsPhone: contentData.reachUsPhone || "Phone",
      reachUsAddress: contentData.reachUsAddress || "Address",
      reachUsHours: contentData.reachUsHours || "Business Hours",
      reachUsFollowUs: contentData.reachUsFollowUs || "Follow Us",
      reachUsSendMessage: contentData.reachUsSendMessage || "Send us a Message",
      reachUsFirstName: contentData.reachUsFirstName || "First Name",
      reachUsLastName: contentData.reachUsLastName || "Last Name",
      reachUsSubject: contentData.reachUsSubject || "Subject",
      reachUsMessage: contentData.reachUsMessage || "Message",

      // Contact Information
      contactEmail: contentData.contactEmail || "BHATTAMITRA@PROTONMAIL.COM",
      contactPhone: contentData.contactPhone || "+918008009560",
      contactAddress:
        contentData.contactAddress ||
        "SAHARANPUR, UTTAR PRADESH (UP), INDIA 247232",
      businessHours:
        contentData.businessHours ||
        "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed",

      // Navigation Menu Items
      navAboutUs: contentData.navAboutUs || "About Us",
      navEentMarket: contentData.navEentMarket || "e-ENT BAZAAR",
      navServices: contentData.navServices || "Services",
      navJoinWaitlist: contentData.navJoinWaitlist || "Join Waitlist",
      navBlog: contentData.navBlog || "Blogs & Resources",
      navReachUs: contentData.navReachUs || "Reach Us",
      headerLoginDashboard:
        contentData.headerLoginDashboard || "Login Dashboard",
      headerDashboardBrickKilnOwners:
        contentData.headerDashboardBrickKilnOwners || "Brick Kiln Owners",
      headerDashboardCoalProviders:
        contentData.headerDashboardCoalProviders || "Coal/Fuel Providers",
      headerDashboardTransportProviders:
        contentData.headerDashboardTransportProviders || "Transport Providers",
      headerDashboardServiceProviders:
        contentData.headerDashboardServiceProviders ||
        "Service/Product Providers",
      headerDashboardLabour: contentData.headerDashboardLabour || "Labour",

      // Footer Content
      footerDescription:
        contentData.footerDescription ||
        "A free digital platform for brick kiln owners and stakeholders. A friend in your need.",
      footerQuickLinks: contentData.footerQuickLinks || "Quick Links",
      footerContact: contentData.footerContact || "Contact",
      footerFollowUs: contentData.footerFollowUs || "Follow Us",
      footerCopyright: contentData.footerCopyright || "All rights reserved.",

      // Transparency Section Content
      transparencyTitle:
        contentData.transparencyTitle || "Our Growing Community",
      transparencyDescription:
        contentData.transparencyDescription ||
        "Join thousands of stakeholders who trust Bhatta Mitra™ for their business needs",
      transparencyManufacturersLabel:
        contentData.transparencyManufacturersLabel ||
        "Registered Manufacturers",
      transparencyCoalProvidersLabel:
        contentData.transparencyCoalProvidersLabel || "Coal/Fuel Providers",
      transparencyTransportProvidersLabel:
        contentData.transparencyTransportProvidersLabel ||
        "Transport Providers",
      transparencyLabourLabel:
        contentData.transparencyLabourLabel || "Labour Personnel",

      // e-ENT BAZAAR Specific Content
      eentAboutTitle: contentData.eentAboutTitle || "About e-ENT BAZAAR™",
      eentAboutDescription:
        contentData.eentAboutDescription ||
        "e-ENT BAZAAR™ is your trusted marketplace for premium quality bricks, tiles and others. We connect brick buyers directly with verified manufacturers across India, ensuring quality products at competitive prices. Our platform simplifies the brick procurement process, making it easier for construction professionals, contractors, and individual buyers to find the right bricks for their projects.",
      eentContactTitle:
        contentData.eentContactTitle || "Contact e-ENT BAZAAR™",
      eentContactDescription:
        contentData.eentContactDescription ||
        "Get in touch with our e-ENT BAZAAR™ team for any queries related to brick procurement, seller onboarding, or platform support.",
      eentContactEmail:
        contentData.eentContactEmail || "eentbazaar@protonmail.com",
      eentContactPhone: contentData.eentContactPhone || "+918008009560",
      eentContactAddress:
        contentData.eentContactAddress ||
        "e-ENT BAZAAR™ Operations, Saharanpur, Uttar Pradesh (UP), India 247232",
      eentBusinessHours:
        contentData.eentBusinessHours ||
        "Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: 10:00 AM - 4:00 PM",
    };
  } catch (err) {
    console.error("Exception in getWebsiteContent:", err);
    throw err;
  }
};

/**
 * Update website content in the database
 */
export const updateWebsiteContent = async (
  contentData: ContentData,
): Promise<void> => {
  try {
    // Convert ContentData object to array of updates
    const updates = Object.entries(contentData).map(([key, value]) => ({
      key,
      value,
      category: getCategoryForKey(key),
    }));

    // Use upsert to insert or update each content item
    for (const update of updates) {
      const { error } = await supabase.from("website_content").upsert(
        {
          key: update.key,
          value: update.value,
          category: update.category,
        },
        {
          onConflict: "key",
        },
      );

      if (error) {
        console.error(`Error updating content for key ${update.key}:`, error);
        throw new Error(`Failed to update ${update.key}: ${error.message}`);
      }
    }

    console.log("Website content updated successfully");
  } catch (err) {
    console.error("Exception in updateWebsiteContent:", err);
    throw err;
  }
};

/**
 * Add a new content field
 */
export const addContentField = async (
  key: string,
  value: string,
  category: string,
): Promise<void> => {
  try {
    const { error } = await supabase.from("website_content").insert({
      key,
      value,
      category,
    });

    if (error) {
      console.error(`Error adding content field ${key}:`, error);
      throw new Error(`Failed to add ${key}: ${error.message}`);
    }

    console.log(`Content field ${key} added successfully`);
  } catch (err) {
    console.error("Exception in addContentField:", err);
    throw err;
  }
};

/**
 * Delete a content field
 */
export const deleteContentField = async (key: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("website_content")
      .delete()
      .eq("key", key);

    if (error) {
      console.error(`Error deleting content field ${key}:`, error);
      throw new Error(`Failed to delete ${key}: ${error.message}`);
    }

    console.log(`Content field ${key} deleted successfully`);
  } catch (err) {
    console.error("Exception in deleteContentField:", err);
    throw err;
  }
};

/**
 * Get all content fields grouped by category
 */
export const getContentByCategory = async (): Promise<
  Record<string, ContentItem[]>
> => {
  try {
    const { data, error } = await supabase
      .from("website_content")
      .select("*")
      .order("category", { ascending: true })
      .order("key", { ascending: true });

    if (error) {
      console.error("Error fetching content by category:", error);
      throw new Error(`Failed to fetch content: ${error.message}`);
    }

    const grouped: Record<string, ContentItem[]> = {};
    data?.forEach((item: ContentItem) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return grouped;
  } catch (err) {
    console.error("Exception in getContentByCategory:", err);
    throw err;
  }
};

/**
 * Get available categories
 */
export const getContentCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("website_content")
      .select("category")
      .order("category", { ascending: true });

    if (error) {
      console.error("Error fetching categories:", error);
      throw new Error(`Failed to fetch categories: ${error.message}`);
    }

    const categories = [...new Set(data?.map((item) => item.category) || [])];
    return categories;
  } catch (err) {
    console.error("Exception in getContentCategories:", err);
    throw err;
  }
};

/**
 * Get category for a content key
 */
function getCategoryForKey(key: string): string {
  if (key.startsWith("hero") || key.startsWith("countdown")) return "landing";
  if (
    key.startsWith("services") ||
    key.includes("Services") ||
    key.includes("Service")
  )
    return "services";
  if (key.startsWith("about")) return "about";
  if (key.startsWith("blog")) return "blog";
  if (key.startsWith("waitlist")) return "waitlist";
  if (key.startsWith("reachUs")) return "reach-us";
  if (key.startsWith("contact") || key.startsWith("business")) return "contact";
  if (key.startsWith("nav") || key.startsWith("header")) return "navigation";
  if (key.startsWith("footer")) return "footer";
  if (key.startsWith("transparency")) return "transparency";
  if (key.startsWith("eent")) return "eent-bazaar";
  return "general";
}

// Global content cache and listeners for real-time updates
let globalContentCache: ContentData | null = null;
let globalContentLoading = false;
let globalContentPromise: Promise<ContentData> | null = null;
const contentListeners: Set<(content: ContentData) => void> = new Set();

// Function to notify all listeners of content changes
const notifyContentChange = (newContent: ContentData) => {
  globalContentCache = newContent;
  contentListeners.forEach((listener) => listener(newContent));
};

// Function to subscribe to content changes
const subscribeToContentChanges = (
  listener: (content: ContentData) => void,
) => {
  contentListeners.add(listener);
  return () => contentListeners.delete(listener);
};

// Function to preload content globally
const preloadGlobalContent = async (): Promise<ContentData> => {
  if (globalContentCache) {
    return globalContentCache;
  }

  if (globalContentPromise) {
    return globalContentPromise;
  }

  globalContentLoading = true;
  globalContentPromise = getWebsiteContent();

  try {
    const content = await globalContentPromise;
    globalContentCache = content;
    globalContentLoading = false;
    notifyContentChange(content);
    return content;
  } catch (error) {
    globalContentLoading = false;
    globalContentPromise = null;
    throw error;
  }
};

/**
 * Hook to use website content in React components
 */
export const useWebsiteContent = () => {
  const [content, setContent] = useState<ContentData>(() => {
    // Always use cached content if available to prevent flash
    return globalContentCache || getDefaultContent();
  });
  const [loading, setLoading] = useState(() => {
    // Only show loading if we don't have cached content
    return !globalContentCache && !globalContentLoading;
  });
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await preloadGlobalContent();
      setContent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load content");
      // Keep current content on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load content if not already cached or loading
    if (!globalContentCache && !globalContentLoading) {
      loadContent();
    } else if (globalContentCache) {
      // If content is already cached, use it immediately
      setContent(globalContentCache);
      setLoading(false);
    }

    // Subscribe to content changes
    const unsubscribe = subscribeToContentChanges((newContent) => {
      setContent(newContent);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const updateContent = async (newContent: ContentData) => {
    try {
      await updateWebsiteContent(newContent);
      setContent(newContent);
      notifyContentChange(newContent); // Update global cache and notify all listeners
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update content");
      return false;
    }
  };

  return {
    content,
    loading,
    error,
    updateContent,
    refreshContent: loadContent,
  };
};

// Export the preload function for use in main app initialization
export { preloadGlobalContent };

// Export function to manually refresh content (for admin dashboard)
export const refreshGlobalContent = async () => {
  try {
    const data = await getWebsiteContent();
    notifyContentChange(data);
    return data;
  } catch (err) {
    console.error("Failed to refresh global content:", err);
    throw err;
  }
};

/**
 * Get default content to prevent content flash
 */
const getDefaultContent = (): ContentData => {
  return {
    // Landing Page Content
    heroTitle: "Bhatta Mitra™ - Digital Platform for Brick Kiln Industry",
    heroSubtitle:
      "A professional landing page for Bhatta Mitra™, a free digital platform connecting brick kiln owners with stakeholders",
    countdownTitle: "Platform Unlocked",
    countdownDescription:
      "We are excited to announce that Bhatta Mitra™ will be launching on April 30, 2025. Join our waitlist to be among the first to access our platform.",
    countdownLaunchMessage:
      "LAUNCHED ON 30TH APRIL 2025, BRICK KILN OWNERS (BKOs) CAN FILL UP THE ONBOARDING FORM TO JOIN OUR MEMBERSHIP WAITINGLIST",
    countdownPlatformUnlocked:
      "UNLOCKED OUR DIGITAL PLATFORM SERVICES FOR ALL STAKEHOLDERS. PLEASE CONTACT US TO JOIN OUR UNIQUE PLATFORM.",

    // Services Page Content
    servicesTitle: "Our Services",
    servicesDescription: "Comprehensive solutions for the brick kiln industry",
    freeServicesTitle: "Free Services",
    freeServicesDescription: "Available to all registered users",
    exclusiveServicesTitle: "Exclusive Services",
    exclusiveServicesDescription: "Limited availability premium services",
    freeServiceItem1: "Buy e-ENT dashboard for Red Brick Buyers",
    freeServiceItem2: "List of certified Coal/Fuel and Transport providers",
    freeServiceItem3:
      "Labor recruitment reports and forms and real-time fraud alerts",
    freeServiceItem4: "Digital resource management",
    freeServiceItem5: "Basic stakeholder communication tools",
    freeServiceItem6: "Industry updates and news",
    freeServiceItem7: "Blogs and resources for innovative and new technologies",
    exclusiveServiceItem1: "Free services plus",
    exclusiveServiceItem2: "Access to bulk sales orders",
    exclusiveServiceItem3: "Advanced analytics and reporting",
    exclusiveServiceItem4: "Priority access to new features",
    exclusiveServiceItem5: "Dedicated support team",
    exclusiveServiceItem6: "Customized solutions for your business",
    exclusiveServiceItem7: "Marketing and brand building",
    exclusiveServiceNote: "Fill up our Questionnaire- Join the waitlist now!",

    // About Us Page Content
    aboutTitle: "About Bhatta Mitra™",
    aboutDescription1:
      "Bhatta Mitra™, a friend in your need - a free digital platform to connect Pan India brick kiln owners with end customers of red bricks, fuel and transport and other service providers and to prevent labor fraud as well as to bring innovation.",
    aboutDescription2:
      "Bhatta Mitra™, a friend in your need - a free digital platform to connect Pan India brick kiln owners with end customers of red bricks, fuel and transport and other service providers, to prevent labor fraud and for innovation in the industry",

    // Blog Page Content
    blogTitle: "Blogs & Resources",
    blogSubtitle: "Latest news and updates from Bhatta Mitra™",
    blogAboutTitle: "About Our Blog",
    blogAboutDescription:
      "Stay updated with the latest news, innovations, and insights from the brick kiln industry.",

    // Join Waitlist Page Content
    waitlistTitle: "Join our Waiting List",
    waitlistDescription:
      "Bhatta Mitra ™ membership open for only limited number of Brick Manufacturers (BKOs) from each district Pan India.",

    // Reach Us Page Content
    reachUsTitle: "Reach Us",
    reachUsSubtitle:
      "Get in touch with us. We are here to help and answer any questions you might have.",
    reachUsContactInfo: "Contact Information",
    reachUsEmail: "Email",
    reachUsPhone: "Phone",
    reachUsAddress: "Address",
    reachUsHours: "Business Hours",
    reachUsFollowUs: "Follow Us",
    reachUsSendMessage: "Send us a Message",
    reachUsFirstName: "First Name",
    reachUsLastName: "Last Name",
    reachUsSubject: "Subject",
    reachUsMessage: "Message",

    // Contact Information
    contactEmail: "BHATTAMITRA@PROTONMAIL.COM",
    contactPhone: "+918008009560",
    contactAddress: "SAHARANPUR, UTTAR PRADESH (UP), INDIA 247232",
    businessHours:
      "Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 9:00 AM - 2:00 PM\nSunday: Closed",

    // Navigation Menu Items
    navAboutUs: "About Us",
    navEentMarket: "e-ENT BAZAAR",
    navServices: "Services",
    navJoinWaitlist: "Join Waitlist",
    navBlog: "Blogs & Resources",
    navReachUs: "Reach Us",
    headerLoginDashboard: "Login Dashboard",
    headerDashboardBrickKilnOwners: "Brick Kiln Owners",
    headerDashboardCoalProviders: "Coal/Fuel Providers",
    headerDashboardTransportProviders: "Transport Providers",
    headerDashboardServiceProviders: "Service/Product Providers",
    headerDashboardLabour: "Labour",

    // Footer Content
    footerDescription:
      "A free digital platform for brick kiln owners and stakeholders. A friend in your need.",
    footerQuickLinks: "Quick Links",
    footerContact: "Contact",
    footerFollowUs: "Follow Us",
    footerCopyright: "All rights reserved.",

    // Transparency Section Content
    transparencyTitle: "Our Growing Community",
    transparencyDescription:
      "Join thousands of stakeholders who trust Bhatta Mitra™ for their business needs",
    transparencyManufacturersLabel: "Registered Manufacturers",
    transparencyCoalProvidersLabel: "Coal/Fuel Providers",
    transparencyTransportProvidersLabel: "Transport Providers",
    transparencyLabourLabel: "Labour Personnel",

    // e-ENT BAZAAR Specific Content
    eentAboutTitle: "About e-ENT BAZAAR™",
    eentAboutDescription:
      "e-ENT BAZAAR™ is your trusted marketplace for premium quality bricks, tiles and others. We connect brick buyers directly with verified manufacturers across India, ensuring quality products at competitive prices.",
    eentContactTitle: "Contact e-ENT BAZAAR™",
    eentContactDescription:
      "Get in touch with our e-ENT BAZAAR™ team for any queries related to brick procurement, seller onboarding, or platform support.",
    eentContactEmail: "eentbazaar@protonmail.com",
    eentContactPhone: "+918008009560",
    eentContactAddress:
      "e-ENT BAZAAR™ Operations, Saharanpur, Uttar Pradesh (UP), India 247232",
    eentBusinessHours:
      "Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: 10:00 AM - 4:00 PM",
  };
};
