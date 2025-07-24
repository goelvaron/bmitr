import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  MessageSquare,
  FileText,
  ShoppingCart,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  Trash2,
} from "lucide-react";
import {
  getAllCoalProviders,
  searchCoalProviders,
  type CoalProvider,
} from "@/services/coalProviderService";
import {
  createManufacturerCoalInquiry,
  createManufacturerCoalQuotationRequest,
  createManufacturerCoalOrder,
  createManufacturerCoalRating,
  getManufacturerCoalInquiries,
  getManufacturerCoalQuotations,
  getManufacturerCoalOrders,
  getManufacturerCoalRatings,
  deleteManufacturerCoalInquiry,
  deleteManufacturerCoalQuotation,
  deleteManufacturerCoalOrder,
  deleteManufacturerCoalRating,
  deleteMultipleManufacturerCoalInquiries,
  deleteMultipleManufacturerCoalQuotations,
  deleteMultipleManufacturerCoalOrders,
  deleteMultipleManufacturerCoalRatings,
  type ManufacturerCoalInquiry,
  type ManufacturerCoalQuotation,
  type ManufacturerCoalOrder,
  type ManufacturerCoalRating,
} from "@/services/manufacturerCoalService";
import { toast } from "@/hooks/use-toast";

interface CoalFuelProvidersListProps {
  manufacturerId: string;
}

const CoalFuelProvidersList: React.FC<CoalFuelProvidersListProps> = ({
  manufacturerId = "default-manufacturer-id",
}) => {
  const [providers, setProviders] = useState<CoalProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [inquiries, setInquiries] = useState<ManufacturerCoalInquiry[]>([]);
  const [quotations, setQuotations] = useState<ManufacturerCoalQuotation[]>([]);
  const [orders, setOrders] = useState<ManufacturerCoalOrder[]>([]);
  const [ratings, setRatings] = useState<ManufacturerCoalRating[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFuelType, setSelectedFuelType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<CoalProvider | null>(
    null,
  );
  const [dialogType, setDialogType] = useState<
    "inquiry" | "quotation" | "order" | "rating" | null
  >(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    quantity: 0,
    quotedPrice: 0,
    coalType: "",
    deliveryLocation: "",
    expectedDeliveryDate: "",
    unit: "MT",
    budgetRangeMin: 0,
    budgetRangeMax: 0,
    rating: 5,
    comment: "",
    orderNumber: "",
    orderId: "",
    paymentTerms: "",
    specialInstructions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [selectedInquiries, setSelectedInquiries] = useState<string[]>([]);
  const [selectedQuotations, setSelectedQuotations] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProviders();
    fetchAllRequests();
  }, []);

  const fetchAllRequests = async () => {
    setRequestsLoading(true);
    try {
      const [inquiriesData, quotationsData, ordersData, ratingsData] =
        await Promise.all([
          getManufacturerCoalInquiries(manufacturerId),
          getManufacturerCoalQuotations(manufacturerId),
          getManufacturerCoalOrders(manufacturerId),
          getManufacturerCoalRatings(manufacturerId),
        ]);

      setInquiries(inquiriesData);
      setQuotations(quotationsData);
      setOrders(ordersData);
      setRatings(ratingsData);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your requests",
        variant: "destructive",
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      console.log("Fetching coal/fuel providers...");
      const data = await getAllCoalProviders();
      console.log("Coal/fuel providers fetched:", data);
      setProviders(data);

      if (data.length === 0) {
        toast({
          title: "No Providers Found",
          description:
            "No coal/fuel providers are currently registered in the system.",
        });
      }
    } catch (error) {
      console.error("Error fetching coal providers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch coal providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchCoalProviders(
        searchTerm,
        selectedFuelType === "all" ? "" : selectedFuelType,
        selectedLocation,
      );
      setProviders(data);
    } catch (error) {
      console.error("Error searching coal providers:", error);
      toast({
        title: "Error",
        description: "Failed to search coal providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (
    provider: CoalProvider,
    type: "inquiry" | "quotation" | "order" | "rating",
  ) => {
    console.log("Opening dialog for provider:", provider.id, "type:", type);
    setSelectedProvider(provider);
    setDialogType(type);
    setFormData({
      subject: "",
      message: "",
      quantity: 0,
      quotedPrice: 0,
      coalType: "",
      deliveryLocation: "",
      expectedDeliveryDate: "",
      unit: "MT",
      budgetRangeMin: 0,
      budgetRangeMax: 0,
      rating: 5,
      comment: "",
      orderNumber: "",
      orderId: "",
      paymentTerms: "",
      specialInstructions: "",
    });
  };

  const closeDialog = () => {
    setSelectedProvider(null);
    setDialogType(null);
    setFormData({
      subject: "",
      message: "",
      quantity: 0,
      quotedPrice: 0,
      coalType: "",
      deliveryLocation: "",
      expectedDeliveryDate: "",
      unit: "MT",
      budgetRangeMin: 0,
      budgetRangeMax: 0,
      rating: 5,
      comment: "",
      orderNumber: "",
      orderId: "",
      paymentTerms: "",
      specialInstructions: "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedProvider) return;

    // Basic validation
    if (dialogType === "inquiry" && !formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a message for your inquiry",
        variant: "destructive",
      });
      return;
    }

    if (
      (dialogType === "quotation" || dialogType === "order") &&
      (!formData.coalType || !formData.quantity || !formData.deliveryLocation)
    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (
      dialogType === "rating" &&
      (!formData.comment.trim() || !formData.orderId)
    ) {
      toast({
        title: "Validation Error",
        description:
          "Please select an order and provide a comment for your rating",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      if (dialogType === "inquiry") {
        await createManufacturerCoalInquiry({
          manufacturer_id: manufacturerId,
          coal_provider_id: selectedProvider.id,
          inquiry_type: "general_inquiry",
          coal_type: formData.coalType,
          message: formData.message,
          quantity: formData.quantity || null,
          unit: formData.unit || null,
          delivery_location: formData.deliveryLocation || null,
          expected_delivery_date: formData.expectedDeliveryDate || null,
          budget_range_min: formData.budgetRangeMin || null,
          budget_range_max: formData.budgetRangeMax || null,
        });
        toast({
          title: "Success",
          description: "Inquiry sent successfully",
        });
        fetchAllRequests(); // Refresh the requests list
      } else if (dialogType === "quotation") {
        // Create ONLY a quotation record - completely standalone, no inquiry records created
        const quotationData = {
          manufacturer_id: manufacturerId,
          coal_provider_id: selectedProvider.id,
          inquiry_id: null, // Explicitly null for standalone quotation
          coal_type: formData.coalType,
          quantity: formData.quantity,
          unit: formData.unit,
          price_per_unit: formData.quotedPrice,
          total_amount: formData.quantity * formData.quotedPrice,
          delivery_location: formData.deliveryLocation || null,
          status: "pending",
        };
        console.log("Creating standalone quotation with data:", quotationData);
        console.log("Coal provider ID being used:", selectedProvider.id);
        await createManufacturerCoalQuotationRequest(quotationData);

        toast({
          title: "Success",
          description:
            "Quotation request sent successfully (standalone record only)",
        });
        fetchAllRequests(); // Refresh the requests list
      } else if (dialogType === "order") {
        // Create ONLY an order record - no inquiry or quotation records are created
        const orderData = {
          manufacturer_id: manufacturerId,
          coal_provider_id: selectedProvider.id,
          quotation_id: null, // No quotation needed for standalone order
          order_number: formData.orderNumber || `ORD-${Date.now()}`,
          coal_type: formData.coalType,
          quantity: formData.quantity,
          unit: formData.unit,
          price_per_unit: formData.quotedPrice,
          total_amount: formData.quantity * formData.quotedPrice,
          delivery_location: formData.deliveryLocation,
          expected_delivery_date: formData.expectedDeliveryDate || null,
          payment_terms: formData.paymentTerms || null,
          special_instructions: formData.specialInstructions || null,
          order_status: "pending",
          payment_status: "pending",
        };
        console.log("Creating standalone order with data:", orderData);
        console.log("Coal provider ID being used:", selectedProvider.id);
        await createManufacturerCoalOrder(orderData);

        toast({
          title: "Success",
          description: "Order placed successfully (standalone record only)",
        });
        fetchAllRequests(); // Refresh the requests list
      } else if (dialogType === "rating") {
        // Create ONLY a rating record - order_id is REQUIRED
        await createManufacturerCoalRating({
          manufacturer_id: manufacturerId,
          coal_provider_id: selectedProvider.id,
          order_id: formData.orderId, // Required - must reference a completed order
          rating: formData.rating,
          review_text: formData.comment || null,
          review_title: formData.subject || null,
          quality_rating: formData.rating,
          delivery_rating: formData.rating,
          service_rating: formData.rating,
          would_recommend: formData.rating >= 4,
        });
        toast({
          title: "Success",
          description: "Rating submitted successfully (linked to order)",
        });
        fetchAllRequests(); // Refresh the requests list
      }
      closeDialog();
    } catch (error) {
      console.error("Error submitting:", error);
      toast({
        title: "Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fuelTypes = [
    "HIGH & LOW GCV US COAL",
    "IMPORTED COAL",
    "INDIAN COAL",
    "G1 & G2 ASSAM COAL",
    "BIOMASS FUEL",
    "ALTERNATE FUEL",
  ];

  const getStatusBadge = (status: string | null, type: string, item?: any) => {
    let displayStatus = status || "pending";

    // Special logic for quotations
    if (type === "quotation" && item) {
      // Check if provider has responded by looking for response fields
      // Only consider it received if provider has filled in key quotation details
      // AND the quotation wasn't created by the manufacturer themselves
      const hasProviderResponse =
        (item.delivery_timeline && item.delivery_timeline.trim() !== "") ||
        (item.payment_terms && item.payment_terms.trim() !== "") ||
        (item.additional_notes && item.additional_notes.trim() !== "") ||
        (item.validity_period && item.validity_period > 0);

      // Also check if the quotation has a provider_response_date or similar field
      // indicating it was actually sent by the provider
      const hasProviderResponseDate =
        item.provider_response_date || item.responded_at;

      if (hasProviderResponse && hasProviderResponseDate) {
        displayStatus = "received";
      } else {
        displayStatus = "pending";
      }
    }

    // Special logic for orders
    if (type === "order" && item) {
      // Check if provider has confirmed the order by looking for provider response fields
      // Only consider it completed if provider has confirmed or processed the order
      const hasProviderConfirmation =
        item.provider_confirmation_date ||
        item.provider_response_date ||
        item.confirmed_by_provider ||
        (item.provider_order_number &&
          item.provider_order_number.trim() !== "") ||
        (item.tracking_number && item.tracking_number.trim() !== "") ||
        item.actual_delivery_date;

      // Check if the order has been actually processed/confirmed by the provider
      // rather than just created by the manufacturer
      if (hasProviderConfirmation) {
        // Use the actual order_status from the database instead of defaulting to "completed"
        displayStatus = item.order_status || "pending";
      } else {
        displayStatus = "pending";
      }
    }

    // Special logic for payment status - use the actual payment_status value
    if (type === "payment" && item) {
      // For payment status, we should use the actual payment_status field value
      // Don't apply any special logic, just use what's in the database
      // Ensure we always default to "pending" if payment_status is null/undefined
      displayStatus = item.payment_status || "pending";

      // Additional safety check: if payment_status is somehow set to "completed"
      // but there's no evidence of actual payment completion, default to "pending"
      if (
        displayStatus === "completed" &&
        !item.actual_delivery_date &&
        !item.provider_confirmation_date
      ) {
        displayStatus = "pending";
      }
    }

    const statusLower = displayStatus.toLowerCase();

    const getVariant = () => {
      switch (statusLower) {
        case "completed":
        case "delivered":
        case "accepted":
        case "received":
        case "paid":
          return "default"; // Green
        case "pending":
        case "processing":
        case "confirmed":
          return "secondary"; // Yellow
        case "rejected":
        case "cancelled":
          return "destructive"; // Red
        default:
          return "outline";
      }
    };

    const getIcon = () => {
      switch (statusLower) {
        case "completed":
        case "delivered":
        case "accepted":
        case "received":
        case "paid":
          return <CheckCircle className="h-3 w-3" />;
        case "pending":
        case "processing":
        case "confirmed":
          return <Clock className="h-3 w-3" />;
        case "rejected":
        case "cancelled":
          return <XCircle className="h-3 w-3" />;
        default:
          return <AlertCircle className="h-3 w-3" />;
      }
    };

    return (
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getIcon()}
        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getProviderName = (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    return provider?.company_name || "Unknown Provider";
  };

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

  const handleSelectRating = (ratingId: string, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, ratingId]);
    } else {
      setSelectedRatings(selectedRatings.filter((id) => id !== ratingId));
    }
  };

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

  const handleSelectAllRatings = (checked: boolean) => {
    if (checked) {
      setSelectedRatings(ratings.map((rating) => rating.id));
    } else {
      setSelectedRatings([]);
    }
  };

  const handleDeleteSelectedInquiries = async () => {
    if (selectedInquiries.length === 0) return;

    setIsDeleting(true);
    try {
      const success =
        await deleteMultipleManufacturerCoalInquiries(selectedInquiries);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedInquiries.length} inquiries deleted successfully`,
        });
        setSelectedInquiries([]);
        await fetchAllRequests();
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
      const success =
        await deleteMultipleManufacturerCoalQuotations(selectedQuotations);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedQuotations.length} quotations deleted successfully`,
        });
        setSelectedQuotations([]);
        await fetchAllRequests();
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
      const success =
        await deleteMultipleManufacturerCoalOrders(selectedOrders);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedOrders.length} orders deleted successfully`,
        });
        setSelectedOrders([]);
        await fetchAllRequests();
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

  const handleDeleteSelectedRatings = async () => {
    if (selectedRatings.length === 0) return;

    setIsDeleting(true);
    try {
      const success =
        await deleteMultipleManufacturerCoalRatings(selectedRatings);
      if (success) {
        toast({
          title: "Success",
          description: `${selectedRatings.length} ratings deleted successfully`,
        });
        setSelectedRatings([]);
        await fetchAllRequests();
      } else {
        throw new Error("Failed to delete ratings");
      }
    } catch (error) {
      console.error("Error deleting ratings:", error);
      toast({
        title: "Error",
        description: "Failed to delete selected ratings",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleInquiry = async (inquiryId: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteManufacturerCoalInquiry(inquiryId);
      if (success) {
        toast({
          title: "Success",
          description: "Inquiry deleted successfully",
        });
        await fetchAllRequests();
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
      const success = await deleteManufacturerCoalQuotation(quotationId);
      if (success) {
        toast({
          title: "Success",
          description: "Quotation deleted successfully",
        });
        await fetchAllRequests();
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
      const success = await deleteManufacturerCoalOrder(orderId);
      if (success) {
        toast({
          title: "Success",
          description: "Order deleted successfully",
        });
        await fetchAllRequests();
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

  const handleDeleteSingleRating = async (ratingId: string) => {
    setIsDeleting(true);
    try {
      const success = await deleteManufacturerCoalRating(ratingId);
      if (success) {
        toast({
          title: "Success",
          description: "Rating deleted successfully",
        });
        await fetchAllRequests();
      } else {
        throw new Error("Failed to delete rating");
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast({
        title: "Error",
        description: "Failed to delete rating",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white">
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Find Providers</TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            My Requests
            {requestsLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Coal/Fuel Providers</CardTitle>
              <CardDescription>
                Find and connect with coal and fuel suppliers
              </CardDescription>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Input
                  placeholder="Search by company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedFuelType}
                  onValueChange={setSelectedFuelType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Fuel Types</SelectItem>
                    {fuelTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Location (city/state)..."
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                />
                <Button
                  onClick={handleSearch}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : providers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No coal/fuel providers found.</p>
                  <p className="text-sm mt-2">
                    Coal/fuel providers need to register first before they
                    appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {providers.map((provider) => (
                    <Card key={provider.id} className="border border-gray-200">
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {provider.company_name}
                        </CardTitle>
                        <CardDescription>
                          <div className="space-y-1">
                            <p>
                              <strong>Contact:</strong> {provider.name}
                            </p>
                            <p>
                              <strong>Phone:</strong> {provider.phone}
                            </p>
                            <p>
                              <strong>Email:</strong> {provider.email}
                            </p>
                            <p>
                              <strong>Location:</strong> {provider.city},{" "}
                              {provider.state}
                            </p>
                            <p>
                              <strong>Fuel Type:</strong> {provider.fuel_type}
                            </p>
                            {provider.supply_capacity && (
                              <p>
                                <strong>Capacity:</strong>{" "}
                                {provider.supply_capacity}
                              </p>
                            )}
                            {provider.delivery_service_area && (
                              <p>
                                <strong>Service Area:</strong>{" "}
                                {provider.delivery_service_area}
                              </p>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(provider, "inquiry")}
                            className="flex items-center"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Inquiry
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(provider, "quotation")}
                            className="flex items-center"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Quote
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(provider, "order")}
                            className="flex items-center"
                          >
                            <ShoppingCart className="h-4 w-4 mr-1" />
                            Order
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDialog(provider, "rating")}
                            className="flex items-center"
                            disabled={
                              orders.filter(
                                (order) =>
                                  order.coal_provider_id === provider.id,
                              ).length === 0
                            }
                          >
                            <Star className="h-4 w-4 mr-1" />
                            Rate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Coal/Fuel Requests</CardTitle>
                  <CardDescription>
                    Track all your requests, quotations, orders, and ratings
                  </CardDescription>
                </div>
                <Button
                  onClick={fetchAllRequests}
                  disabled={requestsLoading}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${requestsLoading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <Tabs defaultValue="inquiries" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger
                      value="inquiries"
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Inquiries ({inquiries.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="quotations"
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      Quotations ({quotations.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="orders"
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Orders ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="ratings"
                      className="flex items-center gap-2"
                    >
                      <Star className="h-4 w-4" />
                      Ratings ({ratings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="inquiries" className="mt-6">
                    {inquiries.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No inquiries sent yet</p>
                        <p className="text-sm mt-2">
                          Start by sending an inquiry to a coal/fuel provider
                        </p>
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
                          <Card
                            key={inquiry.id}
                            className="border border-gray-200"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={selectedInquiries.includes(
                                      inquiry.id,
                                    )}
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
                                      {getProviderName(
                                        inquiry.coal_provider_id,
                                      )}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                      <span>
                                        Coal Type:{" "}
                                        {inquiry.coal_type || "Not specified"}
                                      </span>
                                      {inquiry.quantity && (
                                        <span>
                                          • Quantity: {inquiry.quantity}{" "}
                                          {inquiry.unit}
                                        </span>
                                      )}
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(
                                    inquiry.status,
                                    "inquiry",
                                    inquiry,
                                  )}
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
                                <p className="text-sm">
                                  <strong>Message:</strong> {inquiry.message}
                                </p>
                                {inquiry.delivery_location && (
                                  <p className="text-sm">
                                    <strong>Delivery Location:</strong>{" "}
                                    {inquiry.delivery_location}
                                  </p>
                                )}
                                {inquiry.expected_delivery_date && (
                                  <p className="text-sm">
                                    <strong>Expected Delivery:</strong>{" "}
                                    {formatDate(inquiry.expected_delivery_date)}
                                  </p>
                                )}
                                {(inquiry.budget_range_min ||
                                  inquiry.budget_range_max) && (
                                  <p className="text-sm">
                                    <strong>Budget Range:</strong> ₹
                                    {inquiry.budget_range_min || 0} - ₹
                                    {inquiry.budget_range_max || 0}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Sent on: {formatDate(inquiry.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="quotations" className="mt-6">
                    {quotations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No quotation requests sent yet</p>
                        <p className="text-sm mt-2">
                          Request quotations from coal/fuel providers
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={
                                selectedQuotations.length ===
                                  quotations.length && quotations.length > 0
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
                          <Card
                            key={quotation.id}
                            className="border border-gray-200"
                          >
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
                                      {getProviderName(
                                        quotation.coal_provider_id,
                                      )}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                      <span>
                                        Coal Type: {quotation.coal_type}
                                      </span>
                                      <span>
                                        • Quantity: {quotation.quantity}{" "}
                                        {quotation.unit}
                                      </span>
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {getStatusBadge(
                                    quotation.status,
                                    "quotation",
                                    quotation,
                                  )}
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
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <p className="text-sm">
                                    <strong>Price per Unit:</strong> ₹
                                    {quotation.price_per_unit}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Total Amount:</strong> ₹
                                    {quotation.total_amount}
                                  </p>
                                </div>
                                {quotation.delivery_location && (
                                  <p className="text-sm">
                                    <strong>Delivery Location:</strong>{" "}
                                    {quotation.delivery_location}
                                  </p>
                                )}
                                {quotation.delivery_timeline && (
                                  <p className="text-sm">
                                    <strong>Delivery Timeline:</strong>{" "}
                                    {quotation.delivery_timeline}
                                  </p>
                                )}
                                {quotation.payment_terms && (
                                  <p className="text-sm">
                                    <strong>Payment Terms:</strong>{" "}
                                    {quotation.payment_terms}
                                  </p>
                                )}
                                {quotation.additional_notes && (
                                  <p className="text-sm">
                                    <strong>Notes:</strong>{" "}
                                    {quotation.additional_notes}
                                  </p>
                                )}
                                {quotation.validity_period && (
                                  <p className="text-sm">
                                    <strong>Valid for:</strong>{" "}
                                    {quotation.validity_period} days
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Requested on:{" "}
                                  {formatDate(quotation.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="orders" className="mt-6">
                    {orders.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No orders placed yet</p>
                        <p className="text-sm mt-2">
                          Place orders with coal/fuel providers
                        </p>
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
                          <Card
                            key={order.id}
                            className="border border-gray-200"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={selectedOrders.includes(order.id)}
                                    onCheckedChange={(checked) =>
                                      handleSelectOrder(
                                        order.id,
                                        checked as boolean,
                                      )
                                    }
                                    disabled={isDeleting}
                                    className="mt-1"
                                  />
                                  <div>
                                    <CardTitle className="text-lg">
                                      Order #{order.order_number}
                                    </CardTitle>
                                    <CardDescription className="flex items-center gap-2 mt-1">
                                      <span>
                                        {getProviderName(
                                          order.coal_provider_id,
                                        )}
                                      </span>
                                      <span>• {order.coal_type}</span>
                                    </CardDescription>
                                  </div>
                                </div>
                                <div className="flex items-start gap-2">
                                  <div className="flex flex-col gap-2">
                                    {getStatusBadge(
                                      order.order_status,
                                      "order",
                                      order,
                                    )}
                                    {order.payment_status && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-xs text-gray-600">
                                          Payment:
                                        </span>
                                        {getStatusBadge(
                                          order.payment_status,
                                          "payment",
                                          order,
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteSingleOrder(order.id)
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
                                <div className="grid grid-cols-2 gap-4">
                                  <p className="text-sm">
                                    <strong>Quantity:</strong> {order.quantity}{" "}
                                    {order.unit}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Price per Unit:</strong> ₹
                                    {order.price_per_unit}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Total Amount:</strong> ₹
                                    {order.total_amount}
                                  </p>
                                  <p className="text-sm">
                                    <strong>Delivery Location:</strong>{" "}
                                    {order.delivery_location}
                                  </p>
                                </div>
                                {order.expected_delivery_date && (
                                  <p className="text-sm">
                                    <strong>Expected Delivery:</strong>{" "}
                                    {formatDate(order.expected_delivery_date)}
                                  </p>
                                )}
                                {order.actual_delivery_date && (
                                  <p className="text-sm">
                                    <strong>Actual Delivery:</strong>{" "}
                                    {formatDate(order.actual_delivery_date)}
                                  </p>
                                )}
                                {order.payment_terms && (
                                  <p className="text-sm">
                                    <strong>Payment Terms:</strong>{" "}
                                    {order.payment_terms}
                                  </p>
                                )}
                                {order.special_instructions && (
                                  <p className="text-sm">
                                    <strong>Special Instructions:</strong>{" "}
                                    {order.special_instructions}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500">
                                  Ordered on: {formatDate(order.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="ratings" className="mt-6">
                    {ratings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Star className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No ratings submitted yet</p>
                        <p className="text-sm mt-2">
                          Rate your experience with coal/fuel providers
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={
                                selectedRatings.length === ratings.length &&
                                ratings.length > 0
                              }
                              onCheckedChange={handleSelectAllRatings}
                              disabled={isDeleting}
                            />
                            <span className="text-sm font-medium">
                              Select All ({selectedRatings.length} selected)
                            </span>
                          </div>
                          {selectedRatings.length > 0 && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={handleDeleteSelectedRatings}
                              disabled={isDeleting}
                              className="flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              {isDeleting
                                ? "Deleting..."
                                : `Delete Selected (${selectedRatings.length})`}
                            </Button>
                          )}
                        </div>
                        {ratings.map((rating) => (
                          <Card
                            key={rating.id}
                            className="border border-gray-200"
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Checkbox
                                    checked={selectedRatings.includes(
                                      rating.id,
                                    )}
                                    onCheckedChange={(checked) =>
                                      handleSelectRating(
                                        rating.id,
                                        checked as boolean,
                                      )
                                    }
                                    disabled={isDeleting}
                                    className="mt-1"
                                  />
                                  <div>
                                    <CardTitle className="text-lg">
                                      {getProviderName(rating.coal_provider_id)}
                                    </CardTitle>
                                    {rating.review_title && (
                                      <CardDescription className="mt-1">
                                        {rating.review_title}
                                      </CardDescription>
                                    )}
                                  </div>
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
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteSingleRating(rating.id)
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
                                {rating.review_text && (
                                  <p className="text-sm">
                                    <strong>Review:</strong>{" "}
                                    {rating.review_text}
                                  </p>
                                )}
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  {rating.quality_rating && (
                                    <p>
                                      <strong>Quality:</strong>{" "}
                                      {rating.quality_rating}/5
                                    </p>
                                  )}
                                  {rating.delivery_rating && (
                                    <p>
                                      <strong>Delivery:</strong>{" "}
                                      {rating.delivery_rating}/5
                                    </p>
                                  )}
                                  {rating.service_rating && (
                                    <p>
                                      <strong>Service:</strong>{" "}
                                      {rating.service_rating}/5
                                    </p>
                                  )}
                                </div>
                                {rating.would_recommend !== null && (
                                  <p className="text-sm">
                                    <strong>Would Recommend:</strong>{" "}
                                    {rating.would_recommend ? "Yes" : "No"}
                                  </p>
                                )}
                                {rating.is_verified && (
                                  <Badge variant="outline" className="text-xs">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Verified Review
                                  </Badge>
                                )}
                                <p className="text-xs text-gray-500">
                                  Submitted on: {formatDate(rating.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog for Inquiry/Quotation/Order/Rating */}
      <Dialog
        open={!!dialogType}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === "inquiry" && "Send Inquiry"}
              {dialogType === "quotation" && "Request Quotation"}
              {dialogType === "order" && "Place Order"}
              {dialogType === "rating" && "Rate Provider"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedProvider && (
              <div className="text-sm text-gray-600 mb-4">
                <strong>{selectedProvider.company_name}</strong>
              </div>
            )}

            {dialogType === "inquiry" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="coalType">Coal Type *</Label>
                  <Select
                    value={formData.coalType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, coalType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                        <SelectItem value="KG">KG (Kilogram)</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value,
                      })
                    }
                    placeholder="Enter delivery location (required)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedDeliveryDate">
                    Expected Delivery Date
                  </Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedDeliveryDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetRangeMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetRangeMin: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Minimum budget"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetRangeMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetRangeMax: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Maximum budget"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter your inquiry details (required)"
                    rows={3}
                    required
                  />
                </div>
              </>
            )}

            {dialogType === "quotation" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="coalType">Coal Type *</Label>
                  <Select
                    value={formData.coalType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, coalType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter quantity needed"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                        <SelectItem value="KG">KG (Kilogram)</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quotedPrice">
                    Expected Price per Unit (₹)
                  </Label>
                  <Input
                    id="quotedPrice"
                    type="number"
                    step="0.01"
                    value={formData.quotedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quotedPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter expected price"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value,
                      })
                    }
                    placeholder="Enter delivery location (required)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedDeliveryDate">
                    Expected Delivery Date
                  </Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedDeliveryDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Additional Requirements</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter any additional requirements"
                    rows={3}
                  />
                </div>
              </>
            )}

            {dialogType === "order" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, orderNumber: e.target.value })
                    }
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="coalType">Coal Type *</Label>
                  <Select
                    value={formData.coalType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, coalType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select coal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {fuelTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="grid gap-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          quantity: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Enter quantity"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) =>
                        setFormData({ ...formData, unit: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MT">MT (Metric Ton)</SelectItem>
                        <SelectItem value="KG">KG (Kilogram)</SelectItem>
                        <SelectItem value="TON">TON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quotedPrice">Price per Unit (₹)</Label>
                  <Input
                    id="quotedPrice"
                    type="number"
                    step="0.01"
                    value={formData.quotedPrice}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quotedPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter agreed price"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value,
                      })
                    }
                    placeholder="Enter delivery location (required)"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="expectedDeliveryDate">
                    Expected Delivery Date
                  </Label>
                  <Input
                    id="expectedDeliveryDate"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expectedDeliveryDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Input
                    id="paymentTerms"
                    value={formData.paymentTerms}
                    onChange={(e) =>
                      setFormData({ ...formData, paymentTerms: e.target.value })
                    }
                    placeholder="e.g., 30 days, Advance payment"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="specialInstructions">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialInstructions: e.target.value,
                      })
                    }
                    placeholder="Any special instructions for the order"
                    rows={3}
                  />
                </div>
              </>
            )}

            {dialogType === "rating" && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="orderSelect">Select Completed Order *</Label>
                  <Select
                    value={formData.orderNumber}
                    onValueChange={(value) => {
                      const selectedOrder = orders.find(
                        (order) => order.order_number === value,
                      );
                      setFormData({
                        ...formData,
                        orderNumber: value,
                        // Store the order ID for the rating
                        orderId: selectedOrder?.id || "",
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an order to rate" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders
                        .filter(
                          (order) =>
                            order.coal_provider_id === selectedProvider?.id,
                        )
                        .map((order) => (
                          <SelectItem key={order.id} value={order.order_number}>
                            Order #{order.order_number} - {order.coal_type} (
                            {order.order_status})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {orders.filter(
                    (order) => order.coal_provider_id === selectedProvider?.id,
                  ).length === 0 && (
                    <p className="text-sm text-red-600">
                      No orders found with this provider. You must complete an
                      order before rating.
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="subject">Review Title</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Enter review title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rating">Overall Rating (1-5)</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, rating: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <SelectItem key={rating} value={rating.toString()}>
                          {rating} Star{rating > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment">Review Comment *</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Share your experience with this provider (required)"
                    rows={4}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeDialog}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoalFuelProvidersList;
