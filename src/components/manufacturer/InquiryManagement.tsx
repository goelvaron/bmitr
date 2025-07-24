import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Bell,
  RefreshCw,
  FileText,
  ShoppingCart,
  Star,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface InquiryManagementProps {
  manufacturerId: string;
}

interface Inquiry {
  id: string;
  customer_id: string;
  customer_name?: string;
  customer_phone?: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string | null;
  reply?: string;
  reply_by?: string | null;
  reply_at?: string | null;
}

interface CoalInquiry {
  id: string;
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
  provider_response: string | null;
  provider_response_date: string | null;
  responded_by: string | null;
  coal_providers?: {
    company_name: string;
    name: string;
    phone: string;
    email: string;
  };
  fuel_types: string[] | null;
}

interface ProviderMessage {
  id: string;
  type:
    | "quotation"
    | "inquiry_response"
    | "order_update"
    | "coal_quotation"
    | "transport_quotation";
  provider_name: string;
  provider_type: "coal" | "transport";
  subject: string;
  message: string;
  status: string;
  created_at: string;
  data?: any;
  is_read: boolean;
}

const InquiryManagement: React.FC<InquiryManagementProps> = ({
  manufacturerId,
}) => {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [coalInquiries, setCoalInquiries] = useState<CoalInquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [selectedCoalInquiry, setSelectedCoalInquiry] =
    useState<CoalInquiry | null>(null);
  const [responseText, setResponseText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [replyingInquiry, setReplyingInquiry] = useState<Inquiry | null>(null);
  const [replyText, setReplyText] = useState("");
  const [providerMessages, setProviderMessages] = useState<ProviderMessage[]>(
    [],
  );
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ProviderMessage | null>(null);

  useEffect(() => {
    fetchInquiries();
    fetchCoalInquiries();
    fetchProviderMessages();

    // Set up real-time subscription for coal inquiries with more specific channel name
    const coalInquiriesSubscription = supabase
      .channel(`manufacturer_coal_inquiries_${manufacturerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "manufacturer_coal_inquiries",
          filter: `manufacturer_id=eq.${manufacturerId}`,
        },
        (payload) => {
          console.log("=== REAL-TIME COAL INQUIRY UPDATE ===");
          console.log("Payload:", payload);
          console.log("Event type:", payload.eventType);
          console.log("New data:", payload.new);
          console.log("Old data:", payload.old);
          console.log("Timestamp:", new Date().toISOString());

          // Force refresh coal inquiries when there's any change
          console.log("Refreshing coal inquiries due to real-time update");
          fetchCoalInquiries();
          fetchProviderMessages();
        },
      )
      .subscribe((status) => {
        console.log("Coal inquiries subscription status:", status);
      });

    // Set up real-time subscription for inquiry response history with more specific channel name
    const responseHistorySubscription = supabase
      .channel(`inquiry_response_history_${manufacturerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inquiry_response_history",
          filter: `manufacturer_id=eq.${manufacturerId}`,
        },
        (payload) => {
          console.log("=== REAL-TIME RESPONSE HISTORY UPDATE ===");
          console.log("Payload:", payload);
          console.log("Event type:", payload.eventType);
          console.log("New data:", payload.new);
          console.log("Old data:", payload.old);
          console.log("Timestamp:", new Date().toISOString());

          // Force refresh coal inquiries when response history changes
          console.log(
            "Refreshing coal inquiries due to response history update",
          );
          fetchCoalInquiries();
          fetchProviderMessages();
        },
      )
      .subscribe((status) => {
        console.log("Response history subscription status:", status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log("Cleaning up real-time subscriptions");
      coalInquiriesSubscription.unsubscribe();
      responseHistorySubscription.unsubscribe();
    };
  }, [manufacturerId]);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      // Fetch inquiries for this manufacturer
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      if (!data) {
        setInquiries([]);
        return;
      }

      // Enrich with customer details if missing
      const enrichedWithCustomer = await Promise.all(
        data.map(async (inq) => {
          if (inq.customer_name && inq.customer_phone) return inq;
          let customer = null;
          try {
            const { data: cust } = await supabase
              .from("endcustomers")
              .select("name, phone")
              .eq("id", inq.customer_id)
              .maybeSingle();
            customer = cust;
          } catch (custError) {
            console.warn("Failed to fetch customer details:", custError);
          }
          return {
            ...inq,
            customer_name:
              inq.customer_name || customer?.name || "Unknown Customer",
            customer_phone: inq.customer_phone || customer?.phone || "N/A",
          };
        }),
      );

      // Fetch all responses for these inquiries
      const inquiryIds = enrichedWithCustomer.map((i) => i.id);
      let responses: any[] = [];
      if (inquiryIds.length > 0) {
        const { data: respData, error: respError } = await supabase
          .from("inquiry_responses")
          .select("*")
          .in("inquiry_id", inquiryIds);

        if (respError) {
          console.warn("Failed to fetch inquiry responses:", respError);
        } else {
          responses = respData || [];
        }
      }

      // Attach the latest response to each inquiry
      const enriched = enrichedWithCustomer.map((inq) => {
        const response = responses
          .filter((r) => r.inquiry_id === inq.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0];
        return {
          ...inq,
          reply: response?.response_text || null,
          reply_by: response?.created_by_name || null,
          reply_at: response?.created_at || null,
        };
      });
      setInquiries(enriched);
    } catch (error) {
      console.error("Error in inquiry fetch:", error);
      toast({
        title: "Error",
        description: "Failed to load inquiries. Please try again later.",
        variant: "destructive",
      });
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoalInquiries = async () => {
    try {
      console.log("=== FETCHING COAL INQUIRIES FOR MANUFACTURER ===");
      console.log("Manufacturer ID:", manufacturerId);
      console.log("Timestamp:", new Date().toISOString());
      console.log(
        "Fetch triggered by:",
        new Error().stack?.split("\n")[2]?.trim(),
      );

      // Clear cache and force fresh data
      const { data, error } = await supabase
        .from("manufacturer_coal_inquiries")
        .select(
          `
          *,
          coal_providers!inner(company_name, name, phone, email)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .order("updated_at", { ascending: false }); // Order by updated_at to show most recently updated first

      if (error) {
        console.error("Error fetching coal inquiries:", error);
        throw error;
      }

      console.log("Fetched coal inquiries:", data?.length || 0);
      console.log(
        "Coal inquiries data with responses:",
        data?.map((inquiry) => ({
          id: inquiry.id,
          coal_type: inquiry.coal_type,
          status: inquiry.status,
          provider_response: inquiry.provider_response,
          provider_response_date: inquiry.provider_response_date,
          responded_by: inquiry.responded_by,
          coal_providers: inquiry.coal_providers,
          fuel_types: inquiry.fuel_types,
          created_at: inquiry.created_at,
          updated_at: inquiry.updated_at,
        })),
      );

      // Log quotations with status 'responded' specifically (coal inquiries use 'responded' status)
      const respondedInquiries =
        data?.filter((q) => q.status === "responded") || [];
      const pendingInquiries =
        data?.filter((q) => q.status === "pending") || [];
      console.log(
        "Inquiries with 'responded' status:",
        respondedInquiries.length,
      );
      console.log("Inquiries with 'pending' status:", pendingInquiries.length);
      console.log("Responded inquiries details:", respondedInquiries);

      // Log the first inquiry in detail to debug
      if (data && data.length > 0) {
        console.log("First inquiry full details:", data[0]);
        console.log("First inquiry response details:", {
          provider_response: data[0].provider_response,
          provider_response_date: data[0].provider_response_date,
          responded_by: data[0].responded_by,
          status: data[0].status,
          updated_at: data[0].updated_at,
        });

        // Check if there are any responses at all
        const responsesCount = data.filter(
          (inquiry) => inquiry.provider_response,
        ).length;
        console.log("Total inquiries with responses:", responsesCount);

        // Log all inquiries with responses
        const inquiriesWithResponses = data.filter(
          (inquiry) => inquiry.provider_response,
        );
        console.log(
          "All inquiries with responses:",
          inquiriesWithResponses.map((inquiry) => ({
            id: inquiry.id,
            provider_response: inquiry.provider_response,
            provider_response_date: inquiry.provider_response_date,
            updated_at: inquiry.updated_at,
          })),
        );
      }

      // Direct state update
      setCoalInquiries(data || []);

      console.log("=== END FETCHING COAL INQUIRIES ===");
    } catch (error) {
      console.error("Error in coal inquiry fetch:", error);
      toast({
        title: "Error",
        description: "Failed to load coal inquiries. Please try again later.",
        variant: "destructive",
      });
      setCoalInquiries([]);
    }
  };

  const handleViewInquiry = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    // In a real implementation, you might open a modal or navigate to a detail page
    console.log(`View inquiry ${inquiry.id} clicked`);
  };

  const handleResolveInquiry = async (inquiryId: string) => {
    try {
      setIsSubmitting(true);
      // Update the inquiry status in the database
      const { error } = await supabase
        .from("inquiries")
        .update({ status: "resolved", updated_at: new Date().toISOString() })
        .eq("id", inquiryId);

      if (error) {
        throw error;
      }

      // Update the local state
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: "resolved" } : inq,
        ),
      );

      toast({
        title: "Success",
        description: "Inquiry marked as resolved.",
      });
    } catch (error) {
      console.error("Error resolving inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to resolve inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseInquiry = async (inquiryId: string) => {
    try {
      setIsSubmitting(true);
      // Update the inquiry status in the database
      const { error } = await supabase
        .from("inquiries")
        .update({ status: "closed", updated_at: new Date().toISOString() })
        .eq("id", inquiryId);

      if (error) {
        throw error;
      }

      // Update the local state
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: "closed" } : inq,
        ),
      );

      toast({
        title: "Success",
        description: "Inquiry closed successfully.",
      });
    } catch (error) {
      console.error("Error closing inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to close inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenInquiry = async (inquiryId: string) => {
    try {
      setIsSubmitting(true);
      // Update the inquiry status in the database
      const { error } = await supabase
        .from("inquiries")
        .update({ status: "pending", updated_at: new Date().toISOString() })
        .eq("id", inquiryId);

      if (error) {
        throw error;
      }

      // Update the local state
      setInquiries(
        inquiries.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: "pending" } : inq,
        ),
      );

      toast({
        title: "Success",
        description: "Inquiry re-opened successfully.",
      });
    } catch (error) {
      console.error("Error re-opening inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to re-open inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (inquiry: Inquiry) => {
    setReplyingInquiry(inquiry);
    setReplyText("");
  };

  const fetchProviderMessages = async () => {
    try {
      setMessagesLoading(true);
      const messages: ProviderMessage[] = [];

      // Fetch coal provider quotations
      const { data: coalQuotations } = await supabase
        .from("manufacturer_coal_quotations")
        .select(
          `
          *,
          coal_providers!inner(company_name)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });

      if (coalQuotations) {
        coalQuotations.forEach((quotation) => {
          // Only show quotations that have been responded to (status = 'quoted')
          if (quotation.status === "quoted" && quotation.price_per_unit) {
            messages.push({
              id: `coal_quotation_${quotation.id}`,
              type: "coal_quotation",
              provider_name:
                quotation.coal_providers?.company_name || "Unknown Provider",
              provider_type: "coal",
              subject: `Coal Quotation Response - ${quotation.coal_type}`,
              message: `Quotation for ${quotation.quantity} ${quotation.unit} of ${quotation.coal_type} at ₹${quotation.price_per_unit} per unit (Total: ₹${quotation.total_amount})`,
              status: quotation.status,
              created_at: quotation.updated_at || quotation.created_at, // Use updated_at for responses
              data: quotation,
              is_read: false,
            });
          }
        });
      }

      // Fetch coal inquiry responses (text-based responses)
      const { data: coalInquiryResponses } = await supabase
        .from("manufacturer_coal_inquiries")
        .select(
          `
          *,
          coal_providers!inner(company_name, name)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .eq("status", "responded")
        .not("provider_response", "is", null)
        .order("provider_response_date", { ascending: false });

      if (coalInquiryResponses) {
        coalInquiryResponses.forEach((inquiry) => {
          messages.push({
            id: `coal_inquiry_response_${inquiry.id}`,
            type: "inquiry_response",
            provider_name:
              inquiry.coal_providers?.company_name || "Unknown Provider",
            provider_type: "coal",
            subject: `Coal Inquiry Response - ${inquiry.coal_type}`,
            message: inquiry.provider_response || "Response received",
            status: "received",
            created_at: inquiry.provider_response_date || inquiry.updated_at,
            data: {
              ...inquiry,
              response_text: inquiry.provider_response,
              responded_by: inquiry.responded_by,
            },
            is_read: false,
          });
        });
      }

      // Fetch transport provider quotations
      const { data: transportQuotations } = await supabase
        .from("manufacturer_transport_quotations")
        .select(
          `
          *,
          transport_providers!inner(company_name)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });

      if (transportQuotations) {
        transportQuotations.forEach((quotation) => {
          messages.push({
            id: `transport_quotation_${quotation.id}`,
            type: "transport_quotation",
            provider_name:
              quotation.transport_providers?.company_name || "Unknown Provider",
            provider_type: "transport",
            subject: `Transport Quotation - ${quotation.transport_type}`,
            message: `Transport quotation from ${quotation.pickup_location} to ${quotation.delivery_location} for ₹${quotation.total_estimated_cost}`,
            status: quotation.status,
            created_at: quotation.created_at,
            data: quotation,
            is_read: false,
          });
        });
      }

      // Fetch coal order updates
      const { data: coalOrders } = await supabase
        .from("manufacturer_coal_orders")
        .select(
          `
          *,
          coal_providers!inner(company_name)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .order("updated_at", { ascending: false });

      if (coalOrders) {
        coalOrders.forEach((order) => {
          messages.push({
            id: `coal_order_${order.id}`,
            type: "order_update",
            provider_name:
              order.coal_providers?.company_name || "Unknown Provider",
            provider_type: "coal",
            subject: `Coal Order Update - ${order.order_number}`,
            message: `Order status: ${order.order_status}. Payment status: ${order.payment_status}`,
            status: order.order_status,
            created_at: order.updated_at,
            data: order,
            is_read: false,
          });
        });
      }

      // Fetch transport order updates
      const { data: transportOrders } = await supabase
        .from("manufacturer_transport_orders")
        .select(
          `
          *,
          transport_providers!inner(company_name)
        `,
        )
        .eq("manufacturer_id", manufacturerId)
        .order("updated_at", { ascending: false });

      if (transportOrders) {
        transportOrders.forEach((order) => {
          messages.push({
            id: `transport_order_${order.id}`,
            type: "order_update",
            provider_name:
              order.transport_providers?.company_name || "Unknown Provider",
            provider_type: "transport",
            subject: `Transport Order Update - ${order.order_number}`,
            message: `Order status: ${order.order_status}. Payment status: ${order.payment_status || "Pending"}`,
            status: order.order_status,
            created_at: order.updated_at,
            data: order,
            is_read: false,
          });
        });
      }

      // Fetch inquiry responses
      const { data: inquiryResponses } = await supabase
        .from("inquiry_responses")
        .select(
          `
          *,
          inquiries!inner(
            manufacturer_id,
            subject
          )
        `,
        )
        .eq("inquiries.manufacturer_id", manufacturerId)
        .order("created_at", { ascending: false });

      if (inquiryResponses) {
        inquiryResponses.forEach((response) => {
          messages.push({
            id: `inquiry_response_${response.id}`,
            type: "inquiry_response",
            provider_name: response.created_by_name || "Provider",
            provider_type: "coal", // Default, could be enhanced
            subject: `Response to: ${response.inquiries?.subject || "Your Inquiry"}`,
            message: response.response_text,
            status: "received",
            created_at: response.created_at,
            data: response,
            is_read: false,
          });
        });
      }

      // Sort all messages by date
      messages.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setProviderMessages(messages);
    } catch (error) {
      console.error("Error fetching provider messages:", error);
      toast({
        title: "Error",
        description: "Failed to load provider messages.",
        variant: "destructive",
      });
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyingInquiry) return;
    setIsSubmitting(true);
    try {
      // Insert the reply into inquiry_responses
      const { error } = await supabase.from("inquiry_responses").insert([
        {
          inquiry_id: replyingInquiry.id,
          response_text: replyText,
          created_by: manufacturerId,
          created_by_name: "Manufacturer", // Replace with actual name if available
        },
      ]);
      if (error) throw error;

      // Update inquiry status to 'replied'
      await supabase
        .from("inquiries")
        .update({ status: "replied", updated_at: new Date().toISOString() })
        .eq("id", replyingInquiry.id);

      // Refetch inquiries to get the new reply
      await fetchInquiries();

      setReplyingInquiry(null);
      setReplyText("");
      toast({
        title: "Reply sent",
        description: "Your reply has been sent to the customer.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewMessage = (message: ProviderMessage) => {
    setSelectedMessage(message);
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case "coal_quotation":
      case "transport_quotation":
        return <FileText className="h-4 w-4" />;
      case "order_update":
        return <ShoppingCart className="h-4 w-4" />;
      case "inquiry_response":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "outline";
    let displayStatus = status;

    switch (status?.toLowerCase()) {
      case "pending":
      case "new":
        variant = "secondary";
        break;
      case "accepted":
      case "confirmed":
      case "completed":
      case "delivered":
        variant = "default";
        break;
      case "rejected":
      case "cancelled":
        variant = "destructive";
        break;
      default:
        variant = "outline";
    }

    return (
      <Badge variant={variant}>
        {displayStatus?.charAt(0).toUpperCase() + displayStatus?.slice(1) ||
          "Unknown"}
      </Badge>
    );
  };

  const renderStatusBadge = (inquiry: Inquiry) => {
    if (inquiry.status === "closed") {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-red-100 text-red-800 border border-red-300">
          Closed
        </span>
      );
    } else if (
      inquiry.status === "responded" ||
      inquiry.reply ||
      inquiry.provider_response
    ) {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-green-100 text-green-800 border border-green-300">
          Responded
        </span>
      );
    } else {
      return (
        <span className="inline-block px-2 py-1 text-xs rounded-full font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
          Pending
        </span>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Communications</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            console.log("=== MANUAL REFRESH TRIGGERED ===");
            console.log("Timestamp:", new Date().toISOString());
            console.log("Current coal inquiries count:", coalInquiries.length);

            // Clear current data first
            setCoalInquiries([]);
            setInquiries([]);
            setProviderMessages([]);

            // Fetch fresh data immediately
            await Promise.all([
              fetchProviderMessages(),
              fetchInquiries(),
              fetchCoalInquiries(),
            ]);

            console.log("Manual refresh completed");
            toast({
              title: "Refreshed",
              description: "All communications have been refreshed.",
            });
          }}
          disabled={messagesLoading || loading}
          className="flex items-center gap-2"
        >
          <RefreshCw
            className={`h-4 w-4 ${messagesLoading || loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue="customer-inquiries" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger
            value="customer-inquiries"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            Customer Inquiries ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger
            value="coal-inquiries"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <FileText className="h-4 w-4" />
            Coal Inquiries ({coalInquiries.length})
          </TabsTrigger>
          <TabsTrigger
            value="provider-messages"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <Bell className="h-4 w-4" />
            Provider Messages ({providerMessages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer-inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Customer Inquiries</CardTitle>
              <CardDescription>
                Manage and respond to customer inquiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>You don't have any inquiries yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Subject</th>
                        <th className="text-left py-3 px-4">Date</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-right py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiries.map((inquiry) => (
                        <React.Fragment key={inquiry.id}>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium">
                                  {inquiry.customer_name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {inquiry.customer_phone}
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">{inquiry.subject}</td>
                            <td className="py-3 px-4">
                              {formatDate(inquiry.created_at)}
                            </td>
                            <td className="py-3 px-4">
                              {renderStatusBadge(inquiry)}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewInquiry(inquiry)}
                                  disabled={isSubmitting}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {inquiry.status === "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleReply(inquiry)}
                                    disabled={isSubmitting}
                                    title={
                                      inquiry.reply ? "Update Reply" : "Reply"
                                    }
                                  >
                                    <MessageSquare className="h-4 w-4 text-blue-500" />
                                  </Button>
                                )}
                                {inquiry.status === "new" ||
                                inquiry.status === "in-progress" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleResolveInquiry(inquiry.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                ) : null}
                                {inquiry.status !== "closed" ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleCloseInquiry(inquiry.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleReopenInquiry(inquiry.id)
                                    }
                                    disabled={isSubmitting}
                                  >
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                          {inquiry.reply && (
                            <tr>
                              <td
                                colSpan={5}
                                className="bg-gray-50 px-4 py-2 text-sm text-gray-700"
                              >
                                <strong>Reply:</strong> {inquiry.reply}
                                {inquiry.reply_at && (
                                  <span className="ml-2 text-xs text-gray-400">
                                    at {formatDate(inquiry.reply_at)}
                                  </span>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Showing {inquiries.length} inquiry(ies)
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="coal-inquiries">
          <Card>
            <CardHeader>
              <CardTitle>Coal/Fuel Provider Inquiries</CardTitle>
              <CardDescription>
                View your inquiries to coal/fuel providers and their responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coalInquiries.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No coal/fuel inquiries sent yet.</p>
                  <p className="text-sm mt-2">
                    Your inquiries to coal/fuel providers will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coalInquiries.map((inquiry) => (
                    <Card key={inquiry.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {inquiry.coal_providers?.company_name ||
                                "Unknown Provider"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {inquiry.coal_type} - {inquiry.quantity}{" "}
                              {inquiry.unit}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                inquiry.status === "responded"
                                  ? "default"
                                  : "secondary"
                              }
                              className="flex items-center gap-1"
                            >
                              {inquiry.status === "responded" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <MessageSquare className="h-3 w-3" />
                              )}
                              {inquiry.status?.charAt(0).toUpperCase() +
                                inquiry.status?.slice(1)}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {formatDate(inquiry.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-1">
                              Your Inquiry:
                            </p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {inquiry.message}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {inquiry.delivery_location && (
                              <p>
                                <strong>Delivery Location:</strong>{" "}
                                {inquiry.delivery_location}
                              </p>
                            )}
                            {inquiry.expected_delivery_date && (
                              <p>
                                <strong>Expected Delivery:</strong>{" "}
                                {formatDate(inquiry.expected_delivery_date)}
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

                          {(inquiry.provider_response ||
                            inquiry.status === "responded") && (
                            <div className="border-t pt-3">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">
                                  Provider Response:
                                </span>
                                {inquiry.provider_response_date && (
                                  <span className="text-xs text-green-600">
                                    {formatDate(inquiry.provider_response_date)}
                                  </span>
                                )}
                                {inquiry.updated_at &&
                                  inquiry.provider_response_date &&
                                  new Date(inquiry.updated_at).getTime() >
                                    new Date(
                                      inquiry.provider_response_date,
                                    ).getTime() && (
                                    <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                                      Updated
                                    </span>
                                  )}
                              </div>
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-700">
                                  {inquiry.provider_response ||
                                    "Response received - check details"}
                                </p>
                                {inquiry.responded_by && (
                                  <p className="text-xs text-green-600 mt-2">
                                    Responded by: {inquiry.responded_by}
                                  </p>
                                )}
                                {inquiry.updated_at && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Last updated:{" "}
                                    {formatDate(inquiry.updated_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedCoalInquiry(inquiry)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Showing {coalInquiries.length} coal inquiry(ies)
              </p>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="provider-messages">
          <Card>
            <CardHeader>
              <CardTitle>Provider Messages</CardTitle>
              <CardDescription>
                View quotations, responses, and order updates from coal/fuel and
                transport providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : providerMessages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages from providers yet.</p>
                  <p className="text-sm mt-2">
                    Messages will appear here when providers respond to your
                    inquiries or update your orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {providerMessages.map((message) => (
                    <Card
                      key={message.id}
                      className="border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-orange-100">
                              {getMessageIcon(message.type)}
                            </div>
                            <div>
                              <CardTitle className="text-lg">
                                {message.subject}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <span className="font-medium">
                                  {message.provider_name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {message.provider_type === "coal"
                                    ? "Coal/Fuel"
                                    : "Transport"}
                                </Badge>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(message.status, message.type)}
                            <span className="text-xs text-gray-500">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700 mb-3">
                          {message.message}
                        </p>
                        {message.data && (
                          <div className="bg-gray-50 p-3 rounded-lg text-sm">
                            {message.type === "coal_quotation" && (
                              <div className="grid grid-cols-2 gap-2">
                                <p>
                                  <strong>Quantity:</strong>{" "}
                                  {message.data.quantity} {message.data.unit}
                                </p>
                                <p>
                                  <strong>Price per Unit:</strong> ₹
                                  {message.data.price_per_unit}
                                </p>
                                <p>
                                  <strong>Total Amount:</strong> ₹
                                  {message.data.total_amount}
                                </p>
                                {message.data.delivery_location && (
                                  <p>
                                    <strong>Delivery:</strong>{" "}
                                    {message.data.delivery_location}
                                  </p>
                                )}
                              </div>
                            )}
                            {message.type === "transport_quotation" && (
                              <div className="grid grid-cols-2 gap-2">
                                <p>
                                  <strong>From:</strong>{" "}
                                  {message.data.pickup_location}
                                </p>
                                <p>
                                  <strong>To:</strong>{" "}
                                  {message.data.delivery_location}
                                </p>
                                <p>
                                  <strong>Cost:</strong> ₹
                                  {message.data.total_estimated_cost}
                                </p>
                                {message.data.estimated_duration && (
                                  <p>
                                    <strong>Duration:</strong>{" "}
                                    {message.data.estimated_duration}
                                  </p>
                                )}
                              </div>
                            )}
                            {message.type === "inquiry_response" && (
                              <div className="space-y-2">
                                <p>
                                  <strong>Response:</strong>
                                </p>
                                <div className="bg-green-50 border border-green-200 rounded p-3">
                                  <p className="text-sm text-green-700">
                                    {message.data.response_text ||
                                      message.data.provider_response}
                                  </p>
                                </div>
                                {message.data.responded_by && (
                                  <p className="text-xs text-green-600">
                                    <strong>Responded by:</strong>{" "}
                                    {message.data.responded_by}
                                  </p>
                                )}
                                {message.data.coal_type && (
                                  <p>
                                    <strong>Coal Type:</strong>{" "}
                                    {message.data.coal_type}
                                  </p>
                                )}
                                {message.data.quantity && (
                                  <p>
                                    <strong>Quantity:</strong>{" "}
                                    {message.data.quantity} {message.data.unit}
                                  </p>
                                )}
                                {message.data.delivery_location && (
                                  <p>
                                    <strong>Delivery Location:</strong>{" "}
                                    {message.data.delivery_location}
                                  </p>
                                )}
                              </div>
                            )}
                            {message.type === "order_update" && (
                              <div className="grid grid-cols-2 gap-4">
                                <p>
                                  <strong>Order Number:</strong>{" "}
                                  {message.data.order_number}
                                </p>
                                <p>
                                  <strong>Order Status:</strong>{" "}
                                  {message.data.order_status}
                                </p>
                                <p>
                                  <strong>Payment Status:</strong>{" "}
                                  {message.data.payment_status || "Pending"}
                                </p>
                                <p>
                                  <strong>Total Cost:</strong> ₹
                                  {message.data.total_cost ||
                                    message.data.total_amount}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewMessage(message)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <p className="text-sm text-gray-500">
                Showing {providerMessages.length} message(s)
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Message Details Dialog */}
      <Dialog
        open={!!selectedMessage}
        onOpenChange={(open) => {
          if (!open) setSelectedMessage(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-100">
                  {getMessageIcon(selectedMessage.type)}
                </div>
                <div>
                  <h3 className="font-semibold">{selectedMessage.subject}</h3>
                  <p className="text-sm text-gray-600">
                    From: {selectedMessage.provider_name} (
                    {selectedMessage.provider_type === "coal"
                      ? "Coal/Fuel Provider"
                      : "Transport Provider"}
                    )
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Message:</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.data && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Details:</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm space-y-2">
                    {selectedMessage.type === "coal_quotation" && (
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          <strong>Quantity:</strong>{" "}
                          {selectedMessage.data.quantity}{" "}
                          {selectedMessage.data.unit}
                        </p>
                        <p>
                          <strong>Price per Unit:</strong> ₹
                          {selectedMessage.data.price_per_unit}
                        </p>
                        <p>
                          <strong>Total Amount:</strong> ₹
                          {selectedMessage.data.total_amount}
                        </p>
                        {selectedMessage.data.delivery_location && (
                          <p>
                            <strong>Delivery:</strong>{" "}
                            {selectedMessage.data.delivery_location}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedMessage.type === "transport_quotation" && (
                      <div className="grid grid-cols-2 gap-2">
                        <p>
                          <strong>From:</strong>{" "}
                          {selectedMessage.data.pickup_location}
                        </p>
                        <p>
                          <strong>To:</strong>{" "}
                          {selectedMessage.data.delivery_location}
                        </p>
                        <p>
                          <strong>Cost:</strong> ₹
                          {selectedMessage.data.total_estimated_cost}
                        </p>
                        {selectedMessage.data.estimated_duration && (
                          <p>
                            <strong>Duration:</strong>{" "}
                            {selectedMessage.data.estimated_duration}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedMessage.type === "inquiry_response" && (
                      <div className="space-y-2">
                        <p>
                          <strong>Response:</strong>
                        </p>
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          <p className="text-sm text-green-700">
                            {selectedMessage.data.response_text ||
                              selectedMessage.data.provider_response}
                          </p>
                        </div>
                        {selectedMessage.data.responded_by && (
                          <p className="text-xs text-green-600">
                            <strong>Responded by:</strong>{" "}
                            {selectedMessage.data.responded_by}
                          </p>
                        )}
                        {selectedMessage.data.coal_type && (
                          <p>
                            <strong>Coal Type:</strong>{" "}
                            {selectedMessage.data.coal_type}
                          </p>
                        )}
                        {selectedMessage.data.quantity && (
                          <p>
                            <strong>Quantity:</strong>{" "}
                            {selectedMessage.data.quantity}{" "}
                            {selectedMessage.data.unit}
                          </p>
                        )}
                        {selectedMessage.data.delivery_location && (
                          <p>
                            <strong>Delivery Location:</strong>{" "}
                            {selectedMessage.data.delivery_location}
                          </p>
                        )}
                      </div>
                    )}
                    {selectedMessage.type === "order_update" && (
                      <div className="grid grid-cols-2 gap-4">
                        <p>
                          <strong>Order Number:</strong>{" "}
                          {selectedMessage.data.order_number}
                        </p>
                        <p>
                          <strong>Order Status:</strong>{" "}
                          {selectedMessage.data.order_status}
                        </p>
                        <p>
                          <strong>Payment Status:</strong>{" "}
                          {selectedMessage.data.payment_status || "Pending"}
                        </p>
                        <p>
                          <strong>Total Cost:</strong> ₹
                          {selectedMessage.data.total_cost ||
                            selectedMessage.data.total_amount}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500">
                  <strong>Received:</strong>{" "}
                  {formatDate(selectedMessage.created_at)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!replyingInquiry}
        onOpenChange={(open) => {
          if (!open) setReplyingInquiry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reply to Inquiry</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <div className="font-medium mb-1">
              Subject: {replyingInquiry?.subject}
            </div>
            <div className="mb-2 text-gray-700">
              Message: {replyingInquiry?.message}
            </div>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply here..."
              className="w-full min-h-[100px]"
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyingInquiry(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="bg-hotRed-600 hover:bg-hotRed-700"
              onClick={handleSubmitReply}
              disabled={isSubmitting || !replyText.trim()}
            >
              {isSubmitting ? "Sending..." : "Send Reply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!selectedInquiry}
        onOpenChange={(open) => {
          if (!open) setSelectedInquiry(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <div className="space-y-2">
              <div>
                <strong>Customer:</strong> {selectedInquiry.customer_name} (
                {selectedInquiry.customer_phone})
              </div>
              <div>
                <strong>Subject:</strong> {selectedInquiry.subject}
              </div>
              <div>
                <strong>Message:</strong> {selectedInquiry.message}
              </div>
              <div>
                <strong>Status:</strong> {selectedInquiry.status}
              </div>
              <div>
                <strong>Date:</strong> {formatDate(selectedInquiry.created_at)}
              </div>
              {selectedInquiry.reply && (
                <div className="bg-gray-50 p-2 rounded">
                  <strong>Reply:</strong> {selectedInquiry.reply}
                  {selectedInquiry.reply_at && (
                    <span className="ml-2 text-xs text-gray-400">
                      at {formatDate(selectedInquiry.reply_at)}
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coal Inquiry Details Dialog */}
      <Dialog
        open={!!selectedCoalInquiry}
        onOpenChange={(open) => {
          if (!open) setSelectedCoalInquiry(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Coal Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedCoalInquiry && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Provider Information:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Company:</strong>{" "}
                    {selectedCoalInquiry.coal_providers?.company_name}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedCoalInquiry.coal_providers?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedCoalInquiry.coal_providers?.phone}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedCoalInquiry.coal_providers?.email}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Inquiry Details:</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Coal Type:</strong>{" "}
                      {selectedCoalInquiry.coal_type}
                    </p>
                    <p>
                      <strong>Status:</strong>
                      <Badge
                        variant={
                          selectedCoalInquiry.status === "responded"
                            ? "default"
                            : "secondary"
                        }
                        className="ml-2"
                      >
                        {selectedCoalInquiry.status?.charAt(0).toUpperCase() +
                          selectedCoalInquiry.status?.slice(1)}
                      </Badge>
                    </p>
                    {selectedCoalInquiry.quantity && (
                      <p>
                        <strong>Quantity:</strong>{" "}
                        {selectedCoalInquiry.quantity}{" "}
                        {selectedCoalInquiry.unit}
                      </p>
                    )}
                    <p>
                      <strong>Inquiry Date:</strong>{" "}
                      {formatDate(selectedCoalInquiry.created_at)}
                    </p>
                  </div>

                  {selectedCoalInquiry.delivery_location && (
                    <p className="text-sm">
                      <strong>Delivery Location:</strong>{" "}
                      {selectedCoalInquiry.delivery_location}
                    </p>
                  )}

                  {selectedCoalInquiry.expected_delivery_date && (
                    <p className="text-sm">
                      <strong>Expected Delivery Date:</strong>{" "}
                      {formatDate(selectedCoalInquiry.expected_delivery_date)}
                    </p>
                  )}

                  {(selectedCoalInquiry.budget_range_min ||
                    selectedCoalInquiry.budget_range_max) && (
                    <p className="text-sm">
                      <strong>Budget Range:</strong> ₹
                      {selectedCoalInquiry.budget_range_min || 0} - ₹
                      {selectedCoalInquiry.budget_range_max || 0}
                    </p>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1">Your Message:</p>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                      {selectedCoalInquiry.message}
                    </p>
                  </div>
                </div>
              </div>

              {selectedCoalInquiry.provider_response && (
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <h4 className="font-medium text-green-800">
                      Provider Response
                    </h4>
                    {selectedCoalInquiry.provider_response_date && (
                      <span className="text-xs text-green-600">
                        {formatDate(selectedCoalInquiry.provider_response_date)}
                      </span>
                    )}
                    {selectedCoalInquiry.updated_at &&
                      selectedCoalInquiry.provider_response_date &&
                      new Date(selectedCoalInquiry.updated_at).getTime() >
                        new Date(
                          selectedCoalInquiry.provider_response_date,
                        ).getTime() && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Updated
                        </span>
                      )}
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-700 mb-2">
                      {selectedCoalInquiry.provider_response}
                    </p>
                    {selectedCoalInquiry.responded_by && (
                      <p className="text-xs text-green-600">
                        Responded by: {selectedCoalInquiry.responded_by}
                      </p>
                    )}
                    {selectedCoalInquiry.updated_at && (
                      <p className="text-xs text-gray-500 mt-2">
                        Last updated:{" "}
                        {formatDate(selectedCoalInquiry.updated_at)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCoalInquiry(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InquiryManagement;
