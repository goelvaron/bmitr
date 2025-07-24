import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Package, Factory, Truck, ArrowLeft, Star } from "lucide-react";
import {
  getProductById,
  getManufacturerById,
  type Product,
  type Manufacturer,
} from "@/services/productMatchingService";

interface ProductDetailPageProps {
  productId: string;
  onBack?: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack = () => {},
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);
        const foundProduct = await getProductById(productId);

        if (!foundProduct) {
          setError("Product not found");
          setLoading(false);
          return;
        }

        setProduct(foundProduct);

        // Find the manufacturer that has this product
        for (const mfr of manufacturer ? [manufacturer] : []) {
          if (mfr.products.some((p) => p.id === productId)) {
            setManufacturer(mfr);
            break;
          }
        }

        // If we don't have the manufacturer yet, we need to find it
        if (!manufacturer) {
          // This is a simplified approach - in a real app, you might want to
          // have a more direct way to get the manufacturer for a product
          const allManufacturers = [];
          for (const mfr of allManufacturers) {
            if (mfr.products.some((p) => p.id === productId)) {
              setManufacturer(mfr);
              break;
            }
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details");
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotRed-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-4 text-center">
        <p className="text-lg font-medium text-red-500 mb-4">
          {error || "Product not found"}
        </p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-4 rounded-lg shadow-lg">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-4 hover:bg-redFiredMustard-50"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Products
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Image */}
        <div className="bg-redFiredMustard-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-80 object-contain"
            />
          ) : (
            <Package className="h-40 w-40 text-gray-300" />
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-2xl font-bold text-hotRed-700">{product.name}</h1>

          <div className="flex items-center mt-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-5 w-5 text-yellow-400 fill-current"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-2">(25 reviews)</span>
          </div>

          <div className="text-2xl font-bold text-hotRed-600 mb-4">
            ₹{product.price}/piece
          </div>

          <p className="text-gray-700 mb-6">{product.description}</p>

          <div className="space-y-4">
            <Button className="w-full bg-hotRed-600 hover:bg-hotRed-700">
              Add to Cart
            </Button>

            <Button
              variant="outline"
              className="w-full border-hotRed-600 text-hotRed-600 hover:bg-hotRed-50"
            >
              <Truck className="h-4 w-4 mr-2" /> Request Quote
            </Button>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Product Details */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold">Product Specifications</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700">Dimensions</h3>
            <p className="text-gray-600">9" x 4" x 3"</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700">Material</h3>
            <p className="text-gray-600">Clay</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700">Weight</h3>
            <p className="text-gray-600">2.5 kg</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="font-medium text-gray-700">Color</h3>
            <p className="text-gray-600">Red</p>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Manufacturer Info */}
      {manufacturer && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Manufacturer Information</h2>

          <Card className="shadow-sm">
            <CardHeader className="bg-redFiredMustard-50">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg text-hotRed-700">
                    {manufacturer.name}
                  </CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {manufacturer.location.city}, {manufacturer.location.state}
                  </CardDescription>
                </div>
                {manufacturer.distance && (
                  <Badge variant="outline" className="bg-white">
                    {manufacturer.distance.toFixed(2)} km away
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center text-sm text-gray-500">
                <Factory className="h-4 w-4 mr-2" />
                {manufacturer.location.address}
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50">
              <Button className="bg-hotRed-600 hover:bg-hotRed-700 w-full">
                Contact Supplier
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      <Separator className="my-8" />

      {/* Related Products */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Related Products</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {manufacturer?.products
            .filter((p) => p.id !== product.id)
            .slice(0, 3)
            .map((relatedProduct) => (
              <Card
                key={relatedProduct.id}
                className="hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-redFiredMustard-50 flex items-center justify-center">
                  {relatedProduct.imageUrl ? (
                    <img
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      className="max-h-32 object-contain"
                    />
                  ) : (
                    <Package className="h-20 w-20 text-gray-300" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {relatedProduct.description}
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="font-bold text-hotRed-600">
                      ₹{relatedProduct.price}/piece
                    </span>
                    <Button
                      size="sm"
                      className="bg-hotRed-600 hover:bg-hotRed-700"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
