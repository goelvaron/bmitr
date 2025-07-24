import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
import {
  FileText,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Send,
  Truck,
  MapPin,
  Calendar,
  Package,
  DollarSign,
} from "lucide-react";

interface TransportInquiryManagementProps {
  transportProviderId: string;
}

interface TransportInquiry {
  id: string;
  manufacturer_id: string;
  pickup_location: string;
  delivery_location: string;
  cargo_weight?: number;
  cargo_volume?: number;
  transport_type?: string;
  expected_pickup_date?: string;
  expected_delivery_date?: string;
  budget_range_min?: number;
  budget_range_max?: number;
  message: string;
  status: string;
  created_at: string;
  updated_at?: string;
  manufacturers?: {
    name: string;
    company_name: string;
    email: string;
    phone: string;
  };
  products?: {
    name: string;
    category: string;
  };
}

interface QuotationResponse {
  base_charge: number;
  price_per_km?: number;
  total_estimated_cost: number;
  estimated_duration?: string;
  vehicle_type?: string;
  cargo_capacity?: number;
  payment_terms?: string;
  additional_notes?: string;
}

const TransportInquiryManagement: React.FC<TransportInquiryManagementProps> = ({
  transportProviderId,
}) => {
  const [inquiries, setInquiries] = useState<TransportInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] =
    useState<TransportInquiry | null>(null);
  const [responseForm, setResponseForm] = useState<QuotationResponse>({
    base_charge: 0,
    price_per_km: 0,
    total_estimated_cost: 0,
    estimated_duration: "",
    vehicle_type: "",
    cargo_capacity: 0,
    payment_terms: "",
    additional_notes: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInquiries();

    // Set up real-time subscription for transport inquiries
    const inquiriesSubscription = supabase
      .channel(`transport_inquiries_${transportProviderId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "manufacturer_transport_inquiries",
          filter: `transport_provider_id=eq.${transportProviderId}`,
        },
        (payload) => {
          console.log("Real-time transport inquiry update:", payload);
          fetchInquiries();
        },
      )
      .subscribe();

    return () => {
      inquiriesSubscription.unsubscribe();
    };
  }, [transportProviderId]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("manufacturer_transport_inquiries")
        .select(
          `
          *,
          manufacturers (
            name,
            company_name,
            email,
            phone
          ),
          products (
            name,
            category
          )
        `,
        )
        .eq("transport_provider_id", transportProviderId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching transport inquiries:", error);
        toast({
          title: "Error",
          description: "Failed to fetch transport inquiries.",
          variant: "destructive",
        });
        return;
      }

      setInquiries(data || []);
    } catch (err) {
      console.error("Exception fetching transport inquiries:", err);
      toast({
        title: "Error",
        description: "Failed to fetch transport inquiries.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResponseDialog = (inquiry: TransportInquiry) => {
    setSelectedInquiry(inquiry);
    setResponseForm({
      base_charge: 0,
      price_per_km: 0,
      total_estimated_cost: 0,
      estimated_duration: "",
      vehicle_type: "",
      cargo_capacity: 0,
      payment_terms: "",
      additional_notes: "",
    });
    setResponseDialogOpen(true);
  };

  const handleSubmitQuotation = async () => {
    if (!selectedInquiry) return;

    setActionLoading(selectedInquiry.id + "quotation");
    try {
      // Create quotation record
      const { data: quotationData, error: quotationError } = await supabase
        .from("manufacturer_transport_quotations")
        .insert({
          inquiry_id: selectedInquiry.id,
          manufacturer_id: selectedInquiry.manufacturer_id,
          transport_provider_id: transportProviderId,
          pickup_location: selectedInquiry.pickup_location,
          delivery_location: selectedInquiry.delivery_location,
          transport_type: selectedInquiry.transport_type || "road_transport",
          base_charge: responseForm.base_charge,
          price_per_km: responseForm.price_per_km,
          total_estimated_cost: responseForm.total_estimated_cost,
          estimated_duration: responseForm.estimated_duration,
          vehicle_type: responseForm.vehicle_type,
          cargo_capacity: responseForm.cargo_capacity,
          payment_terms: responseForm.payment_terms,
          additional_notes: responseForm.additional_notes,
          status: "pending",
          product_id: selectedInquiry.products ? null : null, // Will be handled if needed
        })
        .select()
        .single();

      if (quotationError) {
        throw quotationError;
      }

      // Update inquiry status to 'quoted'
      const { error: updateError } = await supabase
        .from("manufacturer_transport_inquiries")
        .update({ status: "quoted" })
        .eq("id", selectedInquiry.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Quotation Sent",
        description:
          "Your quotation has been sent to the manufacturer successfully.",
      });

      setResponseDialogOpen(false);
      fetchInquiries();
    } catch (err) {
      console.error("Error submitting quotation:", err);
      toast({
        title: "Error",
        description: "Failed to submit quotation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (inquiryId: string, status: string) => {
    setActionLoading(inquiryId + status);
    try {
      const { error } = await supabase
        .from("manufacturer_transport_inquiries")
        .update({ status })
        .eq("id", inquiryId);

      if (error) {
        throw error;
      }

      toast({
        title: "Status Updated",
        description: `Inquiry has been ${status}.`,
      });

      fetchInquiries();
    } catch (err) {
      console.error("Error updating inquiry status:", err);
      toast({
        title: "Error",
        description: "Failed to update inquiry status.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
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

  const calculateTotalCost = () => {
    const baseCharge = parseFloat(responseForm.base_charge?.toString() || "0");
    const pricePerKm = parseFloat(responseForm.price_per_km?.toString() || "0");
    // Assuming average distance of 100km if not specified
    const estimatedDistance = 100;
    return baseCharge + pricePerKm * estimatedDistance;
  };

  useEffect(() => {
    setResponseForm((prev) => ({
      ...prev,
      total_estimated_cost: calculateTotalCost(),
    }));
  }, [responseForm.base_charge, responseForm.price_per_km]);

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-orange-800">
                Transport Inquiry Management
              </CardTitle>
              <CardDescription>
                Manage transport inquiries and quotation requests from
                manufacturers
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchInquiries}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          ) : inquiries.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Truck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No transport inquiries found.</p>
              <p className="text-sm mt-2">
                Manufacturers will send transport inquiries that will appear
                here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inquiry) => (
                <Card key={inquiry.id} className="border border-gray-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {inquiry.manufacturers?.company_name ||
                            "Unknown Manufacturer"}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {inquiry.manufacturers?.name} •{" "}
                          {inquiry.manufacturers?.phone}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(inquiry.status)}
                        <span className="text-xs text-gray-500">
                          {formatDate(inquiry.created_at)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Route Information */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Route Details
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-700">
                              Pickup Location:
                            </p>
                            <p className="text-gray-600">
                              {inquiry.pickup_location}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700">
                              Delivery Location:
                            </p>
                            <p className="text-gray-600">
                              {inquiry.delivery_location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Cargo Information */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {inquiry.cargo_weight && (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">
                                Weight:
                              </p>
                              <p className="text-gray-600">
                                {inquiry.cargo_weight} kg
                              </p>
                            </div>
                          </div>
                        )}
                        {inquiry.cargo_volume && (
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">
                                Volume:
                              </p>
                              <p className="text-gray-600">
                                {inquiry.cargo_volume} m³
                              </p>
                            </div>
                          </div>
                        )}
                        {inquiry.transport_type && (
                          <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">Type:</p>
                              <p className="text-gray-600 capitalize">
                                {inquiry.transport_type.replace("_", " ")}
                              </p>
                            </div>
                          </div>
                        )}
                        {(inquiry.budget_range_min ||
                          inquiry.budget_range_max) && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <div>
                              <p className="font-medium text-gray-700">
                                Budget:
                              </p>
                              <p className="text-gray-600">
                                ₹{inquiry.budget_range_min || 0} - ₹
                                {inquiry.budget_range_max || 0}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Timeline */}
                      {(inquiry.expected_pickup_date ||
                        inquiry.expected_delivery_date) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {inquiry.expected_pickup_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-700">
                                  Expected Pickup:
                                </p>
                                <p className="text-gray-600">
                                  {formatDate(inquiry.expected_pickup_date)}
                                </p>
                              </div>
                            </div>
                          )}
                          {inquiry.expected_delivery_date && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="font-medium text-gray-700">
                                  Expected Delivery:
                                </p>
                                <p className="text-gray-600">
                                  {formatDate(inquiry.expected_delivery_date)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Message */}
                      {inquiry.message && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Message:
                          </p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {inquiry.message}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {inquiry.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                              onClick={() => handleOpenResponseDialog(inquiry)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Send Quotation
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={
                                actionLoading === inquiry.id + "rejected"
                              }
                              onClick={() =>
                                handleStatusChange(inquiry.id, "rejected")
                              }
                            >
                              {actionLoading === inquiry.id + "rejected"
                                ? "Rejecting..."
                                : "Decline"}
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Could implement detailed view dialog here
                            console.log(
                              "View details for inquiry:",
                              inquiry.id,
                            );
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quotation Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Transport Quotation</DialogTitle>
          </DialogHeader>

          {selectedInquiry && (
            <div className="space-y-4">
              {/* Inquiry Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Inquiry Summary:</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Route:</strong> {selectedInquiry.pickup_location} →{" "}
                    {selectedInquiry.delivery_location}
                  </p>
                  <p>
                    <strong>Manufacturer:</strong>{" "}
                    {selectedInquiry.manufacturers?.company_name}
                  </p>
                  {selectedInquiry.cargo_weight && (
                    <p>
                      <strong>Cargo Weight:</strong>{" "}
                      {selectedInquiry.cargo_weight} kg
                    </p>
                  )}
                </div>
              </div>

              {/* Quotation Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="base_charge">Base Charge (₹) *</Label>
                  <Input
                    id="base_charge"
                    type="number"
                    step="0.01"
                    value={responseForm.base_charge}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        base_charge: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter base charge"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_km">Price per KM (₹)</Label>
                  <Input
                    id="price_per_km"
                    type="number"
                    step="0.01"
                    value={responseForm.price_per_km}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        price_per_km: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Enter price per kilometer"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total Estimated Cost (₹)</Label>
                  <div className="p-2 bg-gray-100 rounded border text-lg font-semibold">
                    ₹{responseForm.total_estimated_cost.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimated_duration">Estimated Duration</Label>
                  <Input
                    id="estimated_duration"
                    value={responseForm.estimated_duration}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        estimated_duration: e.target.value,
                      }))
                    }
                    placeholder="e.g., 2-3 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Input
                    id="vehicle_type"
                    value={responseForm.vehicle_type}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        vehicle_type: e.target.value,
                      }))
                    }
                    placeholder="e.g., Truck, Trailer, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cargo_capacity">Cargo Capacity (kg)</Label>
                  <Input
                    id="cargo_capacity"
                    type="number"
                    value={responseForm.cargo_capacity}
                    onChange={(e) =>
                      setResponseForm((prev) => ({
                        ...prev,
                        cargo_capacity: parseFloat(e.target.value) || 0,
                      }))
                    }
                    placeholder="Maximum cargo capacity"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payment_terms">Payment Terms</Label>
                <Input
                  id="payment_terms"
                  value={responseForm.payment_terms}
                  onChange={(e) =>
                    setResponseForm((prev) => ({
                      ...prev,
                      payment_terms: e.target.value,
                    }))
                  }
                  placeholder="e.g., 50% advance, 50% on delivery"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional_notes">Additional Notes</Label>
                <Textarea
                  id="additional_notes"
                  value={responseForm.additional_notes}
                  onChange={(e) =>
                    setResponseForm((prev) => ({
                      ...prev,
                      additional_notes: e.target.value,
                    }))
                  }
                  placeholder="Any additional terms, conditions, or information..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setResponseDialogOpen(false)}
              disabled={actionLoading === selectedInquiry?.id + "quotation"}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitQuotation}
              disabled={
                actionLoading === selectedInquiry?.id + "quotation" ||
                !responseForm.base_charge
              }
              className="bg-orange-600 hover:bg-orange-700"
            >
              {actionLoading === selectedInquiry?.id + "quotation"
                ? "Sending..."
                : "Send Quotation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TransportInquiryManagement;
