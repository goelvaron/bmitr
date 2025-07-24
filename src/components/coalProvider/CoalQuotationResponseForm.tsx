import React, { useState } from "react";
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
import { useToast } from "@/components/ui/use-toast";
import { respondToCoalQuotationRequest } from "@/services/manufacturerCoalService";
import { FileText } from "lucide-react";

interface CoalQuotationResponseFormProps {
  quotation: any;
  onResponseSubmitted?: () => void;
}

const CoalQuotationResponseForm: React.FC<CoalQuotationResponseFormProps> = ({
  quotation,
  onResponseSubmitted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    price_per_unit: "",
    delivery_timeline: "",
    payment_terms: "",
    additional_notes: "",
    delivery_location: quotation?.delivery_location || "",
  });
  const { toast } = useToast();

  const calculateTotalAmount = () => {
    const pricePerUnit = parseFloat(formData.price_per_unit) || 0;
    const quantity = quotation?.quantity || 0;
    return pricePerUnit * quantity;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const responseData = {
        price_per_unit: parseFloat(formData.price_per_unit),
        total_amount: calculateTotalAmount(),
        delivery_timeline: formData.delivery_timeline || null,
        payment_terms: formData.payment_terms || null,
        additional_notes: formData.additional_notes || null,
        delivery_location: formData.delivery_location || null,
      };

      const result = await respondToCoalQuotationRequest(
        quotation.id,
        responseData,
      );

      if (result) {
        console.log("=== QUOTATION RESPONSE SENT SUCCESSFULLY ===");
        console.log("Quotation ID:", quotation.id);
        console.log("Response data sent:", responseData);
        console.log("Updated quotation result:", result);
        console.log("Status should now be 'quoted':", result.status);
        console.log("Timestamp:", new Date().toISOString());
        console.log("=== END QUOTATION RESPONSE ===");

        toast({
          title: "Success",
          description:
            "Quotation response sent to manufacturer successfully. The manufacturer will now see your quotation in their dashboard.",
        });
        setIsOpen(false);
        resetForm();
        onResponseSubmitted?.();
      } else {
        throw new Error("Failed to submit quotation response");
      }
    } catch (error) {
      console.error("Error submitting quotation response:", error);
      toast({
        title: "Error",
        description: "Failed to submit quotation response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      price_per_unit: "",
      delivery_timeline: "",
      payment_terms: "",
      additional_notes: "",
      delivery_location: quotation?.delivery_location || "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white">
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        disabled={quotation?.status !== "pending"}
      >
        <FileText className="h-4 w-4" />
        Send Quotation
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Send Coal Quotation</DialogTitle>
          </DialogHeader>

          {/* Quotation Request Details */}
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium mb-2">Quotation Request Details:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <p>
                <strong>Company:</strong>{" "}
                {quotation?.manufacturers?.company_name || "Unknown"}
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                {quotation?.manufacturers?.name || "Unknown"}
              </p>
              <p>
                <strong>Coal Type:</strong> {quotation?.coal_type || "Unknown"}
              </p>
              <p>
                <strong>Quantity:</strong> {quotation?.quantity || 0}{" "}
                {quotation?.unit || "units"}
              </p>
              {quotation?.delivery_location && (
                <p>
                  <strong>Delivery Location:</strong>{" "}
                  {quotation.delivery_location}
                </p>
              )}
              {quotation?.expected_delivery_date && (
                <p>
                  <strong>Expected Delivery:</strong>{" "}
                  {new Date(
                    quotation.expected_delivery_date,
                  ).toLocaleDateString()}
                </p>
              )}
              {(quotation?.budget_range_min || quotation?.budget_range_max) && (
                <p>
                  <strong>Budget Range:</strong> ₹
                  {quotation?.budget_range_min || 0} - ₹
                  {quotation?.budget_range_max || 0}
                </p>
              )}
            </div>
            {quotation?.message && (
              <div className="mt-3">
                <p className="text-sm">
                  <strong>Message:</strong> {quotation.message}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_per_unit">Price per Unit (₹) *</Label>
                <Input
                  id="price_per_unit"
                  type="number"
                  step="0.01"
                  value={formData.price_per_unit}
                  onChange={(e) =>
                    handleInputChange("price_per_unit", e.target.value)
                  }
                  placeholder="Enter price per unit"
                  required
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Amount (₹)</Label>
                <div className="p-2 bg-gray-100 rounded border text-lg font-semibold">
                  ₹{calculateTotalAmount().toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_timeline">Delivery Timeline</Label>
              <Input
                id="delivery_timeline"
                value={formData.delivery_timeline}
                onChange={(e) =>
                  handleInputChange("delivery_timeline", e.target.value)
                }
                placeholder="e.g., 7-10 business days"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_location">Delivery Location</Label>
              <Input
                id="delivery_location"
                value={formData.delivery_location}
                onChange={(e) =>
                  handleInputChange("delivery_location", e.target.value)
                }
                placeholder="Confirm or update delivery location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_terms">Payment Terms</Label>
              <Input
                id="payment_terms"
                value={formData.payment_terms}
                onChange={(e) =>
                  handleInputChange("payment_terms", e.target.value)
                }
                placeholder="e.g., 30% advance, 70% on delivery"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                value={formData.additional_notes}
                onChange={(e) =>
                  handleInputChange("additional_notes", e.target.value)
                }
                placeholder="Any additional terms, conditions, or specifications..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.price_per_unit}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Sending..." : "Send Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoalQuotationResponseForm;
