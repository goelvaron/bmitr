import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Star, 
  Package, 
  MessageSquare,
  ShoppingCart,
  Eye,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
}

interface ManufacturerLocation {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state: string;
  district?: string;
  pincode?: string;
}

interface Manufacturer {
  id: string;
  name: string;
  products: Product[];
  location: ManufacturerLocation;
  distance?: number;
  is_featured?: boolean;
}

interface MatchedProductsProps {
  manufacturers: Manufacturer[];
  isLoading: boolean;
  onClose: () => void;
  customerId: string | null;
}

const MatchedProducts: React.FC<MatchedProductsProps> = ({
  manufacturers,
  isLoading,
  onClose,
  customerId,
}) => {
  const { toast } = useToast();
  const [inquiryLoading, setInquiryLoading] = useState<string | null>(null);

  const handleSendInquiry = async (manufacturerId: string, productId: string) => {
    if (!customerId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to send inquiries.",
        variant: "destructive",
      });
      return;
    }

    setInquiryLoading(`${manufacturerId}-${productId}`);

    try {
      const { error } = await supabase.from("inquiries").insert({
        customer_id: customerId,
        manufacturer_id: manufacturerId,
        product_id: productId,
        message: "I am interested in this product. Please provide more details.",
        status: "pending",
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Inquiry Sent!",
        description: "Your inquiry has been sent to the manufacturer.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Error",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setInquiryLoading(null);
    }
  };

  const handleViewDetails = (manufacturerId: string) => {
    // Navigate to manufacturer details page
    window.open(`/manufacturer/${manufacturerId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-redFiredMustard-600" />
          <p className="text-redFiredMustard-700">Loading manufacturers...</p>
        </div>
      </div>
    );
  }

  if (manufacturers.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Manufacturers Found
        </h3>
        <p className="text-gray-500 mb-4">
          Try adjusting your search criteria or filters to find more results.
        </p>
        <Button
          onClick={onClose}
          variant="outline"
          className="border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
        >
          Clear Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {manufacturers.map((manufacturer) => (
          <Card 
            key={manufacturer.id} 
            className={`hover:shadow-lg transition-shadow duration-200 ${
              manufacturer.is_featured 
                ? 'ring-2 ring-redFiredMustard-400 bg-gradient-to-br from-redFiredMustard-50 to-white' 
                : 'hover:shadow-md'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-semibold text-redFiredMustard-800 line-clamp-2">
                  {manufacturer.name}
                </CardTitle>
                {manufacturer.is_featured && (
                  <Badge className="bg-redFiredMustard-600 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span className="line-clamp-1">
                  {manufacturer.location.city}, {manufacturer.location.state}
                </span>
                {manufacturer.distance && (
                  <span className="ml-2 text-redFiredMustard-600 font-medium">
                    {manufacturer.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Products */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Products ({manufacturer.products.length})
                </h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {manufacturer.products.slice(0, 3).map((product) => (
                    <div 
                      key={product.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm text-gray-800 line-clamp-1">
                          {product.name}
                        </h5>
                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                          {product.description}
                        </p>
                        {product.price > 0 && (
                          <p className="text-sm font-semibold text-redFiredMustard-600 mt-1">
                            ₹{product.price.toFixed(2)}
                          </p>
                        )}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2 border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                        onClick={() => handleSendInquiry(manufacturer.id, product.id)}
                        disabled={inquiryLoading === `${manufacturer.id}-${product.id}`}
                      >
                        {inquiryLoading === `${manufacturer.id}-${product.id}` ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <MessageSquare className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ))}
                  
                  {manufacturer.products.length > 3 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      +{manufacturer.products.length - 3} more products
                    </p>
                  )}
                </div>
              </div>

              {/* Location Details */}
              <div className="text-sm text-gray-600">
                <p className="line-clamp-2">
                  {manufacturer.location.address}
                </p>
                {manufacturer.location.pincode && (
                  <p className="mt-1">
                    PIN: {manufacturer.location.pincode}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
                  onClick={() => handleViewDetails(manufacturer.id)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View Details
                </Button>
                
                <Button
                  size="sm"
                  className="flex-1 bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
                  onClick={() => {
                    if (manufacturer.products.length > 0) {
                      handleSendInquiry(manufacturer.id, manufacturer.products[0].id);
                    }
                  }}
                  disabled={manufacturer.products.length === 0 || inquiryLoading !== null}
                >
                  {inquiryLoading ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4 mr-1" />
                  )}
                  Contact
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="text-center py-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {manufacturers.length} manufacturer{manufacturers.length !== 1 ? 's' : ''}
          {manufacturers.some(m => m.is_featured) && (
            <span className="ml-2 text-redFiredMustard-600">
              • {manufacturers.filter(m => m.is_featured).length} featured
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MatchedProducts;