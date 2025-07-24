import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { createManufacturerCoalQuotationRequest } from "@/services/manufacturerCoalService";
import { Plus } from "lucide-react";

interface CoalQuotationRequestFormProps {
  manufacturerId: string;
  onQuotationCreated?: () => void;
}

interface CoalProvider {
  id: string;
  company_name: string;
  name: string;
  fuel_types: string[] | null;
  city: string;
  state: string;
}

const CoalQuotationRequestForm: React.FC<CoalQuotationRequestFormProps> = ({
  manufacturerId,
  onQuotationCreated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [coalProviders, setCoalProviders] = useState<CoalProvider[]>([]);
  const [formData, setFormData] = useState({
    coal_provider_id: "",
    coal_type: "",
    quantity: "",
    unit: "tons",
    delivery_location: "",
    expected_delivery_date: "",
    budget_range_min: "",
    budget_range_max: "",
    message: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchCoalProviders();
    }
  }, [isOpen]);

  const fetchCoalProviders = async () => {
    try {
      const { data, error } = await supabase
        .from("coal_providers")
        .select("id, company_name, name, fuel_types, city, state")
        .order("company_name");

      if (error) {
        console.error("Error fetching coal providers:", error);
        return;
      }

      setCoalProviders(data || []);
    } catch (err) {
      console.error("Exception fetching coal providers:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const quotationData = {
        manufacturer_id: manufacturerId,
        coal_provider_id: formData.coal_provider_id,
        coal_type: formData.coal_type,
        quantity: parseInt(formData.quantity),
        unit: formData.unit,
        delivery_location: formData.delivery_location || null,
        expected_delivery_date: formData.expected_delivery_date || null,
        budget_range_min: formData.budget_range_min
          ? parseFloat(formData.budget_range_min)
          : null,
        budget_range_max: formData.budget_range_max
          ? parseFloat(formData.budget_range_max)
          : null,
        message: formData.message || null,
      };

      const result = await createManufacturerCoalQuotationRequest({
        manufacturer_id: quotationData.manufacturer_id,
        coal_provider_id: quotationData.coal_provider_id,
        coal_type: quotationData.coal_type,
        quantity: quotationData.quantity,
        unit: quotationData.unit,
        price_per_unit: 0, // Default value, will be filled by provider
        total_amount: 0, // Default value, will be calculated by provider
        delivery_location: quotationData.delivery_location,
        payment_terms: null,
        additional_notes: quotationData.message,
      });

      if (result) {
        toast({
          title: "Success",
          description: "Quotation request sent to coal provider successfully.",
        });
        setIsOpen(false);
        resetForm();
        onQuotationCreated?.();
      } else {
        throw new Error("Failed to create quotation request");
      }
    } catch (error) {
      console.error("Error creating quotation request:", error);
      toast({
        title: "Error",
        description: "Failed to send quotation request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      coal_provider_id: "",
      coal_type: "",
      quantity: "",
      unit: "tons",
      delivery_location: "",
      expected_delivery_date: "",
      budget_range_min: "",
      budget_range_max: "",
      message: "",
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 hover:bg-orange-700 flex items-center gap-2"
      >
        <Plus className="h-4 w-4" />
        Request Coal Quotation
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Coal Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="coal_provider">Coal Provider *</Label>
                <Select
                  value={formData.coal_provider_id}
                  onValueChange={(value) =>
                    handleInputChange("coal_provider_id", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coal provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {coalProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.company_name} - {provider.city},{" "}
                        {provider.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coal_type">Coal Type *</Label>
                <Select
                  value={formData.coal_type}
                  onValueChange={(value) =>
                    handleInputChange("coal_type", value)
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select coal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bituminous">Bituminous Coal</SelectItem>
                    <SelectItem value="anthracite">Anthracite Coal</SelectItem>
                    <SelectItem value="lignite">Lignite Coal</SelectItem>
                    <SelectItem value="sub-bituminous">
                      Sub-bituminous Coal
                    </SelectItem>
                    <SelectItem value="coking">Coking Coal</SelectItem>
                    <SelectItem value="thermal">Thermal Coal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) =>
                    handleInputChange("quantity", e.target.value)
                  }
                  placeholder="Enter quantity"
                  required
                  min="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => handleInputChange("unit", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tons">Tons</SelectItem>
                    <SelectItem value="kg">Kilograms</SelectItem>
                    <SelectItem value="quintals">Quintals</SelectItem>
                    <SelectItem value="truckload">Truckload</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="delivery_location">Delivery Location</Label>
              <Input
                id="delivery_location"
                value={formData.delivery_location}
                onChange={(e) =>
                  handleInputChange("delivery_location", e.target.value)
                }
                placeholder="Enter delivery location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected_delivery_date">
                Expected Delivery Date
              </Label>
              <Input
                id="expected_delivery_date"
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) =>
                  handleInputChange("expected_delivery_date", e.target.value)
                }
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget_range_min">Budget Range Min (₹)</Label>
                <Input
                  id="budget_range_min"
                  type="number"
                  value={formData.budget_range_min}
                  onChange={(e) =>
                    handleInputChange("budget_range_min", e.target.value)
                  }
                  placeholder="Minimum budget"
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget_range_max">Budget Range Max (₹)</Label>
                <Input
                  id="budget_range_max"
                  type="number"
                  value={formData.budget_range_max}
                  onChange={(e) =>
                    handleInputChange("budget_range_max", e.target.value)
                  }
                  placeholder="Maximum budget"
                  min="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Additional Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Any additional requirements or specifications..."
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
                disabled={
                  loading ||
                  !formData.coal_provider_id ||
                  !formData.coal_type ||
                  !formData.quantity
                }
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? "Sending..." : "Send Quotation Request"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoalQuotationRequestForm;
