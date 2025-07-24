import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  getManufacturerQuotationsWithDetails,
  updateQuotationStatus,
  type QuotationResponse,
} from "../../services/quotationService";
import {
  getManufacturerCoalQuotations,
  updateManufacturerCoalQuotationStatus,
} from "../../services/manufacturerCoalService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import CoalQuotationRequestForm from "./CoalQuotationRequestForm";
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

interface QuotationManagementProps {
  manufacturerId: string;
}

const QuotationManagement: React.FC<QuotationManagementProps> = ({
  manufacturerId,
}) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [coalQuotations, setCoalQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [coalLoading, setCoalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  const [selectedCoalQuotation, setSelectedCoalQuotation] = useState<any>(null);
  const [responseForm, setResponseForm] = useState<QuotationResponse>({
    response_message: "",
    response_quantity: 0,
    response_price: 0,
    offer_expiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0], // Default 7 days
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchQuotations();
    fetchCoalQuotations();

    // Set up periodic refresh to catch new quotation responses
    const interval = setInterval(() => {
      console.log(
        "Auto-refreshing coal quotations to check for new responses...",
      );
      fetchCoalQuotations(true); // Force refresh on interval
    }, 10000); // Refresh every 10 seconds for faster updates

    // Set up real-time subscription for coal quotations
    const coalQuotationsSubscription = supabase
      .channel(`manufacturer_coal_quotations_${manufacturerId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "manufacturer_coal_quotations",
          filter: `manufacturer_id=eq.${manufacturerId}`,
        },
        (payload) => {
          console.log("=== REAL-TIME COAL QUOTATION UPDATE ===");
          console.log("Payload:", payload);
          console.log("Event type:", payload.eventType);
          console.log("New data:", payload.new);
          console.log("Old data:", payload.old);
          console.log("Timestamp:", new Date().toISOString());

          // Immediately refresh coal quotations when there's any change
          console.log("Refreshing coal quotations due to real-time update");
          fetchCoalQuotations(true);
        },
      )
      .subscribe((status) => {
        console.log("Coal quotations subscription status:", status);
      });

    return () => {
      console.log("Cleaning up subscriptions and intervals");
      clearInterval(interval);
      coalQuotationsSubscription.unsubscribe();
    };
    // eslint-disable-next-line
  }, [manufacturerId]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getManufacturerQuotationsWithDetails(manufacturerId);
      setQuotations(data);
    } catch (err) {
      setError("Failed to fetch quotations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCoalQuotations = async (forceRefresh = false) => {
    setCoalLoading(true);
    try {
      console.log("=== FETCHING COAL QUOTATIONS FOR MANUFACTURER ===");
      console.log("Manufacturer ID:", manufacturerId);
      console.log("Force refresh:", forceRefresh);
      console.log("Timestamp:", new Date().toISOString());

      const data = await getManufacturerCoalQuotations(manufacturerId);

      console.log("Fetched coal quotations count:", data?.length || 0);
      console.log("Coal quotations data:", data);

      // Log quotations with status 'quoted' specifically
      const quotedQuotations = data?.filter((q) => q.status === "quoted") || [];
      const pendingQuotations =
        data?.filter((q) => q.status === "pending") || [];
      console.log("Quotations with 'quoted' status:", quotedQuotations.length);
      console.log(
        "Quotations with 'pending' status:",
        pendingQuotations.length,
      );
      console.log("Quoted quotations details:", quotedQuotations);

      // Log status distribution
      const statusCounts =
        data?.reduce((acc: any, q: any) => {
          acc[q.status] = (acc[q.status] || 0) + 1;
          return acc;
        }, {}) || {};
      console.log("Status distribution:", statusCounts);

      // Direct state update without clearing first to prevent race conditions
      setCoalQuotations(data || []);

      console.log("=== END FETCHING COAL QUOTATIONS ===");
    } catch (err) {
      console.error("Failed to fetch coal quotations:", err);
      setCoalQuotations([]);
    } finally {
      setCoalLoading(false);
    }
  };

  const handleStatusChange = async (quotationId: string, status: string) => {
    setActionLoading(quotationId + status);
    try {
      await updateQuotationStatus(quotationId, status);
      await fetchQuotations();
      toast({
        title: "Status Updated",
        description: `Quotation has been ${status}.`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update quotation status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenResponseDialog = (quotation: any) => {
    const todayStr = new Date().toISOString().split("T")[0];
    const defaultExpiry =
      quotation.offer_expiry &&
      new Date(quotation.offer_expiry) >= new Date(todayStr)
        ? quotation.offer_expiry
        : todayStr;
    setSelectedQuotation(quotation);
    setResponseForm({
      response_message: "",
      response_quantity: quotation.quantity,
      response_price: quotation.quoted_price,
      offer_expiry: defaultExpiry,
    });
    setResponseDialogOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!selectedQuotation) return;

    setActionLoading(selectedQuotation.id + "response");
    try {
      await updateQuotationStatus(
        selectedQuotation.id,
        "accepted",
        responseForm,
      );
      await fetchQuotations();
      setResponseDialogOpen(false);
      toast({
        title: "Response Sent",
        description: "Your response has been sent to the customer.",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send response.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCoalQuotationStatusChange = async (
    quotationId: string,
    status: string,
  ) => {
    setActionLoading(quotationId + status);
    try {
      console.log("Updating coal quotation status:", quotationId, "to", status);
      await updateManufacturerCoalQuotationStatus(quotationId, status);
      console.log("Status updated successfully, refreshing data...");
      await fetchCoalQuotations(true); // Force refresh
      toast({
        title: "Status Updated",
        description: `Coal quotation has been ${status}.`,
      });
    } catch (err) {
      console.error("Error updating coal quotation status:", err);
      toast({
        title: "Error",
        description: "Failed to update coal quotation status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewCoalQuotation = (quotation: any) => {
    setSelectedCoalQuotation(quotation);
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "destructive" | "outline" =
      "outline";
    let icon = <Clock className="h-3 w-3" />;

    switch (status?.toLowerCase()) {
      case "quoted":
      case "accepted":
        variant = "default";
        icon = <CheckCircle className="h-3 w-3" />;
        break;
      case "pending":
        variant = "secondary";
        icon = <Clock className="h-3 w-3" />;
        break;
      case "rejected":
        variant = "destructive";
        icon = <XCircle className="h-3 w-3" />;
        break;
    }

    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || "Unknown"}
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quotation Management</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              console.log("Manual refresh triggered");
              fetchCoalQuotations(true);
              fetchQuotations();
            }}
            disabled={coalLoading || loading}
            className="flex items-center gap-2"
          >
            <RefreshCw
              className={`h-4 w-4 ${coalLoading || loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <CoalQuotationRequestForm
            manufacturerId={manufacturerId}
            onQuotationCreated={() => fetchCoalQuotations(true)}
          />
        </div>
      </div>

      <Tabs defaultValue="coal-quotations" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger
            value="coal-quotations"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Coal Quotations ({coalQuotations.length})
          </TabsTrigger>
          <TabsTrigger
            value="product-quotations"
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Product Quotations ({quotations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="coal-quotations">
          <Card>
            <CardHeader>
              <CardTitle>Coal Quotations</CardTitle>
              <CardDescription>
                Manage your coal quotation requests and provider responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {coalLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
                </div>
              ) : coalQuotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No coal quotations found.</p>
                  <p className="text-sm mt-2">
                    Use the "Request Coal Quotation" button above to send
                    quotation requests to coal providers.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coalQuotations.map((quotation) => (
                    <Card key={quotation.id} className="border border-gray-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {quotation.coal_providers?.company_name ||
                                "Unknown Provider"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {quotation.coal_type} - {quotation.quantity}{" "}
                              {quotation.unit}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(quotation.status)}
                            <span className="text-xs text-gray-500">
                              {formatDate(quotation.created_at)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <p>
                              <strong>Provider:</strong>{" "}
                              {quotation.coal_providers?.name}
                            </p>
                            <p>
                              <strong>Phone:</strong>{" "}
                              {quotation.coal_providers?.phone}
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
                                Your Request:
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
                                    Provider Quotation:
                                  </span>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
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
                                    <div className="mt-3">
                                      <p className="text-sm">
                                        <strong>Additional Notes:</strong>{" "}
                                        {quotation.additional_notes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewCoalQuotation(quotation)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                          {quotation.status === "quoted" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                disabled={
                                  actionLoading === quotation.id + "accepted"
                                }
                                onClick={() =>
                                  handleCoalQuotationStatusChange(
                                    quotation.id,
                                    "accepted",
                                  )
                                }
                              >
                                {actionLoading === quotation.id + "accepted"
                                  ? "Accepting..."
                                  : "Accept"}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                disabled={
                                  actionLoading === quotation.id + "rejected"
                                }
                                onClick={() =>
                                  handleCoalQuotationStatusChange(
                                    quotation.id,
                                    "rejected",
                                  )
                                }
                              >
                                {actionLoading === quotation.id + "rejected"
                                  ? "Rejecting..."
                                  : "Reject"}
                              </Button>
                            </>
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

        <TabsContent value="product-quotations">
          <Card>
            <CardHeader>
              <CardTitle>Product Quotations</CardTitle>
              <CardDescription>
                Manage and respond to customer quotation requests for your
                products
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-600 py-8">{error}</div>
              ) : quotations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No product quotations found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Customer</th>
                        <th className="text-left py-3 px-4">Product</th>
                        <th className="text-left py-3 px-4">Category</th>
                        <th className="text-left py-3 px-4">Quantity</th>
                        <th className="text-left py-3 px-4">Quoted Price</th>
                        <th className="text-left py-3 px-4">Total</th>
                        <th className="text-left py-3 px-4">Message</th>
                        <th className="text-left py-3 px-4">Status</th>
                        <th className="text-left py-3 px-4">Created At</th>
                        <th className="text-left py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quotations.map((q) => (
                        <tr key={q.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="font-medium">
                              {q.endcustomers?.name || "-"}
                            </div>
                            <div className="text-xs text-gray-500">
                              {q.endcustomers?.email || ""}
                            </div>
                            <div className="text-xs text-gray-500">
                              {q.endcustomers?.phone || ""}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {q.products?.name || "-"}
                          </td>
                          <td className="py-3 px-4">
                            {q.products?.category || "-"}
                          </td>
                          <td className="py-3 px-4">{q.quantity}</td>
                          <td className="py-3 px-4">₹{q.quoted_price}</td>
                          <td className="py-3 px-4">₹{q.total_amount}</td>
                          <td className="py-3 px-4">{q.message || "-"}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-block px-2 py-1 text-xs rounded-full ${q.status === "pending" ? "bg-yellow-100 text-yellow-800" : q.status === "accepted" ? "bg-green-100 text-green-800" : q.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                            >
                              {q.status.charAt(0).toUpperCase() +
                                q.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {q.created_at
                              ? new Date(q.created_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4">
                            {q.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  onClick={() => handleOpenResponseDialog(q)}
                                >
                                  Respond
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={actionLoading === q.id + "rejected"}
                                  onClick={() =>
                                    handleStatusChange(q.id, "rejected")
                                  }
                                >
                                  {actionLoading === q.id + "rejected"
                                    ? "Rejecting..."
                                    : "Reject"}
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Respond to Quotation</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="response_message">Response Message</Label>
              <Textarea
                id="response_message"
                value={responseForm.response_message}
                onChange={(e) =>
                  setResponseForm({
                    ...responseForm,
                    response_message: e.target.value,
                  })
                }
                placeholder="Enter your response message..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response_quantity">Quantity</Label>
              <Input
                id="response_quantity"
                type="number"
                value={responseForm.response_quantity}
                onChange={(e) =>
                  setResponseForm({
                    ...responseForm,
                    response_quantity: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="response_price">Price per Unit (₹)</Label>
              <Input
                id="response_price"
                type="number"
                value={responseForm.response_price}
                onChange={(e) =>
                  setResponseForm({
                    ...responseForm,
                    response_price: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="offer_expiry">Offer Expiry Date</Label>
              <Input
                id="offer_expiry"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={responseForm.offer_expiry}
                onChange={(e) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  if (e.target.value < todayStr) {
                    setResponseForm({
                      ...responseForm,
                      offer_expiry: todayStr,
                    });
                  } else {
                    setResponseForm({
                      ...responseForm,
                      offer_expiry: e.target.value,
                    });
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={actionLoading === selectedQuotation?.id + "response"}
            >
              {actionLoading === selectedQuotation?.id + "response"
                ? "Sending..."
                : "Send Response"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Coal Quotation Details Dialog */}
      <Dialog
        open={!!selectedCoalQuotation}
        onOpenChange={(open) => {
          if (!open) setSelectedCoalQuotation(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Coal Quotation Details</DialogTitle>
          </DialogHeader>
          {selectedCoalQuotation && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Provider Information:</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <p>
                    <strong>Company:</strong>{" "}
                    {selectedCoalQuotation.coal_providers?.company_name}
                  </p>
                  <p>
                    <strong>Contact Person:</strong>{" "}
                    {selectedCoalQuotation.coal_providers?.name}
                  </p>
                  <p>
                    <strong>Phone:</strong>{" "}
                    {selectedCoalQuotation.coal_providers?.phone}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {selectedCoalQuotation.coal_providers?.email}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Quotation Details:</h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p>
                      <strong>Coal Type:</strong>{" "}
                      {selectedCoalQuotation.coal_type}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {getStatusBadge(selectedCoalQuotation.status)}
                    </p>
                    <p>
                      <strong>Quantity:</strong>{" "}
                      {selectedCoalQuotation.quantity}{" "}
                      {selectedCoalQuotation.unit}
                    </p>
                    <p>
                      <strong>Request Date:</strong>{" "}
                      {formatDate(selectedCoalQuotation.created_at)}
                    </p>
                  </div>

                  {selectedCoalQuotation.delivery_location && (
                    <p className="text-sm">
                      <strong>Delivery Location:</strong>{" "}
                      {selectedCoalQuotation.delivery_location}
                    </p>
                  )}

                  {selectedCoalQuotation.expected_delivery_date && (
                    <p className="text-sm">
                      <strong>Expected Delivery Date:</strong>{" "}
                      {formatDate(selectedCoalQuotation.expected_delivery_date)}
                    </p>
                  )}

                  {(selectedCoalQuotation.budget_range_min ||
                    selectedCoalQuotation.budget_range_max) && (
                    <p className="text-sm">
                      <strong>Budget Range:</strong> ₹
                      {selectedCoalQuotation.budget_range_min || 0} - ₹
                      {selectedCoalQuotation.budget_range_max || 0}
                    </p>
                  )}

                  {selectedCoalQuotation.message && (
                    <div>
                      <p className="text-sm font-medium mb-1">Your Message:</p>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedCoalQuotation.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedCoalQuotation.status === "quoted" &&
                selectedCoalQuotation.price_per_unit && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-green-800">
                        Provider Quotation
                      </h4>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <p>
                          <strong>Price per Unit:</strong> ₹
                          {selectedCoalQuotation.price_per_unit}
                        </p>
                        <p>
                          <strong>Total Amount:</strong> ₹
                          {selectedCoalQuotation.total_amount}
                        </p>
                        {selectedCoalQuotation.delivery_timeline && (
                          <p>
                            <strong>Delivery Timeline:</strong>{" "}
                            {selectedCoalQuotation.delivery_timeline}
                          </p>
                        )}
                        {selectedCoalQuotation.payment_terms && (
                          <p>
                            <strong>Payment Terms:</strong>{" "}
                            {selectedCoalQuotation.payment_terms}
                          </p>
                        )}
                      </div>
                      {selectedCoalQuotation.additional_notes && (
                        <div>
                          <p className="text-sm font-medium mb-1">
                            Additional Notes:
                          </p>
                          <p className="text-sm text-green-700">
                            {selectedCoalQuotation.additional_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedCoalQuotation(null)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuotationManagement;
