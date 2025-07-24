import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  FileText,
  ShoppingCart,
  Eye,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Trash2,
  Star,
} from "lucide-react";
import CoalQuotationResponseForm from "./CoalQuotationResponseForm";

interface CoalProviderInquiryManagementProps {
  coalProviderId: string;
}

interface Inquiry {
  id: string;
  manufacturer_id: string;
  inquiry_type: string;
  coal_type: string;
  message: string;
  quantity: number | null;
  unit: string | null;
  delivery_location: string | null;
  expected_delivery_date: string | null;
  budget_range_min: number | null;
  budget_range_max: number | null;
  status: string;
  created_at: string;
  provider_response?: string | null;
  provider_response_date?: string | null;
  responded_by?: string | null;
  manufacturers?: {
    name: string;
    company_name: string;
    phone: string;
    email: string;
  };
}

interface Quotation {
  id: string;
  manufacturer_id: string;
  inquiry_id: string;
  coal_type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  delivery_location: string | null;
  status: string;
  created_at: string;
  manufacturers?: {
    name: string;
    company_name: string;
    phone: string;
    email: string;
  };
}

interface Order {
  id: string;
  manufacturer_id: string;
  order_number: string;
  coal_type: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_amount: number;
  delivery_location: string;
  order_status: string;
  payment_status: string;
  created_at: string;
  manufacturers?: {
    name: string;
    company_name: string;
    phone: string;
    email: string;
  };
}

interface Rating {
  id: string;
  manufacturer_id: string;
  coal_provider_id: string;
  order_id: string;
  rating: number;
  review_text: string | null;
  review_title: string | null;
  quality_rating: number | null;
  delivery_rating: number | null;
  service_rating: number | null;
  would_recommend: boolean | null;
  is_verified: boolean | null;
  created_at: string;
  manufacturers?: {
    name: string;
    company_name: string;
    phone: string;
    email: string;
  };
}

const CoalProviderInquiryManagement: React.FC<
  CoalProviderInquiryManagementProps
> = ({ coalProviderId }) => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<
    "inquiry" | "quotation" | "order" | null
  >(null);
  const [textResponse, setTextResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [responseHistory, setResponseHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAllData();
  }, [coalProviderId]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log("=== COAL PROVIDER DASHBOARD FETCH ===");
      console.log("Fetching data for coal provider:", coalProviderId);
      console.log("Coal provider ID type:", typeof coalProviderId);
      console.log("Coal provider ID length:", coalProviderId?.length);

      // Fetch inquiries
      console.log("\n--- FETCHING INQUIRIES ---");
      const { data: inquiriesData, error: inquiriesError } = await supabase
        .from("manufacturer_coal_inquiries")
        .select(
          `
          *,
          manufacturers!inner(name, company_name, phone, email)
        `,
        )
        .eq("coal_provider_id", coalProviderId)
        .order("created_at", { ascending: false });

      if (inquiriesError) {
        console.error("Error fetching inquiries:", inquiriesError);
      } else {
        console.log("Fetched inquiries count:", inquiriesData?.length || 0);
        console.log("Inquiries data sample:", inquiriesData?.slice(0, 2));
        if (inquiriesData && inquiriesData.length > 0) {
          console.log(
            "First inquiry coal_provider_id:",
            inquiriesData[0].coal_provider_id,
          );
        }
      }

      // Fetch quotation requests (not quotations sent by us, but requests from manufacturers)
      console.log("\n--- FETCHING QUOTATION REQUESTS ---");
      const { data: quotationsData, error: quotationsError } = await supabase
        .from("manufacturer_coal_quotations")
        .select(
          `
          *,
          manufacturers!inner(name, company_name, phone, email)
        `,
        )
        .eq("coal_provider_id", coalProviderId)
        .order("updated_at", { ascending: false });

      if (quotationsError) {
        console.error("Error fetching quotations:", quotationsError);
        console.error(
          "Quotations error details:",
          quotationsError.message,
          quotationsError.details,
        );
      } else {
        console.log("Fetched quotations count:", quotationsData?.length || 0);
        console.log("Quotations data sample:", quotationsData?.slice(0, 2));
        if (quotationsData && quotationsData.length > 0) {
          console.log(
            "First quotation coal_provider_id:",
            quotationsData[0].coal_provider_id,
          );
        }
      }

      // Let's also try fetching ALL quotations to see what's in the database
      console.log("\n--- FETCHING ALL QUOTATIONS (DEBUG) ---");
      const { data: allQuotationsData, error: allQuotationsError } =
        await supabase
          .from("manufacturer_coal_quotations")
          .select(
            "id, coal_provider_id, manufacturer_id, coal_type, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(10);

      if (allQuotationsError) {
        console.error("Error fetching all quotations:", allQuotationsError);
      } else {
        console.log("All quotations in database (last 10):", allQuotationsData);
        console.log("Looking for coal_provider_id:", coalProviderId);
        const matchingQuotations = allQuotationsData?.filter(
          (q) => q.coal_provider_id === coalProviderId,
        );
        console.log(
          "Matching quotations found:",
          matchingQuotations?.length || 0,
        );
        console.log("Matching quotations:", matchingQuotations);
      }

      // Fetch orders
      console.log("\n--- FETCHING ORDERS ---");
      const { data: ordersData, error: ordersError } = await supabase
        .from("manufacturer_coal_orders")
        .select(
          `
          *,
          manufacturers!inner(name, company_name, phone, email)
        `,
        )
        .eq("coal_provider_id", coalProviderId)
        .order("created_at", { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        console.error(
          "Orders error details:",
          ordersError.message,
          ordersError.details,
        );
      } else {
        console.log("Fetched orders count:", ordersData?.length || 0);
        console.log("Orders data sample:", ordersData?.slice(0, 2));
        if (ordersData && ordersData.length > 0) {
          console.log(
            "First order coal_provider_id:",
            ordersData[0].coal_provider_id,
          );
        }
      }

      // Fetch ratings
      console.log("\n--- FETCHING RATINGS ---");
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("manufacturer_coal_ratings")
        .select(
          `
          *,
          manufacturers!inner(name, company_name, phone, email)
        `,
        )
        .eq("coal_provider_id", coalProviderId)
        .order("created_at", { ascending: false });

      if (ratingsError) {
        console.error("Error fetching ratings:", ratingsError);
        console.error(
          "Ratings error details:",
          ratingsError.message,
          ratingsError.details,
        );
      } else {
        console.log("Fetched ratings count:", ratingsData?.length || 0);
        console.log("Ratings data sample:", ratingsData?.slice(0, 2));
        if (ratingsData && ratingsData.length > 0) {
          console.log(
            "First rating coal_provider_id:",
            ratingsData[0].coal_provider_id,
          );
        }
      }

      console.log("=== END COAL PROVIDER DASHBOARD FETCH ===");

      setInquiries(inquiriesData || []);
      setQuotations(quotationsData || []);
      setOrders(ordersData || []);
      setRatings(ratingsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      console.log("Deleting all data for coal provider:", coalProviderId);

      // Import the delete function dynamically to avoid circular imports
      const { deleteAllCoalProviderData } = await import(
        "@/services/manufacturerCoalService"
      );

      const success = await deleteAllCoalProviderData(coalProviderId);

      if (success) {
        toast({
          title: "Success",
          description:
            "All inquiries, quotations, and orders have been deleted successfully",
        });
        // Refresh the data to show empty state
        fetchAllData();
      } else {
        throw new Error("Failed to delete all data");
      }
    } catch (error) {
      console.error("Error deleting all data:", error);
      toast({
        title: "Error",
        description: "Failed to delete all data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Individual selection handlers
  const handleSelectInquiry = (inquiryId: string, checked: boolean) => {
    if (checked) {
      setSelectedInquiries([...selectedInquiries, inquiryId]);
    } else {
      setSelectedInquiries(selectedInquiries.filter((id) => id !== inquiryId));
    }
  };

  const handleSelectQuotation = (quotationId: string, checked: boolean) => {
    if (checked) {
      setSelectedQuotations([...selectedQuotations, quotationId]);
    } else {
      setSelectedQuotations(
        selectedQuotations.filter((id) => id !== quotationId),
      );
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders([...selectedOrders, orderId]);
    } else {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    }
  };

  // Select all handlers
  const handleSelectAllInquiries = (checked: boolean) => {
    if (checked) {
      setSelectedInquiries(inquiries.map((inquiry) => inquiry.id));
    } else {
      setSelectedInquiries([]);
    }
  };

  const handleSelectAllQuotations = (checked: boolean) => {
    if (checked) {
      setSelectedQuotations(quotations.map((quotation) => quotation.id));
    } else {
      setSelectedQuotations([]);
    }
  };

  const handleSelectAllOrders = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  // Delete selected handlers
  const handleDeleteSelectedInquiries = async () => {
    if (selectedInquiries.length === 0) return;

    setIsDeleting(true);
    try {
      const { deleteMultipleManufacturerCoalInquiries } = await import(
        "@/services/manufacturerCoalService"
      );
      const success =
        await deleteMultipleManufacturerCoalInquiries(selectedInquiries);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedInquiries.length} inquiries deleted successfully`,
        });
        setSelectedInquiries([]);
        await fetchAllData();
      } else {
        throw new Error("Failed to delete inquiries");
      }
    } catch (error) {
      console.error("Error deleting inquiries:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected inquiries",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelectedQuotations = async () => {
    if (selectedQuotations.length === 0) return;

    setIsDeleting(true);
    try {
      const { deleteMultipleManufacturerCoalQuotations } = await import(
        "@/services/manufacturerCoalService"
      );
      const success =
        await deleteMultipleManufacturerCoalQuotations(selectedQuotations);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedQuotations.length} quotations deleted successfully`,
        });
        setSelectedQuotations([]);
        await fetchAllData();
      } else {
        throw new Error("Failed to delete quotations");
      }
    } catch (error) {
      console.error("Error deleting quotations:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected quotations",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSelectedOrders = async () => {
    if (selectedOrders.length === 0) return;

    setIsDeleting(true);
    try {
      const { deleteMultipleManufacturerCoalOrders } = await import(
        "@/services/manufacturerCoalService"
      );
      const success =
        await deleteMultipleManufacturerCoalOrders(selectedOrders);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedOrders.length} orders deleted successfully`,
        });
        setSelectedOrders([]);
        await fetchAllData();
      } else {
        throw new Error("Failed to delete orders");
      }
    } catch (error) {
      console.error("Error deleting orders:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected orders",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Delete single item handlers
  const handleDeleteSingleInquiry = async (inquiryId: string) => {
    setIsDeleting(true);
    try {
      const { deleteManufacturerCoalInquiry } = await import(
        "@/services/manufacturerCoalService"
      );
      const success = await deleteManufacturerCoalInquiry(inquiryId);
      if (success) {
        toast({
          title: "Success",
          description: "Inquiry deleted successfully",
        });
        await fetchAllData();
      } else {
        throw new Error("Failed to delete inquiry");
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to delete inquiry",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleQuotation = async (quotationId: string) => {
    setIsDeleting(true);
    try {
      const { deleteManufacturerCoalQuotation } = await import(
        "@/services/manufacturerCoalService"
      );
      const success = await deleteManufacturerCoalQuotation(quotationId);
      if (success) {
        toast({
          title: "Success",
          description: "Quotation deleted successfully",
        });
        await fetchAllData();
      } else {
        throw new Error("Failed to delete quotation");
      }
    } catch (error) {
      console.error("Error deleting quotation:", error);
      toast({
        title: "Error",
        description: "Failed to delete quotation",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleOrder = async (orderId: string) => {
    setIsDeleting(true);
    try {
      const { deleteManufacturerCoalOrder } = await import(
        "@/services/manufacturerCoalService"
      );
      const success = await deleteManufacturerCoalOrder(orderId);
      if (success) {
        toast({
          title: "Success",
          description: "Order deleted successfully",
        });
        await fetchAllData();
      } else {
        throw new Error("Failed to delete order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewItem = (
    item: any,
    type: "inquiry" | "quotation" | "order",
  ) => {
    setSelectedItem(item);
    setDialogType(type);
    if (type === "inquiry") {
      setTextResponse("");
      setIsEditing(false);
      setShowHistory(false);
      setResponseHistory([]);
    }
  };

  const handleEditResponse = async (inquiry: any) => {
    setSelectedItem(inquiry);
    setDialogType("inquiry");
    setIsEditing(true);
    setTextResponse(inquiry.provider_response || "");

    // Fetch response history
    try {
      const { getInquiryResponseHistory } = await import(
        "@/services/manufacturerCoalService"
      );
      const history = await getInquiryResponseHistory(inquiry.id);
      setResponseHistory(history);
    } catch (error) {
      console.error("Error fetching response history:", error);
    }
  };

  const handleTextResponse = async () => {
    if (!selectedItem || !textResponse.trim()) return;

    setSubmitting(true);
    try {
      console.log(
        isEditing ? "Editing" : "Sending",
        "text response to inquiry:",
        selectedItem.id,
      );
      console.log("Response text:", textResponse);

      if (isEditing) {
        // Import the edit response function
        const { editInquiryResponse } = await import(
          "@/services/manufacturerCoalService"
        );

        const result = await editInquiryResponse(
          selectedItem.id,
          textResponse,
          "Coal Provider",
        );

        if (!result) {
          throw new Error("Failed to edit response");
        }

        console.log("=== RESPONSE EDITED SUCCESSFULLY ===");
        console.log("Inquiry ID:", selectedItem.id);
        console.log("Updated response:", textResponse);
        console.log("Timestamp:", new Date().toISOString());

        toast({
          title: "Success",
          description:
            "Response edited successfully. The updated response has been sent to the manufacturer.",
        });

        // Force a small delay to ensure database is updated before manufacturer dashboard refreshes
        setTimeout(() => {
          console.log("Response edit processing completed");
        }, 500);
      } else {
        // Import the add response function
        const { addInquiryTextResponse } = await import(
          "@/services/manufacturerCoalService"
        );

        const result = await addInquiryTextResponse(
          selectedItem.id,
          textResponse,
          "Coal Provider",
        );

        if (!result) {
          throw new Error("Failed to send response");
        }

        console.log("=== NEW RESPONSE SENT SUCCESSFULLY ===");
        console.log("Inquiry ID:", selectedItem.id);
        console.log("New response:", textResponse);
        console.log("Timestamp:", new Date().toISOString());

        toast({
          title: "Success",
          description: "Text response sent successfully",
        });

        // Force a small delay to ensure database is updated before manufacturer dashboard refreshes
        setTimeout(() => {
          console.log("New response processing completed");
        }, 500);
      }

      setSelectedItem(null);
      setDialogType(null);
      setTextResponse("");
      setIsEditing(false);
      setShowHistory(false);
      setResponseHistory([]);
      fetchAllData();
    } catch (error) {
      console.error("Error with text response:", error);
      toast({
        title: "Error",
        description: isEditing
          ? "Failed to edit response"
          : "Failed to send text response",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      console.log("Updating order status individually:", orderId, "to", status);

      const updateData = {
        order_status: status,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("manufacturer_coal_orders")
        .update(updateData)
        .eq("id", orderId);

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }

      console.log(
        "Successfully updated order status individually - no other records affected",
      );

      toast({
        title: "Success",
        description: `Order status updated individually to ${status} - no chained updates`,
      });

      fetchAllData();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status.toLowerCase();
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "outline";
    let icon = <AlertCircle className="h-3 w-3" />;

    switch (statusLower) {
      case "completed":
      case "delivered":
      case "accepted":
      case "responded":
        variant = "default";
        icon = <CheckCircle className="h-3 w-3" />;
        break;
      case "pending":
      case "processing":
        variant = "secondary";
        icon = <Clock className="h-3 w-3" />;
        break;
      case "rejected":
      case "cancelled":
        variant = "destructive";
        icon = <XCircle className="h-3 w-3" />;
        break;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-orange-800">
            Inquiry Management
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Respond to manufacturer inquiries with text responses only
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
                disabled={
                  deleting ||
                  (inquiries.length === 0 &&
                    quotations.length === 0 &&
                    orders.length === 0)
                }
              >
                <Trash2 className="h-4 w-4" />
                {deleting ? "Deleting..." : "Delete All"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently delete all inquiries, quotations,
                  and orders from your dashboard. This cannot be undone.
                  <br />
                  <br />
                  <strong>Items to be deleted:</strong>
                  <ul className="list-disc list-inside mt-2">
                    <li>{inquiries.length} inquiries</li>
                    <li>{quotations.length} quotations</li>
                    <li>{orders.length} orders</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAllData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            onClick={fetchAllData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="inquiries" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inquiries" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Inquiries ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="quotations" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Quotations ({quotations.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Orders ({orders.length})
          </TabsTrigger>
          <TabsTrigger value="ratings" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Ratings ({ratings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Inquiries</CardTitle>
              <CardDescription>
                View and respond to inquiries from manufacturers - responses
                handled individually
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No inquiries received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={
                          selectedInquiries.length === inquiries.length &&
                          inquiries.length > 0
                        }
                        onCheckedChange={handleSelectAllInquiries}
                        disabled={isDeleting}
                      />
                      <span className="text-sm font-medium">
                        Select All ({selectedInquiries.length} selected)
                      </span>
                    </div>
                    {selectedInquiries.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedInquiries}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting
                          ? "Deleting..."
                          : `Delete Selected (${selectedInquiries.length})`}
                      </Button>
                    )}
                  </div>
                  {inquiries.map((inquiry) => (
                    <Card key={inquiry.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedInquiries.includes(inquiry.id)}
                              onCheckedChange={(checked) =>
                                handleSelectInquiry(
                                  inquiry.id,
                                  checked as boolean,
                                )
                              }
                              disabled={isDeleting}
                              className="mt-1"
                            />
                            <div>
                              <CardTitle className="text-lg">
                                {inquiry.manufacturers?.company_name ||
                                  "Unknown Company"}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                Contact: {inquiry.manufacturers?.name} |{" "}
                                {inquiry.manufacturers?.phone}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(inquiry.status)}
                            <span className="text-xs text-gray-500">
                              {formatDate(inquiry.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteSingleInquiry(inquiry.id)
                              }
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p>
                            <strong>Coal Type:</strong> {inquiry.coal_type}
                          </p>
                          <p>
                            <strong>Message:</strong> {inquiry.message}
                          </p>
                          {inquiry.quantity && (
                            <p>
                              <strong>Quantity:</strong> {inquiry.quantity}{" "}
                              {inquiry.unit}
                            </p>
                          )}
                          {inquiry.delivery_location && (
                            <p>
                              <strong>Delivery Location:</strong>{" "}
                              {inquiry.delivery_location}
                            </p>
                          )}
                          {(inquiry.budget_range_min ||
                            inquiry.budget_range_max) && (
                            <p>
                              <strong>Budget Range:</strong> ₹
                              {inquiry.budget_range_min || 0} - ₹
                              {inquiry.budget_range_max || 0}
                            </p>
                          )}
                        </div>
                        {inquiry.provider_response && (
                          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">
                                Your Response:
                              </span>
                              {inquiry.provider_response_date && (
                                <span className="text-xs text-green-600">
                                  {formatDate(inquiry.provider_response_date)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-green-700">
                              {inquiry.provider_response}
                            </p>
                            {inquiry.responded_by && (
                              <p className="text-xs text-green-600 mt-1">
                                Responded by: {inquiry.responded_by}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewItem(inquiry, "inquiry")}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {inquiry.status === "pending" && (
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleViewItem(inquiry, "inquiry")}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Respond
                            </Button>
                          )}
                          {inquiry.provider_response && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleEditResponse(inquiry)}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Edit Response
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotations">
          <Card>
            <CardHeader>
              <CardTitle>Quotation Requests</CardTitle>
              <CardDescription>
                Respond to quotation requests from manufacturers - standalone
                quotation communication
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No quotation requests received yet</p>
                  <p className="text-sm mt-2">
                    Manufacturers can send you quotation requests for coal/fuel
                    supplies
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={
                          selectedQuotations.length === quotations.length &&
                          quotations.length > 0
                        }
                        onCheckedChange={handleSelectAllQuotations}
                        disabled={isDeleting}
                      />
                      <span className="text-sm font-medium">
                        Select All ({selectedQuotations.length} selected)
                      </span>
                    </div>
                    {selectedQuotations.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedQuotations}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting
                          ? "Deleting..."
                          : `Delete Selected (${selectedQuotations.length})`}
                      </Button>
                    )}
                  </div>
                  {quotations.map((quotation) => (
                    <Card key={quotation.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedQuotations.includes(
                                quotation.id,
                              )}
                              onCheckedChange={(checked) =>
                                handleSelectQuotation(
                                  quotation.id,
                                  checked as boolean,
                                )
                              }
                              disabled={isDeleting}
                              className="mt-1"
                            />
                            <div>
                              <CardTitle className="text-lg">
                                {quotation.manufacturers?.company_name ||
                                  "Unknown Company"}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {quotation.coal_type} - {quotation.quantity}{" "}
                                {quotation.unit}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(quotation.status)}
                            <span className="text-xs text-gray-500">
                              {formatDate(quotation.created_at)}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleDeleteSingleQuotation(quotation.id)
                              }
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <p>
                              <strong>Contact:</strong>{" "}
                              {quotation.manufacturers?.name}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {quotation.manufacturers?.phone}
                            </p>
                            {quotation.delivery_location && (
                              <p>
                                <strong>Delivery Location:</strong>{" "}
                                {quotation.delivery_location}
                              </p>
                            )}
                            {quotation.expected_delivery_date && (
                              <p>
                                <strong>Expected Delivery:</strong>{" "}
                                {formatDate(quotation.expected_delivery_date)}
                              </p>
                            )}
                          </div>

                          {quotation.message && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Request Message:
                              </p>
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                {quotation.message}
                              </p>
                            </div>
                          )}

                          {quotation.status === "quoted" &&
                            quotation.price_per_unit && (
                              <div className="border-t pt-3">
                                <div className="flex items-center gap-2 mb-2">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-medium text-green-800">
                                    Your Quotation:
                                  </span>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <p>
                                      <strong>Price per Unit:</strong> ₹
                                      {quotation.price_per_unit}
                                    </p>
                                    <p>
                                      <strong>Total Amount:</strong> ₹
                                      {quotation.total_amount}
                                    </p>
                                    {quotation.delivery_timeline && (
                                      <p>
                                        <strong>Delivery Timeline:</strong>{" "}
                                        {quotation.delivery_timeline}
                                      </p>
                                    )}
                                    {quotation.payment_terms && (
                                      <p>
                                        <strong>Payment Terms:</strong>{" "}
                                        {quotation.payment_terms}
                                      </p>
                                    )}
                                  </div>
                                  {quotation.additional_notes && (
                                    <p className="text-sm mt-2">
                                      <strong>Notes:</strong>{" "}
                                      {quotation.additional_notes}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleViewItem(quotation, "quotation")
                            }
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {quotation.status === "pending" && (
                            <CoalQuotationResponseForm
                              quotation={quotation}
                              onResponseSubmitted={fetchAllData}
                            />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Received Orders</CardTitle>
              <CardDescription>
                Manage orders from manufacturers - each order handled separately
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No orders received yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={
                          selectedOrders.length === orders.length &&
                          orders.length > 0
                        }
                        onCheckedChange={handleSelectAllOrders}
                        disabled={isDeleting}
                      />
                      <span className="text-sm font-medium">
                        Select All ({selectedOrders.length} selected)
                      </span>
                    </div>
                    {selectedOrders.length > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteSelectedOrders}
                        disabled={isDeleting}
                        className="flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {isDeleting
                          ? "Deleting..."
                          : `Delete Selected (${selectedOrders.length})`}
                      </Button>
                    )}
                  </div>
                  {orders.map((order) => (
                    <Card key={order.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedOrders.includes(order.id)}
                              onCheckedChange={(checked) =>
                                handleSelectOrder(order.id, checked as boolean)
                              }
                              disabled={isDeleting}
                              className="mt-1"
                            />
                            <div>
                              <CardTitle className="text-lg">
                                Order #{order.order_number}
                              </CardTitle>
                              <CardDescription className="mt-1">
                                {order.manufacturers?.company_name} -{" "}
                                {order.coal_type}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="flex flex-col gap-2">
                              {getStatusBadge(order.order_status)}
                              <Badge variant="outline" className="text-xs">
                                Payment: {order.payment_status}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSingleOrder(order.id)}
                              disabled={isDeleting}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <p>
                            <strong>Quantity:</strong> {order.quantity}{" "}
                            {order.unit}
                          </p>
                          <p>
                            <strong>Total Amount:</strong> ₹{order.total_amount}
                          </p>
                          <p>
                            <strong>Delivery Location:</strong>{" "}
                            {order.delivery_location}
                          </p>
                          <p>
                            <strong>Order Date:</strong>{" "}
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewItem(order, "order")}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {order.order_status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "confirmed")
                                }
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleUpdateOrderStatus(order.id, "rejected")
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {order.order_status === "confirmed" && (
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700"
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "shipped")
                              }
                            >
                              Mark as Shipped
                            </Button>
                          )}
                          {order.order_status === "shipped" && (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleUpdateOrderStatus(order.id, "delivered")
                              }
                            >
                              Mark as Delivered
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Ratings</CardTitle>
              <CardDescription>
                View ratings and reviews from manufacturers who have worked with
                you
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No ratings received yet</p>
                  <p className="text-sm mt-2">
                    Ratings will appear here after manufacturers complete orders
                    and provide feedback
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <Card key={rating.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {rating.manufacturers?.company_name ||
                                "Unknown Company"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Contact: {rating.manufacturers?.name} |{" "}
                              {rating.manufacturers?.phone}
                            </CardDescription>
                            {rating.review_title && (
                              <p className="text-sm font-medium mt-2">
                                {rating.review_title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < rating.rating
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 text-sm font-medium">
                                {rating.rating}/5
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(rating.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rating.review_text && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Review:
                              </p>
                              <p className="text-sm text-gray-600">
                                {rating.review_text}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-3 gap-4">
                            {rating.quality_rating && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Quality
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < rating.quality_rating!
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs font-medium mt-1">
                                  {rating.quality_rating}/5
                                </p>
                              </div>
                            )}
                            {rating.delivery_rating && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Delivery
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < rating.delivery_rating!
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs font-medium mt-1">
                                  {rating.delivery_rating}/5
                                </p>
                              </div>
                            )}
                            {rating.service_rating && (
                              <div className="text-center">
                                <p className="text-xs text-gray-500 mb-1">
                                  Service
                                </p>
                                <div className="flex items-center justify-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3 w-3 ${
                                        i < rating.service_rating!
                                          ? "text-yellow-400 fill-current"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-xs font-medium mt-1">
                                  {rating.service_rating}/5
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-4">
                              {rating.would_recommend !== null && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    Would Recommend:
                                  </span>
                                  <Badge
                                    variant={
                                      rating.would_recommend
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {rating.would_recommend ? "Yes" : "No"}
                                  </Badge>
                                </div>
                              )}
                              {rating.is_verified && (
                                <Badge variant="outline" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified Review
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400">
                              Order ID: {rating.order_id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog
        open={!!selectedItem && dialogType === "inquiry"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setDialogType(null);
            setTextResponse("");
            setIsEditing(false);
            setShowHistory(false);
            setResponseHistory([]);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Response to Inquiry" : "Respond to Inquiry"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Inquiry Details:</h4>
                <p>
                  <strong>Company:</strong>{" "}
                  {selectedItem.manufacturers?.company_name}
                </p>
                <p>
                  <strong>Coal Type:</strong> {selectedItem.coal_type}
                </p>
                <p>
                  <strong>Message:</strong> {selectedItem.message}
                </p>
                {selectedItem.quantity && (
                  <p>
                    <strong>Quantity:</strong> {selectedItem.quantity}{" "}
                    {selectedItem.unit}
                  </p>
                )}
              </div>

              {/* Show existing response if available and not editing */}
              {selectedItem.provider_response && !isEditing && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Your Current Response:
                    </span>
                    {selectedItem.provider_response_date && (
                      <span className="text-xs text-green-600">
                        {formatDate(selectedItem.provider_response_date)}
                      </span>
                    )}
                  </div>
                  <p className="text-green-700">
                    {selectedItem.provider_response}
                  </p>
                  {selectedItem.responded_by && (
                    <p className="text-xs text-green-600 mt-1">
                      Responded by: {selectedItem.responded_by}
                    </p>
                  )}
                </div>
              )}

              {/* Show response history if editing */}
              {isEditing && responseHistory.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700">
                      Response History
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {showHistory ? "Hide" : "Show"} History (
                      {responseHistory.length})
                    </Button>
                  </div>
                  {showHistory && (
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {responseHistory.map((response, index) => (
                        <div
                          key={response.id}
                          className={`p-3 rounded-lg border ${
                            response.is_current_response
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-gray-600">
                              Response #{response.response_number}
                            </span>
                            {response.is_current_response && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                            <span className="text-xs text-gray-500">
                              {formatDate(response.created_at)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {response.response_text}
                          </p>
                          {response.response_type ===
                            "text_response_edited" && (
                            <p className="text-xs text-blue-600 mt-1">
                              (Edited Response)
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Text Response Form */}
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="text_response">
                    {isEditing ? "Edit Your Response" : "Your Response"}
                  </Label>
                  <Textarea
                    id="text_response"
                    value={textResponse}
                    onChange={(e) => setTextResponse(e.target.value)}
                    placeholder={
                      isEditing
                        ? "Edit your response to the manufacturer's inquiry..."
                        : "Type your response to the manufacturer's inquiry..."
                    }
                    rows={6}
                    className="resize-none"
                  />
                </div>
                <div className="text-sm text-gray-500">
                  {isEditing
                    ? "This will update your response to the inquiry. The manufacturer will see the updated response and it will be stored as a new response in the history."
                    : "This will be saved as a text response to the inquiry. The manufacturer will be able to see your response."}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItem(null);
                setDialogType(null);
                setTextResponse("");
                setIsEditing(false);
                setShowHistory(false);
                setResponseHistory([]);
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleTextResponse}
              disabled={submitting || !textResponse.trim()}
              className={
                isEditing
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {submitting
                ? isEditing
                  ? "Updating..."
                  : "Sending..."
                : isEditing
                  ? "Update Response"
                  : "Send Text Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={!!selectedItem && dialogType !== "inquiry"}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null);
            setDialogType(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "quotation"
                ? "Quotation Details"
                : "Order Details"}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <p>
                  <strong>Company:</strong>{" "}
                  {selectedItem.manufacturers?.company_name}
                </p>
                <p>
                  <strong>Contact:</strong> {selectedItem.manufacturers?.name}
                </p>
                <p>
                  <strong>Phone:</strong> {selectedItem.manufacturers?.phone}
                </p>
                <p>
                  <strong>Email:</strong> {selectedItem.manufacturers?.email}
                </p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Item Details:</h4>
                <div className="grid grid-cols-2 gap-4">
                  <p>
                    <strong>Coal Type:</strong> {selectedItem.coal_type}
                  </p>
                  <p>
                    <strong>Quantity:</strong> {selectedItem.quantity}{" "}
                    {selectedItem.unit}
                  </p>
                  <p>
                    <strong>Price per Unit:</strong> ₹
                    {selectedItem.price_per_unit}
                  </p>
                  <p>
                    <strong>Total Amount:</strong> ₹{selectedItem.total_amount}
                  </p>
                  {selectedItem.delivery_location && (
                    <p>
                      <strong>Delivery Location:</strong>{" "}
                      {selectedItem.delivery_location}
                    </p>
                  )}
                  <p>
                    <strong>Status:</strong>{" "}
                    {selectedItem.status || selectedItem.order_status}
                  </p>
                </div>
              </div>

              {dialogType === "order" && selectedItem.order_number && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Order Information:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <p>
                      <strong>Order Number:</strong> {selectedItem.order_number}
                    </p>
                    <p>
                      <strong>Payment Status:</strong>{" "}
                      {selectedItem.payment_status}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {formatDate(selectedItem.created_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItem(null);
                setDialogType(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoalProviderInquiryManagement;
