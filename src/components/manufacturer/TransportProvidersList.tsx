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
} from "lucide-react";
import {
  getAllTransportProviders,
  searchTransportProviders,
  type TransportProvider,
} from "@/services/transportProviderService";
import {
  createManufacturerTransportInquiry,
  createManufacturerTransportQuotation,
  createManufacturerTransportOrder,
  createManufacturerTransportRating,
  getManufacturerTransportInquiries,
  getManufacturerTransportQuotations,
  getManufacturerTransportOrders,
  getManufacturerTransportRatings,
} from "@/services/manufacturerTransportService";
import { toast } from "@/hooks/use-toast";

interface TransportProvidersListProps {
  manufacturerId: string;
}

const TransportProvidersList: React.FC<TransportProvidersListProps> = ({
  manufacturerId,
}) => {
  const [providers, setProviders] = useState<TransportProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransportType, setSelectedTransportType] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedProvider, setSelectedProvider] =
    useState<TransportProvider | null>(null);
  const [dialogType, setDialogType] = useState<
    "inquiry" | "quotation" | "order" | "rating" | null
  >(null);
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    pickupLocation: "",
    deliveryLocation: "",
    cargoWeight: 0,
    transportType: "",
    expectedPickupDate: "",
    expectedDeliveryDate: "",
    budgetMin: 0,
    budgetMax: 0,
    rating: 5,
    comment: "",
    reviewTitle: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // New state for requests data
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [quotations, setQuotations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ratings, setRatings] = useState<any[]>([]);
  const [requestsLoading, setRequestsLoading] = useState(true);

  useEffect(() => {
    fetchProviders();
    fetchManufacturerRequests();
  }, []);

  const fetchManufacturerRequests = async () => {
    setRequestsLoading(true);
    try {
      console.log("Fetching manufacturer transport requests...");
      const [inquiriesData, quotationsData, ordersData, ratingsData] =
        await Promise.all([
          getManufacturerTransportInquiries(manufacturerId),
          getManufacturerTransportQuotations(manufacturerId),
          getManufacturerTransportOrders(manufacturerId),
          getManufacturerTransportRatings(manufacturerId),
        ]);

      setInquiries(inquiriesData);
      setQuotations(quotationsData);
      setOrders(ordersData);
      setRatings(ratingsData);

      console.log("Requests fetched:", {
        inquiries: inquiriesData.length,
        quotations: quotationsData.length,
        orders: ordersData.length,
        ratings: ratingsData.length,
      });
    } catch (error) {
      console.error("Error fetching manufacturer requests:", error);
      toast({
        title: "Error",
        description: "Failed to fetch your transport requests",
        variant: "destructive",
      });
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      console.log("Fetching transport providers...");
      const data = await getAllTransportProviders();
      console.log("Transport providers fetched:", data);
      setProviders(data);

      if (data.length === 0) {
        toast({
          title: "No Providers Found",
          description:
            "No transport providers are currently registered in the system.",
        });
      }
    } catch (error) {
      console.error("Error fetching transport providers:", error);
      toast({
        title: "Error",
        description: "Failed to fetch transport providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchTransportProviders(
        searchTerm,
        selectedTransportType === "all" ? "" : selectedTransportType,
        selectedLocation,
      );
      setProviders(data);
    } catch (error) {
      console.error("Error searching transport providers:", error);
      toast({
        title: "Error",
        description: "Failed to search transport providers",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (
    provider: TransportProvider,
    type: "inquiry" | "quotation" | "order" | "rating",
  ) => {
    setSelectedProvider(provider);
    setDialogType(type);
    setFormData({
      subject: "",
      message: "",
      pickupLocation: "",
      deliveryLocation: "",
      cargoWeight: 0,
      transportType: "",
      expectedPickupDate: "",
      expectedDeliveryDate: "",
      budgetMin: 0,
      budgetMax: 0,
      rating: 5,
      comment: "",
      reviewTitle: "",
    });
  };

  const closeDialog = () => {
    setSelectedProvider(null);
    setDialogType(null);
    setFormData({
      subject: "",
      message: "",
      pickupLocation: "",
      deliveryLocation: "",
      cargoWeight: 0,
      transportType: "",
      expectedPickupDate: "",
      expectedDeliveryDate: "",
      budgetMin: 0,
      budgetMax: 0,
      rating: 5,
      comment: "",
      reviewTitle: "",
    });
  };

  const handleSubmit = async () => {
    if (!selectedProvider) return;

    setSubmitting(true);
    try {
      if (dialogType === "inquiry") {
        const inquiryData = {
          manufacturer_id: manufacturerId,
          transport_provider_id: selectedProvider.id,
          inquiry_type: "general_inquiry",
          message: formData.message,
          pickup_location: formData.pickupLocation,
          delivery_location: formData.deliveryLocation,
          cargo_weight: formData.cargoWeight || null,
          transport_type: formData.transportType || null,
          expected_pickup_date: formData.expectedPickupDate || null,
          expected_delivery_date: formData.expectedDeliveryDate || null,
          budget_range_min: formData.budgetMin || null,
          budget_range_max: formData.budgetMax || null,
        };

        const result = await createManufacturerTransportInquiry(inquiryData);
        if (result) {
          toast({
            title: "Success",
            description: "Transport inquiry sent successfully",
          });
        } else {
          throw new Error("Failed to create inquiry");
        }
      } else if (dialogType === "quotation") {
        // First create an inquiry, then create a quotation request
        const inquiryData = {
          manufacturer_id: manufacturerId,
          transport_provider_id: selectedProvider.id,
          inquiry_type: "quotation_inquiry",
          message: formData.message,
          pickup_location: formData.pickupLocation,
          delivery_location: formData.deliveryLocation,
          cargo_weight: formData.cargoWeight || null,
          transport_type: formData.transportType || null,
          expected_pickup_date: formData.expectedPickupDate || null,
          expected_delivery_date: formData.expectedDeliveryDate || null,
          budget_range_min: formData.budgetMin || null,
          budget_range_max: formData.budgetMax || null,
        };

        const inquiry = await createManufacturerTransportInquiry(inquiryData);
        if (inquiry) {
          const quotationData = {
            inquiry_id: inquiry.id,
            manufacturer_id: manufacturerId,
            transport_provider_id: selectedProvider.id,
            pickup_location: formData.pickupLocation,
            delivery_location: formData.deliveryLocation,
            transport_type: formData.transportType || "General",
            total_estimated_cost:
              (formData.budgetMin + formData.budgetMax) / 2 || 0,
          };

          const result =
            await createManufacturerTransportQuotation(quotationData);
          if (result) {
            toast({
              title: "Success",
              description: "Transport quotation request sent successfully",
            });
          } else {
            throw new Error("Failed to create quotation");
          }
        } else {
          throw new Error("Failed to create inquiry for quotation");
        }
      } else if (dialogType === "order") {
        // First create an inquiry and quotation, then create an order
        const inquiryData = {
          manufacturer_id: manufacturerId,
          transport_provider_id: selectedProvider.id,
          inquiry_type: "order_inquiry",
          message: formData.message,
          pickup_location: formData.pickupLocation,
          delivery_location: formData.deliveryLocation,
          cargo_weight: formData.cargoWeight || null,
          transport_type: formData.transportType || null,
          expected_pickup_date: formData.expectedPickupDate || null,
          expected_delivery_date: formData.expectedDeliveryDate || null,
          budget_range_min: formData.budgetMin || null,
          budget_range_max: formData.budgetMax || null,
        };

        const inquiry = await createManufacturerTransportInquiry(inquiryData);
        if (inquiry) {
          const quotationData = {
            inquiry_id: inquiry.id,
            manufacturer_id: manufacturerId,
            transport_provider_id: selectedProvider.id,
            pickup_location: formData.pickupLocation,
            delivery_location: formData.deliveryLocation,
            transport_type: formData.transportType || "General",
            total_estimated_cost:
              (formData.budgetMin + formData.budgetMax) / 2 || 0,
          };

          const quotation =
            await createManufacturerTransportQuotation(quotationData);
          if (quotation) {
            const orderData = {
              quotation_id: quotation.id,
              manufacturer_id: manufacturerId,
              transport_provider_id: selectedProvider.id,
              order_number: `TO-${Date.now()}`,
              pickup_location: formData.pickupLocation,
              delivery_location: formData.deliveryLocation,
              transport_type: formData.transportType || "General",
              cargo_weight: formData.cargoWeight || null,
              total_cost: quotation.total_estimated_cost,
              expected_delivery_date: formData.expectedDeliveryDate || null,
              // order_status will be set to "pending" by the service function
              // Only transport providers can update status to confirmed/completed
            };

            const result = await createManufacturerTransportOrder(orderData);
            if (result) {
              toast({
                title: "Success",
                description: "Transport order created successfully",
              });
            } else {
              throw new Error("Failed to create order");
            }
          } else {
            throw new Error("Failed to create quotation for order");
          }
        } else {
          throw new Error("Failed to create inquiry for order");
        }
      } else if (dialogType === "rating") {
        // Double-check: Rating should only be allowed for completed orders
        const completedOrders = orders.filter(
          (order) =>
            order.transport_provider_id === selectedProvider.id &&
            (order.order_status === "completed" ||
              order.order_status === "delivered"),
        );

        if (completedOrders.length === 0) {
          toast({
            title: "No Completed Orders",
            description:
              "You can only rate transport providers after completing an order with them.",
            variant: "destructive",
          });
          closeDialog();
          return;
        }

        // Check if this provider has already been rated for any completed order
        const existingRatings = ratings.filter(
          (rating) => rating.transport_provider_id === selectedProvider.id,
        );

        if (existingRatings.length > 0) {
          toast({
            title: "Already Rated",
            description:
              "You have already rated this transport provider. You can only rate once per provider.",
            variant: "destructive",
          });
          closeDialog();
          return;
        }

        // Use the most recent completed order for rating
        const orderToRate = completedOrders[0];

        const ratingData = {
          order_id: orderToRate.id,
          manufacturer_id: manufacturerId,
          transport_provider_id: selectedProvider.id,
          rating: formData.rating,
          review_title: formData.reviewTitle || null,
          review_text: formData.comment || null,
          punctuality_rating: formData.rating || null,
          safety_rating: formData.rating || null,
          service_rating: formData.rating || null,
        };

        const result = await createManufacturerTransportRating(ratingData);
        if (result) {
          toast({
            title: "Success",
            description: "Rating submitted successfully",
          });
        } else {
          throw new Error("Failed to create rating");
        }
      }
      closeDialog();
      // Refresh requests after successful submission
      fetchManufacturerRequests();
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending",
      },
      confirmed: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "Confirmed",
      },
      in_transit: {
        color: "bg-purple-100 text-purple-800",
        icon: AlertCircle,
        label: "In Transit",
      },
      delivered: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Delivered",
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Cancelled",
      },
      in_progress: {
        color: "bg-blue-100 text-blue-800",
        icon: AlertCircle,
        label: "In Progress",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const transportTypes = ["Road Transport", "Rail Freight"];

  return (
    <div className="bg-white">
      <Tabs defaultValue="providers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="providers">Find Providers</TabsTrigger>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Transport Providers</CardTitle>
              <CardDescription>
                Find and connect with transport service providers
              </CardDescription>

              {/* Search Filters */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <Input
                  placeholder="Search by company name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select
                  value={selectedTransportType}
                  onValueChange={setSelectedTransportType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select transport type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transport Types</SelectItem>
                    {transportTypes.map((type) => (
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
                  <p>No transport providers found.</p>
                  <p className="text-sm mt-2">
                    Transport providers need to register first before they
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
                              <strong>Transport Type:</strong>{" "}
                              {provider.transport_type}
                            </p>
                            <p>
                              <strong>Service Area:</strong>{" "}
                              {provider.service_area}
                            </p>
                            {provider.biz_gst && (
                              <p>
                                <strong>GST/Transporter ID:</strong>{" "}
                                {provider.biz_gst}
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
                            onClick={() => {
                              // Check if there are completed orders before allowing rating
                              const completedOrders = orders.filter(
                                (order) =>
                                  order.transport_provider_id === provider.id &&
                                  (order.order_status === "completed" ||
                                    order.order_status === "delivered"),
                              );

                              if (completedOrders.length === 0) {
                                toast({
                                  title: "No Completed Orders",
                                  description:
                                    "You can only rate transport providers after completing an order with them.",
                                  variant: "destructive",
                                });
                                return;
                              }

                              openDialog(provider, "rating");
                            }}
                            className="flex items-center"
                            disabled={
                              orders.filter(
                                (order) =>
                                  order.transport_provider_id === provider.id &&
                                  (order.order_status === "completed" ||
                                    order.order_status === "delivered"),
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
              <CardTitle>My Transport Requests</CardTitle>
              <CardDescription>
                View all your transport requests, their status, and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : (
                <Tabs defaultValue="inquiries" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="inquiries">
                      Inquiries (
                      {
                        inquiries.filter(
                          (inquiry) =>
                            inquiry.inquiry_type === "general_inquiry",
                        ).length
                      }
                      )
                    </TabsTrigger>
                    <TabsTrigger value="quotations">
                      Quotations ({quotations.length})
                    </TabsTrigger>
                    <TabsTrigger value="orders">
                      Orders ({orders.length})
                    </TabsTrigger>
                    <TabsTrigger value="ratings">
                      Ratings ({ratings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="inquiries" className="mt-6">
                    <div className="space-y-4">
                      {inquiries.filter(
                        (inquiry) => inquiry.inquiry_type === "general_inquiry",
                      ).length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          No inquiries found
                        </p>
                      ) : (
                        inquiries
                          .filter(
                            (inquiry) =>
                              inquiry.inquiry_type === "general_inquiry",
                          )
                          .map((inquiry) => (
                            <Card
                              key={inquiry.id}
                              className="border border-gray-200"
                            >
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">
                                      {inquiry.inquiry_type}
                                    </CardTitle>
                                    <CardDescription>
                                      {inquiry.pickup_location} →{" "}
                                      {inquiry.delivery_location}
                                    </CardDescription>
                                  </div>
                                  {getStatusBadge(inquiry.status)}
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <p>
                                    <strong>Message:</strong> {inquiry.message}
                                  </p>
                                  {inquiry.transport_type && (
                                    <p>
                                      <strong>Transport Type:</strong>{" "}
                                      {inquiry.transport_type}
                                    </p>
                                  )}
                                  {inquiry.cargo_weight && (
                                    <p>
                                      <strong>Cargo Weight:</strong>{" "}
                                      {inquiry.cargo_weight} kg
                                    </p>
                                  )}
                                  {inquiry.budget_range_min &&
                                    inquiry.budget_range_max && (
                                      <p>
                                        <strong>Budget Range:</strong> ₹
                                        {inquiry.budget_range_min} - ₹
                                        {inquiry.budget_range_max}
                                      </p>
                                    )}
                                  <p>
                                    <strong>Created:</strong>{" "}
                                    {formatDate(inquiry.created_at)}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="quotations" className="mt-6">
                    <div className="space-y-4">
                      {quotations.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          No quotations found
                        </p>
                      ) : (
                        quotations.map((quotation) => (
                          <Card
                            key={quotation.id}
                            className="border border-gray-200"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    Transport Quotation
                                  </CardTitle>
                                  <CardDescription>
                                    {quotation.pickup_location} →{" "}
                                    {quotation.delivery_location}
                                  </CardDescription>
                                </div>
                                {getStatusBadge(quotation.status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <p>
                                  <strong>Transport Type:</strong>{" "}
                                  {quotation.transport_type}
                                </p>
                                <p>
                                  <strong>Estimated Cost:</strong> ₹
                                  {quotation.total_estimated_cost}
                                </p>
                                {quotation.estimated_duration && (
                                  <p>
                                    <strong>Estimated Duration:</strong>{" "}
                                    {quotation.estimated_duration}
                                  </p>
                                )}
                                {quotation.payment_terms && (
                                  <p>
                                    <strong>Payment Terms:</strong>{" "}
                                    {quotation.payment_terms}
                                  </p>
                                )}
                                {quotation.additional_notes && (
                                  <p>
                                    <strong>Notes:</strong>{" "}
                                    {quotation.additional_notes}
                                  </p>
                                )}
                                <p>
                                  <strong>Created:</strong>{" "}
                                  {formatDate(quotation.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="orders" className="mt-6">
                    <div className="space-y-4">
                      {orders.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          No orders found
                        </p>
                      ) : (
                        orders.map((order) => (
                          <Card
                            key={order.id}
                            className="border border-gray-200"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    Order #{order.order_number}
                                  </CardTitle>
                                  <CardDescription>
                                    {order.pickup_location} →{" "}
                                    {order.delivery_location}
                                  </CardDescription>
                                </div>
                                {getStatusBadge(order.order_status)}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <p>
                                  <strong>Transport Type:</strong>{" "}
                                  {order.transport_type}
                                </p>
                                <p>
                                  <strong>Total Cost:</strong> ₹
                                  {order.total_cost}
                                </p>
                                {order.cargo_weight && (
                                  <p>
                                    <strong>Cargo Weight:</strong>{" "}
                                    {order.cargo_weight} kg
                                  </p>
                                )}
                                {order.tracking_number && (
                                  <p>
                                    <strong>Tracking Number:</strong>{" "}
                                    {order.tracking_number}
                                  </p>
                                )}
                                {order.expected_delivery_date && (
                                  <p>
                                    <strong>Expected Delivery:</strong>{" "}
                                    {formatDate(order.expected_delivery_date)}
                                  </p>
                                )}
                                {order.actual_delivery_date && (
                                  <p>
                                    <strong>Actual Delivery:</strong>{" "}
                                    {formatDate(order.actual_delivery_date)}
                                  </p>
                                )}
                                <p>
                                  <strong>Payment Status:</strong>{" "}
                                  {order.payment_status || "Pending"}
                                </p>
                                <p>
                                  <strong>Created:</strong>{" "}
                                  {formatDate(order.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="ratings" className="mt-6">
                    <div className="space-y-4">
                      {ratings.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          No ratings found
                        </p>
                      ) : (
                        ratings.map((rating) => (
                          <Card
                            key={rating.id}
                            className="border border-gray-200"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">
                                    {rating.review_title ||
                                      "Transport Service Rating"}
                                  </CardTitle>
                                  <CardDescription>
                                    Overall Rating: {rating.rating}/5 stars
                                  </CardDescription>
                                </div>
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
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {rating.review_text && (
                                  <p>
                                    <strong>Review:</strong>{" "}
                                    {rating.review_text}
                                  </p>
                                )}
                                {rating.punctuality_rating && (
                                  <p>
                                    <strong>Punctuality:</strong>{" "}
                                    {rating.punctuality_rating}/5
                                  </p>
                                )}
                                {rating.safety_rating && (
                                  <p>
                                    <strong>Safety:</strong>{" "}
                                    {rating.safety_rating}/5
                                  </p>
                                )}
                                {rating.service_rating && (
                                  <p>
                                    <strong>Service:</strong>{" "}
                                    {rating.service_rating}/5
                                  </p>
                                )}
                                <p>
                                  <strong>Would Recommend:</strong>{" "}
                                  {rating.would_recommend ? "Yes" : "No"}
                                </p>
                                <p>
                                  <strong>Created:</strong>{" "}
                                  {formatDate(rating.created_at)}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
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
              {dialogType === "inquiry" && "Send Transport Inquiry"}
              {dialogType === "quotation" && "Request Transport Quotation"}
              {dialogType === "order" && "Place Transport Order"}
              {dialogType === "rating" && "Rate Transport Provider"}
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
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Input
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupLocation: e.target.value,
                      })
                    }
                    placeholder="Enter pickup location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryLocation">Delivery Location</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value,
                      })
                    }
                    placeholder="Enter delivery location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargoWeight">Cargo Weight (kg)</Label>
                  <Input
                    id="cargoWeight"
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cargoWeight: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter cargo weight"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transportType">Transport Type</Label>
                  <Input
                    id="transportType"
                    value={formData.transportType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transportType: e.target.value,
                      })
                    }
                    placeholder="Enter transport type"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Additional Details</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter additional requirements or details"
                    rows={3}
                  />
                </div>
              </>
            )}

            {(dialogType === "quotation" || dialogType === "order") && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="pickupLocation">Pickup Location</Label>
                  <Input
                    id="pickupLocation"
                    value={formData.pickupLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        pickupLocation: e.target.value,
                      })
                    }
                    placeholder="Enter pickup location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="deliveryLocation">Delivery Location</Label>
                  <Input
                    id="deliveryLocation"
                    value={formData.deliveryLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deliveryLocation: e.target.value,
                      })
                    }
                    placeholder="Enter delivery location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cargoWeight">Cargo Weight (kg)</Label>
                  <Input
                    id="cargoWeight"
                    type="number"
                    value={formData.cargoWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cargoWeight: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter cargo weight"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transportType">Transport Type</Label>
                  <Input
                    id="transportType"
                    value={formData.transportType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        transportType: e.target.value,
                      })
                    }
                    placeholder="Enter transport type"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="budgetMin">Budget Min (₹)</Label>
                    <Input
                      id="budgetMin"
                      type="number"
                      value={formData.budgetMin}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetMin: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Min budget"
                    />
                  </div>
                  <div>
                    <Label htmlFor="budgetMax">Budget Max (₹)</Label>
                    <Input
                      id="budgetMax"
                      type="number"
                      value={formData.budgetMax}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          budgetMax: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="Max budget"
                    />
                  </div>
                </div>
                {dialogType === "order" && (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="expectedPickupDate">
                        Expected Pickup Date
                      </Label>
                      <Input
                        id="expectedPickupDate"
                        type="date"
                        value={formData.expectedPickupDate}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            expectedPickupDate: e.target.value,
                          })
                        }
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
                  </>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="message">Additional Requirements</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder="Enter additional requirements or special instructions"
                    rows={3}
                  />
                </div>
              </>
            )}

            {dialogType === "rating" && (
              <>
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> You are rating based on your
                    completed order(s) with this provider.
                  </p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="reviewTitle">Review Title</Label>
                  <Input
                    id="reviewTitle"
                    value={formData.reviewTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, reviewTitle: e.target.value })
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
                  <Label htmlFor="comment">Review Comment</Label>
                  <Textarea
                    id="comment"
                    value={formData.comment}
                    onChange={(e) =>
                      setFormData({ ...formData, comment: e.target.value })
                    }
                    placeholder="Share your detailed experience with this transport provider"
                    rows={4}
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

export default TransportProvidersList;
