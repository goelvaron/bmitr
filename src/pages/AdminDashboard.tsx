import React, {
  useState,
  useEffect,
  Component,
  ErrorInfo,
  ReactNode,
} from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getBloggerConfig, saveBloggerConfig } from "@/services/bloggerService";
import { useToast } from "@/components/ui/use-toast";
import {
  getWebsiteContent,
  updateWebsiteContent,
  refreshGlobalContent,
  addContentField,
  deleteContentField,
  getContentByCategory,
  type ContentData,
} from "@/services/contentService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Lazy load components to prevent initial render blocking
const CustomersList = React.lazy(
  () => import("@/components/admin/CustomersList"),
);
const ManufacturersList = React.lazy(
  () => import("@/components/admin/ManufacturersList"),
);
const CustomerAnalytics = React.lazy(
  () => import("@/components/admin/CustomerAnalytics"),
);
const WaitlistDataViewer = React.lazy(
  () => import("@/components/admin/WaitlistDataViewer"),
);

export default function AdminDashboard() {
  const { toast } = useToast();

  // Security check - ensure this component is only rendered within AdminAuthGuard
  useEffect(() => {
    const adminToken = localStorage.getItem("admin_session_token");
    const adminExpiry = localStorage.getItem("admin_session_expiry");

    if (!adminToken || !adminExpiry || Date.now() >= parseInt(adminExpiry)) {
      // This should not happen if AdminAuthGuard is working correctly
      console.error("Unauthorized access attempt to AdminDashboard");
      window.location.href = "/";
      return;
    }
  }, []);
  const [blogId, setBlogId] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentSaving, setContentSaving] = useState(false);
  const [showAddFieldDialog, setShowAddFieldDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null,
  );
  const [newFieldData, setNewFieldData] = useState({
    key: "",
    label: "",
    value: "",
    category: "general",
    type: "text" as "text" | "textarea",
  });

  // Content Management State
  const [contentData, setContentData] = useState<ContentData>(() => ({
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
    waitlistTitle: "Join Our Waitlist",
    waitlistDescription:
      "Fill out the onboarding form below to be among the first to access Bhatta Mitra™ - a friend in your need when we launch on April 30, 2025.",

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

    // Additional required fields from ContentData interface
    transparencyTitle: "Our Growing Community",
    transparencyDescription:
      "Join thousands of stakeholders who trust Bhatta Mitra™ for their business needs",
    transparencyManufacturersLabel: "Registered Manufacturers",
    transparencyCoalProvidersLabel: "Coal/Fuel Providers",
    transparencyTransportProvidersLabel: "Transport Providers",
    transparencyLabourLabel: "Labour Personnel",
    eentAboutTitle: "About e-ENT BAZAAR™",
    eentAboutDescription:
      "e-ENT BAZAAR™ is your trusted marketplace for premium quality bricks, tiles and others.",
    eentContactTitle: "Contact e-ENT BAZAAR™",
    eentContactDescription:
      "Get in touch with our e-ENT BAZAAR™ team for any queries.",
    eentContactEmail: "eentbazaar@protonmail.com",
    eentContactPhone: "+918008009560",
    eentContactAddress:
      "e-ENT BAZAAR™ Operations, Saharanpur, Uttar Pradesh (UP), India 247232",
    eentBusinessHours:
      "Monday - Saturday: 9:00 AM - 7:00 PM\nSunday: 10:00 AM - 4:00 PM",
  }));

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const config = await getBloggerConfig();
        if (config) {
          setBlogId(config.blogId || "");
          setApiKey(config.apiKey || "");
        }
      } catch (error) {
        console.error("Error loading blogger config:", error);
      }
    };
    loadConfig();

    // Load content data from database
    const loadContent = async () => {
      try {
        setContentLoading(true);
        const content = await getWebsiteContent();
        setContentData(content);
      } catch (error) {
        console.error("Error loading website content:", error);
        toast({
          title: "Error",
          description: "Failed to load website content",
          variant: "destructive",
        });
      } finally {
        setContentLoading(false);
      }
    };
    loadContent();
  }, [toast]);

  const handleSaveConfig = async () => {
    setLoading(true);
    try {
      await saveBloggerConfig({ blogId, apiKey });
      toast({
        title: "Success",
        description: "Blogger configuration saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save Blogger configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (field: string, value: string) => {
    setContentData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveContent = async () => {
    try {
      setContentSaving(true);
      await updateWebsiteContent(contentData);
      // Refresh global content cache to update all components
      await refreshGlobalContent();
      toast({
        title: "Success",
        description:
          "Content saved and published successfully! Changes are now live on the website.",
      });
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save and publish content",
        variant: "destructive",
      });
    } finally {
      setContentSaving(false);
    }
  };

  const handleExportContent = () => {
    const dataStr = JSON.stringify(contentData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "website-content.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleAddField = async () => {
    try {
      if (!newFieldData.key || !newFieldData.label) {
        toast({
          title: "Error",
          description: "Key and Label are required",
          variant: "destructive",
        });
        return;
      }

      // Check if key already exists
      if (contentData[newFieldData.key]) {
        toast({
          title: "Error",
          description: "A field with this key already exists",
          variant: "destructive",
        });
        return;
      }

      await addContentField(
        newFieldData.key,
        newFieldData.value,
        newFieldData.category,
      );

      // Update local state
      setContentData((prev) => ({
        ...prev,
        [newFieldData.key]: newFieldData.value,
      }));

      // Refresh global content
      await refreshGlobalContent();

      toast({
        title: "Success",
        description: "New field added successfully",
      });

      // Reset form
      setNewFieldData({
        key: "",
        label: "",
        value: "",
        category: "general",
        type: "text",
      });
      setShowAddFieldDialog(false);
    } catch (error) {
      console.error("Error adding field:", error);
      toast({
        title: "Error",
        description: "Failed to add new field",
        variant: "destructive",
      });
    }
  };

  const handleDeleteField = async (key: string) => {
    try {
      await deleteContentField(key);

      // Update local state
      const newContentData = { ...contentData };
      delete newContentData[key];
      setContentData(newContentData);

      // Refresh global content
      await refreshGlobalContent();

      toast({
        title: "Success",
        description: "Field deleted successfully",
      });

      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting field:", error);
      toast({
        title: "Error",
        description: "Failed to delete field",
        variant: "destructive",
      });
    }
  };

  const generateKeyFromLabel = (label: string) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "_")
      .replace(/^_+|_+$/g, "");
  };

  return (
    <div className="container mx-auto py-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="customers">
        <TabsList className="mb-4">
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
          <TabsTrigger value="content-mgmt">Content Management</TabsTrigger>
          <TabsTrigger value="content">Blog Management</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <ErrorBoundary
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    Error Loading Customers
                  </CardTitle>
                  <CardDescription>
                    There was an error loading the customers section. Please
                    refresh the page or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <React.Suspense
              fallback={
                <div className="flex justify-center items-center py-8">
                  Loading customers...
                </div>
              }
            >
              <CustomersList />
            </React.Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="manufacturers">
          <ErrorBoundary
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    Error Loading Manufacturers
                  </CardTitle>
                  <CardDescription>
                    There was an error loading the manufacturers section. Please
                    refresh the page or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <React.Suspense
              fallback={
                <div className="flex justify-center items-center py-8">
                  Loading manufacturers...
                </div>
              }
            >
              <ManufacturersList />
            </React.Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="analytics">
          <ErrorBoundary
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    Error Loading Analytics
                  </CardTitle>
                  <CardDescription>
                    There was an error loading the analytics section. Please
                    refresh the page or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <React.Suspense
              fallback={
                <div className="flex justify-center items-center py-8">
                  Loading analytics...
                </div>
              }
            >
              <CustomerAnalytics />
            </React.Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="waitlist">
          <ErrorBoundary
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">
                    Error Loading Waitlist
                  </CardTitle>
                  <CardDescription>
                    There was an error loading the waitlist section. Please
                    refresh the page or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Refresh Page
                  </Button>
                </CardContent>
              </Card>
            }
          >
            <React.Suspense
              fallback={
                <div className="flex justify-center items-center py-8">
                  Loading waitlist...
                </div>
              }
            >
              <WaitlistDataViewer />
            </React.Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="content-mgmt">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Live Content Management</h2>
                <p className="text-muted-foreground">
                  Edit, add, and delete website content sections in real-time
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleExportContent} variant="outline">
                  Export Content
                </Button>
                <Button
                  onClick={() => setShowAddFieldDialog(true)}
                  variant="outline"
                >
                  Add New Field
                </Button>
                <Button
                  onClick={handleSaveContent}
                  disabled={contentSaving || contentLoading}
                >
                  {contentSaving ? "Publishing..." : "Save & Publish Changes"}
                </Button>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Live Content Management Active
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Content changes are saved directly to the database and
                    published instantly to your website. No developer assistance
                    required!
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {/* Landing Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Landing Page Content</CardTitle>
                  <CardDescription>
                    Main hero section and key messaging
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">Hero Title</Label>
                    <div className="flex gap-2">
                      <Input
                        id="heroTitle"
                        value={contentData.heroTitle}
                        onChange={(e) =>
                          handleContentChange("heroTitle", e.target.value)
                        }
                        placeholder="Main headline for the landing page"
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("heroTitle")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="heroSubtitle"
                        value={contentData.heroSubtitle}
                        onChange={(e) =>
                          handleContentChange("heroSubtitle", e.target.value)
                        }
                        placeholder="Supporting text for the hero section"
                        rows={3}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("heroSubtitle")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countdownTitle">
                      Countdown Section Title
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="countdownTitle"
                        value={contentData.countdownTitle}
                        onChange={(e) =>
                          handleContentChange("countdownTitle", e.target.value)
                        }
                        placeholder="Title for countdown section"
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("countdownTitle")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countdownDescription">
                      Countdown Description
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="countdownDescription"
                        value={contentData.countdownDescription}
                        onChange={(e) =>
                          handleContentChange(
                            "countdownDescription",
                            e.target.value,
                          )
                        }
                        placeholder="Description for countdown section"
                        rows={3}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("countdownDescription")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countdownLaunchMessage">
                      Launch Message
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="countdownLaunchMessage"
                        value={contentData.countdownLaunchMessage}
                        onChange={(e) =>
                          handleContentChange(
                            "countdownLaunchMessage",
                            e.target.value,
                          )
                        }
                        placeholder="Message displayed after launch"
                        rows={2}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("countdownLaunchMessage")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="countdownPlatformUnlocked">
                      Platform Unlocked Message
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="countdownPlatformUnlocked"
                        value={contentData.countdownPlatformUnlocked}
                        onChange={(e) =>
                          handleContentChange(
                            "countdownPlatformUnlocked",
                            e.target.value,
                          )
                        }
                        placeholder="Message when platform is unlocked"
                        rows={2}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("countdownPlatformUnlocked")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Services Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Services Page Content</CardTitle>
                  <CardDescription>
                    Service descriptions and offerings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="servicesTitle">Services Page Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="servicesTitle"
                          value={contentData.servicesTitle}
                          onChange={(e) =>
                            handleContentChange("servicesTitle", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("servicesTitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="servicesDescription">
                        Services Description
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="servicesDescription"
                          value={contentData.servicesDescription}
                          onChange={(e) =>
                            handleContentChange(
                              "servicesDescription",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("servicesDescription")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freeServicesTitle">
                        Free Services Title
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="freeServicesTitle"
                          value={contentData.freeServicesTitle}
                          onChange={(e) =>
                            handleContentChange(
                              "freeServicesTitle",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("freeServicesTitle")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exclusiveServicesTitle">
                        Exclusive Services Title
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="exclusiveServicesTitle"
                          value={contentData.exclusiveServicesTitle}
                          onChange={(e) =>
                            handleContentChange(
                              "exclusiveServicesTitle",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("exclusiveServicesTitle")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="freeServicesDescription">
                        Free Services Description
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="freeServicesDescription"
                          value={contentData.freeServicesDescription}
                          onChange={(e) =>
                            handleContentChange(
                              "freeServicesDescription",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("freeServicesDescription")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exclusiveServicesDescription">
                        Exclusive Services Description
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="exclusiveServicesDescription"
                          value={contentData.exclusiveServicesDescription}
                          onChange={(e) =>
                            handleContentChange(
                              "exclusiveServicesDescription",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("exclusiveServicesDescription")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Free Service Items */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Free Service Items
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div key={num} className="space-y-1">
                          <Label
                            htmlFor={`freeServiceItem${num}`}
                            className="text-xs"
                          >
                            Item {num}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`freeServiceItem${num}`}
                              value={
                                contentData[
                                  `freeServiceItem${num}` as keyof ContentData
                                ] as string
                              }
                              onChange={(e) =>
                                handleContentChange(
                                  `freeServiceItem${num}`,
                                  e.target.value,
                                )
                              }
                              className="text-sm flex-grow"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setShowDeleteConfirm(`freeServiceItem${num}`)
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Exclusive Service Items */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Exclusive Service Items
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div key={num} className="space-y-1">
                          <Label
                            htmlFor={`exclusiveServiceItem${num}`}
                            className="text-xs"
                          >
                            Item {num}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`exclusiveServiceItem${num}`}
                              value={
                                contentData[
                                  `exclusiveServiceItem${num}` as keyof ContentData
                                ] as string
                              }
                              onChange={(e) =>
                                handleContentChange(
                                  `exclusiveServiceItem${num}`,
                                  e.target.value,
                                )
                              }
                              className="text-sm flex-grow"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setShowDeleteConfirm(
                                  `exclusiveServiceItem${num}`,
                                )
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="exclusiveServiceNote">
                      Exclusive Services Note
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="exclusiveServiceNote"
                        value={contentData.exclusiveServiceNote}
                        onChange={(e) =>
                          handleContentChange(
                            "exclusiveServiceNote",
                            e.target.value,
                          )
                        }
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("exclusiveServiceNote")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* About Us Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>About Us Page Content</CardTitle>
                  <CardDescription>
                    Company information and mission
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aboutTitle">About Us Title</Label>
                    <div className="flex gap-2">
                      <Input
                        id="aboutTitle"
                        value={contentData.aboutTitle}
                        onChange={(e) =>
                          handleContentChange("aboutTitle", e.target.value)
                        }
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("aboutTitle")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription1">
                      About Description (Paragraph 1)
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="aboutDescription1"
                        value={contentData.aboutDescription1}
                        onChange={(e) =>
                          handleContentChange(
                            "aboutDescription1",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("aboutDescription1")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aboutDescription2">
                      About Description (Paragraph 2)
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="aboutDescription2"
                        value={contentData.aboutDescription2}
                        onChange={(e) =>
                          handleContentChange(
                            "aboutDescription2",
                            e.target.value,
                          )
                        }
                        rows={3}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("aboutDescription2")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Blog Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Blog Page Content</CardTitle>
                  <CardDescription>
                    Blog page titles and descriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blogTitle">Blog Page Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="blogTitle"
                          value={contentData.blogTitle}
                          onChange={(e) =>
                            handleContentChange("blogTitle", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("blogTitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blogSubtitle">Blog Page Subtitle</Label>
                      <div className="flex gap-2">
                        <Input
                          id="blogSubtitle"
                          value={contentData.blogSubtitle}
                          onChange={(e) =>
                            handleContentChange("blogSubtitle", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("blogSubtitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="blogAboutTitle">Blog About Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="blogAboutTitle"
                          value={contentData.blogAboutTitle}
                          onChange={(e) =>
                            handleContentChange(
                              "blogAboutTitle",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("blogAboutTitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="blogAboutDescription">
                        Blog About Description
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="blogAboutDescription"
                          value={contentData.blogAboutDescription}
                          onChange={(e) =>
                            handleContentChange(
                              "blogAboutDescription",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("blogAboutDescription")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Join Waitlist Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Join Waitlist Page Content</CardTitle>
                  <CardDescription>
                    Waitlist page titles and descriptions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="waitlistTitle">Waitlist Page Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="waitlistTitle"
                          value={contentData.waitlistTitle}
                          onChange={(e) =>
                            handleContentChange("waitlistTitle", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("waitlistTitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="waitlistDescription">
                        Waitlist Description
                      </Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="waitlistDescription"
                          value={contentData.waitlistDescription}
                          onChange={(e) =>
                            handleContentChange(
                              "waitlistDescription",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("waitlistDescription")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Reach Us Page Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Reach Us Page Content</CardTitle>
                  <CardDescription>
                    Contact page content and form labels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reachUsTitle">Reach Us Page Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsTitle"
                          value={contentData.reachUsTitle}
                          onChange={(e) =>
                            handleContentChange("reachUsTitle", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsTitle")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsSubtitle">Reach Us Subtitle</Label>
                      <div className="flex gap-2">
                        <Textarea
                          id="reachUsSubtitle"
                          value={contentData.reachUsSubtitle}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsSubtitle",
                              e.target.value,
                            )
                          }
                          rows={2}
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsSubtitle")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reachUsContactInfo">
                        Contact Info Title
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsContactInfo"
                          value={contentData.reachUsContactInfo}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsContactInfo",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsContactInfo")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsFollowUs">Follow Us Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsFollowUs"
                          value={contentData.reachUsFollowUs}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsFollowUs",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsFollowUs")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsSendMessage">
                        Send Message Title
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsSendMessage"
                          value={contentData.reachUsSendMessage}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsSendMessage",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsSendMessage")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reachUsEmail">Email Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsEmail"
                          value={contentData.reachUsEmail}
                          onChange={(e) =>
                            handleContentChange("reachUsEmail", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsEmail")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsPhone">Phone Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsPhone"
                          value={contentData.reachUsPhone}
                          onChange={(e) =>
                            handleContentChange("reachUsPhone", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsPhone")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsAddress">Address Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsAddress"
                          value={contentData.reachUsAddress}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsAddress",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsAddress")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsHours">Business Hours Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsHours"
                          value={contentData.reachUsHours}
                          onChange={(e) =>
                            handleContentChange("reachUsHours", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsHours")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reachUsFirstName">First Name Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsFirstName"
                          value={contentData.reachUsFirstName}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsFirstName",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsFirstName")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsLastName">Last Name Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsLastName"
                          value={contentData.reachUsLastName}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsLastName",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("reachUsLastName")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsSubject">Subject Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsSubject"
                          value={contentData.reachUsSubject}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsSubject",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsSubject")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reachUsMessage">Message Label</Label>
                      <div className="flex gap-2">
                        <Input
                          id="reachUsMessage"
                          value={contentData.reachUsMessage}
                          onChange={(e) =>
                            handleContentChange(
                              "reachUsMessage",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("reachUsMessage")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Business contact details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">Email Address</Label>
                      <div className="flex gap-2">
                        <Input
                          id="contactEmail"
                          type="email"
                          value={contentData.contactEmail}
                          onChange={(e) =>
                            handleContentChange("contactEmail", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("contactEmail")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <div className="flex gap-2">
                        <Input
                          id="contactPhone"
                          value={contentData.contactPhone}
                          onChange={(e) =>
                            handleContentChange("contactPhone", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("contactPhone")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactAddress">Business Address</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="contactAddress"
                        value={contentData.contactAddress}
                        onChange={(e) =>
                          handleContentChange("contactAddress", e.target.value)
                        }
                        rows={2}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("contactAddress")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="businessHours"
                        value={contentData.businessHours}
                        onChange={(e) =>
                          handleContentChange("businessHours", e.target.value)
                        }
                        rows={3}
                        placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm("businessHours")}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Header Navigation Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Header Navigation Content</CardTitle>
                  <CardDescription>
                    Dashboard and login section labels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="headerLoginDashboard">
                      Login Dashboard Label
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="headerLoginDashboard"
                        value={contentData.headerLoginDashboard}
                        onChange={(e) =>
                          handleContentChange(
                            "headerLoginDashboard",
                            e.target.value,
                          )
                        }
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("headerLoginDashboard")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="headerDashboardBrickKilnOwners">
                        Brick Kiln Owners
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="headerDashboardBrickKilnOwners"
                          value={contentData.headerDashboardBrickKilnOwners}
                          onChange={(e) =>
                            handleContentChange(
                              "headerDashboardBrickKilnOwners",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm(
                              "headerDashboardBrickKilnOwners",
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headerDashboardCoalProviders">
                        Coal/Fuel Providers
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="headerDashboardCoalProviders"
                          value={contentData.headerDashboardCoalProviders}
                          onChange={(e) =>
                            handleContentChange(
                              "headerDashboardCoalProviders",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("headerDashboardCoalProviders")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="headerDashboardTransportProviders">
                        Transport Providers
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="headerDashboardTransportProviders"
                          value={contentData.headerDashboardTransportProviders}
                          onChange={(e) =>
                            handleContentChange(
                              "headerDashboardTransportProviders",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm(
                              "headerDashboardTransportProviders",
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="headerDashboardServiceProviders">
                        Service/Product Providers
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="headerDashboardServiceProviders"
                          value={contentData.headerDashboardServiceProviders}
                          onChange={(e) =>
                            handleContentChange(
                              "headerDashboardServiceProviders",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm(
                              "headerDashboardServiceProviders",
                            )
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="headerDashboardLabour">Labour</Label>
                    <div className="flex gap-2">
                      <Input
                        id="headerDashboardLabour"
                        value={contentData.headerDashboardLabour}
                        onChange={(e) =>
                          handleContentChange(
                            "headerDashboardLabour",
                            e.target.value,
                          )
                        }
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("headerDashboardLabour")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Menu */}
              <Card>
                <CardHeader>
                  <CardTitle>Navigation Menu Items</CardTitle>
                  <CardDescription>Header navigation labels</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="navAboutUs">About Us</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navAboutUs"
                          value={contentData.navAboutUs}
                          onChange={(e) =>
                            handleContentChange("navAboutUs", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("navAboutUs")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="navEentMarket">E-Ent Market</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navEentMarket"
                          value={contentData.navEentMarket}
                          onChange={(e) =>
                            handleContentChange("navEentMarket", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("navEentMarket")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="navServices">Services</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navServices"
                          value={contentData.navServices}
                          onChange={(e) =>
                            handleContentChange("navServices", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("navServices")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="navJoinWaitlist">Join Waitlist</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navJoinWaitlist"
                          value={contentData.navJoinWaitlist}
                          onChange={(e) =>
                            handleContentChange(
                              "navJoinWaitlist",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("navJoinWaitlist")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="navBlog">Blog</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navBlog"
                          value={contentData.navBlog}
                          onChange={(e) =>
                            handleContentChange("navBlog", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("navBlog")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="navReachUs">Reach Us</Label>
                      <div className="flex gap-2">
                        <Input
                          id="navReachUs"
                          value={contentData.navReachUs}
                          onChange={(e) =>
                            handleContentChange("navReachUs", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("navReachUs")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Footer Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Footer Content</CardTitle>
                  <CardDescription>Footer sections and text</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footerDescription">
                      Footer Description
                    </Label>
                    <div className="flex gap-2">
                      <Textarea
                        id="footerDescription"
                        value={contentData.footerDescription}
                        onChange={(e) =>
                          handleContentChange(
                            "footerDescription",
                            e.target.value,
                          )
                        }
                        rows={2}
                        className="flex-grow"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setShowDeleteConfirm("footerDescription")
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="footerQuickLinks">
                        Quick Links Title
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id="footerQuickLinks"
                          value={contentData.footerQuickLinks}
                          onChange={(e) =>
                            handleContentChange(
                              "footerQuickLinks",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("footerQuickLinks")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerContact">Contact Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="footerContact"
                          value={contentData.footerContact}
                          onChange={(e) =>
                            handleContentChange("footerContact", e.target.value)
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("footerContact")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerFollowUs">Follow Us Title</Label>
                      <div className="flex gap-2">
                        <Input
                          id="footerFollowUs"
                          value={contentData.footerFollowUs}
                          onChange={(e) =>
                            handleContentChange(
                              "footerFollowUs",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setShowDeleteConfirm("footerFollowUs")}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footerCopyright">Copyright Text</Label>
                      <div className="flex gap-2">
                        <Input
                          id="footerCopyright"
                          value={contentData.footerCopyright}
                          onChange={(e) =>
                            handleContentChange(
                              "footerCopyright",
                              e.target.value,
                            )
                          }
                          className="flex-grow"
                        />
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setShowDeleteConfirm("footerCopyright")
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Dynamic Content Fields */}
            <Card>
              <CardHeader>
                <CardTitle>Dynamic Content Fields</CardTitle>
                <CardDescription>
                  Manage custom content fields for your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {Object.entries(contentData)
                    .filter(
                      ([key]) =>
                        ![
                          "heroTitle",
                          "heroSubtitle",
                          "countdownTitle",
                          "countdownDescription",
                          "countdownLaunchMessage",
                          "countdownPlatformUnlocked",
                          "servicesTitle",
                          "servicesDescription",
                          "freeServicesTitle",
                          "freeServicesDescription",
                          "exclusiveServicesTitle",
                          "exclusiveServicesDescription",
                          "aboutTitle",
                          "aboutDescription1",
                          "aboutDescription2",
                          "blogTitle",
                          "blogSubtitle",
                          "blogAboutTitle",
                          "blogAboutDescription",
                          "waitlistTitle",
                          "waitlistDescription",
                          "reachUsTitle",
                          "reachUsSubtitle",
                          "reachUsContactInfo",
                          "reachUsEmail",
                          "reachUsPhone",
                          "reachUsAddress",
                          "reachUsHours",
                          "reachUsFollowUs",
                          "reachUsSendMessage",
                          "reachUsFirstName",
                          "reachUsLastName",
                          "reachUsSubject",
                          "reachUsMessage",
                          "contactEmail",
                          "contactPhone",
                          "contactAddress",
                          "businessHours",
                          "navAboutUs",
                          "navEentMarket",
                          "navServices",
                          "navJoinWaitlist",
                          "navBlog",
                          "navReachUs",
                          "headerLoginDashboard",
                          "headerDashboardBrickKilnOwners",
                          "headerDashboardCoalProviders",
                          "headerDashboardTransportProviders",
                          "headerDashboardServiceProviders",
                          "headerDashboardLabour",
                          "footerDescription",
                          "footerQuickLinks",
                          "footerContact",
                          "footerFollowUs",
                          "footerCopyright",
                        ].includes(key) && !key.includes("ServiceItem"),
                    )
                    .map(([key, value]) => (
                      <div key={key} className="p-4 border rounded-lg">
                        <div className="space-y-2">
                          <Label htmlFor={key} className="text-sm font-medium">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={key}
                              value={value}
                              onChange={(e) =>
                                handleContentChange(key, e.target.value)
                              }
                              className="flex-grow"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(key)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  {Object.entries(contentData).filter(
                    ([key]) =>
                      ![
                        "heroTitle",
                        "heroSubtitle",
                        "countdownTitle",
                        "countdownDescription",
                        "countdownLaunchMessage",
                        "countdownPlatformUnlocked",
                        "servicesTitle",
                        "servicesDescription",
                        "freeServicesTitle",
                        "freeServicesDescription",
                        "exclusiveServicesTitle",
                        "exclusiveServicesDescription",
                        "aboutTitle",
                        "aboutDescription1",
                        "aboutDescription2",
                        "blogTitle",
                        "blogSubtitle",
                        "blogAboutTitle",
                        "blogAboutDescription",
                        "waitlistTitle",
                        "waitlistDescription",
                        "reachUsTitle",
                        "reachUsSubtitle",
                        "reachUsContactInfo",
                        "reachUsEmail",
                        "reachUsPhone",
                        "reachUsAddress",
                        "reachUsHours",
                        "reachUsFollowUs",
                        "reachUsSendMessage",
                        "reachUsFirstName",
                        "reachUsLastName",
                        "reachUsSubject",
                        "reachUsMessage",
                        "contactEmail",
                        "contactPhone",
                        "contactAddress",
                        "businessHours",
                        "navAboutUs",
                        "navEentMarket",
                        "navServices",
                        "navJoinWaitlist",
                        "navBlog",
                        "navReachUs",
                        "headerLoginDashboard",
                        "headerDashboardBrickKilnOwners",
                        "headerDashboardCoalProviders",
                        "headerDashboardTransportProviders",
                        "headerDashboardServiceProviders",
                        "headerDashboardLabour",
                        "footerDescription",
                        "footerQuickLinks",
                        "footerContact",
                        "footerFollowUs",
                        "footerCopyright",
                      ].includes(key) && !key.includes("ServiceItem"),
                  ).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>
                        No custom fields added yet. Click "Add New Field" to
                        create your first custom content field.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={handleSaveContent}
                size="lg"
                disabled={contentSaving || contentLoading}
              >
                {contentSaving
                  ? "Publishing Changes..."
                  : "Save & Publish All Changes"}
              </Button>
            </div>
          </div>

          {/* Add Field Dialog */}
          <Dialog
            open={showAddFieldDialog}
            onOpenChange={setShowAddFieldDialog}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Content Field</DialogTitle>
                <DialogDescription>
                  Create a new content field that can be used across your
                  website.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="fieldLabel">Field Label</Label>
                  <Input
                    id="fieldLabel"
                    value={newFieldData.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setNewFieldData((prev) => ({
                        ...prev,
                        label,
                        key: generateKeyFromLabel(label),
                      }));
                    }}
                    placeholder="e.g., Hero Button Text"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldKey">Field Key</Label>
                  <Input
                    id="fieldKey"
                    value={newFieldData.key}
                    onChange={(e) =>
                      setNewFieldData((prev) => ({
                        ...prev,
                        key: e.target.value,
                      }))
                    }
                    placeholder="e.g., hero_button_text"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be used to reference the field in code. Use
                    lowercase letters, numbers, and underscores only.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldValue">Initial Value</Label>
                  {newFieldData.type === "textarea" ? (
                    <Textarea
                      id="fieldValue"
                      value={newFieldData.value}
                      onChange={(e) =>
                        setNewFieldData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      placeholder="Enter the initial content..."
                      rows={3}
                    />
                  ) : (
                    <Input
                      id="fieldValue"
                      value={newFieldData.value}
                      onChange={(e) =>
                        setNewFieldData((prev) => ({
                          ...prev,
                          value: e.target.value,
                        }))
                      }
                      placeholder="Enter the initial content..."
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldType">Field Type</Label>
                  <Select
                    value={newFieldData.type}
                    onValueChange={(value: "text" | "textarea") =>
                      setNewFieldData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text (Single Line)</SelectItem>
                      <SelectItem value="textarea">
                        Textarea (Multiple Lines)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fieldCategory">Category</Label>
                  <Select
                    value={newFieldData.category}
                    onValueChange={(value) =>
                      setNewFieldData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="landing">Landing Page</SelectItem>
                      <SelectItem value="about">About Us</SelectItem>
                      <SelectItem value="services">Services</SelectItem>
                      <SelectItem value="blog">Blog</SelectItem>
                      <SelectItem value="waitlist">Waitlist</SelectItem>
                      <SelectItem value="reach-us">Reach Us</SelectItem>
                      <SelectItem value="navigation">Navigation</SelectItem>
                      <SelectItem value="footer">Footer</SelectItem>
                      <SelectItem value="contact">Contact</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowAddFieldDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddField}>Add Field</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <AlertDialog
            open={!!showDeleteConfirm}
            onOpenChange={() => setShowDeleteConfirm(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Content Field</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete the field &quot;
                  {showDeleteConfirm}&quot;? This action cannot be undone and
                  may affect your website if this field is being used.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    showDeleteConfirm && handleDeleteField(showDeleteConfirm)
                  }
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Management</CardTitle>
                <CardDescription>
                  Manage your blog content through Blogger API
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">Blog Posts</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage via Blogger platform
                      </p>
                    </div>
                    <Button asChild variant="outline">
                      <a
                        href="https://blogger.com"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Blogger
                      </a>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">API Configuration</h4>
                      <p className="text-sm text-muted-foreground">
                        Configure in Settings tab
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const settingsTab = document.querySelector(
                          '[value="settings"]',
                        ) as HTMLElement;
                        settingsTab?.click();
                      }}
                    >
                      Go to Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Website Sections</CardTitle>
                <CardDescription>
                  Quick access to main website content areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button asChild variant="outline" size="sm">
                      <a href="/" target="_blank">
                        Landing Page
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="/blog" target="_blank">
                        Blog Page
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="/services" target="_blank">
                        Services
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm">
                      <a href="/about" target="_blank">
                        About Us
                      </a>
                    </Button>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> Static content requires code
                      updates. Contact your developer for changes to landing
                      page text, service descriptions, etc.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Guidelines</CardTitle>
                <CardDescription>
                  Best practices for managing your content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">Blog Content</h4>
                      <p className="text-xs text-muted-foreground">
                        Use Blogger platform for articles, news, and updates
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">Images</h4>
                      <p className="text-xs text-muted-foreground">
                        Upload to Blogger or use external image hosting
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-sm">SEO</h4>
                      <p className="text-xs text-muted-foreground">
                        Use relevant keywords and meta descriptions
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common content management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button className="w-full" variant="outline">
                    Refresh Blog Cache
                  </Button>
                  <Button className="w-full" variant="outline">
                    Preview Website
                  </Button>
                  <Button className="w-full" variant="outline">
                    Export Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Blogger API Configuration</CardTitle>
              <CardDescription>
                Configure your Blogger API settings to connect to your blog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="blogId">Blog ID</Label>
                <Input
                  id="blogId"
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  placeholder="Enter your Blogger Blog ID"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Blogger API Key"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveConfig} disabled={loading}>
                {loading ? "Saving..." : "Save Configuration"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
