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
import { PlusCircle, Pencil, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getManufacturerProducts,
  Product,
  createProduct,
  updateProduct,
  deleteProduct,
  ProductInsert,
  ProductUpdate,
} from "@/services/productService";
import ProductForm from "./ProductForm";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductManagementProps {
  manufacturerId: string;
}

const ProductManagement: React.FC<ProductManagementProps> = ({
  manufacturerId,
}) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [currentProductFormData, setCurrentProductFormData] =
    useState<any>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toast } = useToast();
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, [manufacturerId]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products for manufacturer ID:", manufacturerId);
      const { data, error } = await getManufacturerProducts(manufacturerId);
      if (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: `Failed to fetch products: ${error.message || "Please try again later"}`,
          variant: "destructive",
        });
        // Fallback to mock data if API fails
        const mockProducts = [
          {
            id: "1",
            name: "Red Clay Bricks",
            category: "Building Materials",
            price: 5.99,
            price_unit: "per piece",
            dimensions: "230 x 110 x 70 mm",
            is_available: true,
            manufacturer_id: manufacturerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: "Standard red clay bricks",
            image_url: null,
            stock_quantity: 1000,
          },
          {
            id: "2",
            name: "Fly Ash Bricks",
            category: "Building Materials",
            price: 7.5,
            price_unit: "per piece",
            dimensions: "230 x 110 x 70 mm",
            is_available: true,
            manufacturer_id: manufacturerId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            description: "Eco-friendly fly ash bricks",
            image_url: null,
            stock_quantity: 800,
          },
        ];
        setProducts(mockProducts);
      } else {
        console.log("Products fetched successfully:", data);
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Error in product fetch:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching products.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setIsEditing(false);
    setCurrentProduct(null);
    setIsProductFormOpen(true);
  };

  const handleEditProduct = (productId: string) => {
    const productToEdit = products.find((p) => p.id === productId);
    if (productToEdit) {
      setCurrentProduct(productToEdit);
      setCurrentProductFormData({
        name: productToEdit.name || "",
        category: productToEdit.category || "",
        description: productToEdit.description || "",
        dimensions: productToEdit.dimensions || "",
        price: productToEdit.price ?? 0,
        price_unit: productToEdit.price_unit || "per piece",
        stock_quantity: productToEdit.stock_quantity ?? 0,
        is_available: productToEdit.is_available ?? true,
      });
      setIsEditing(true);
      setIsProductFormOpen(true);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeleteLoading(true);
    try {
      console.log("Deleting product with ID:", productToDelete);
      const { success, error } = await deleteProduct(productToDelete);

      if (error) {
        console.error("Error deleting product:", error);
        toast({
          title: "Error",
          description: `Failed to delete product: ${error.message || "Unknown error"}`,
          variant: "destructive",
        });
      } else if (success) {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        fetchProducts(); // Refresh the product list
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the product",
        variant: "destructive",
      });
    } finally {
      setDeleteLoading(false);
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleViewProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    setViewProduct(product || null);
  };

  const handleProductSubmit = async (
    productData: ProductInsert | ProductUpdate,
  ) => {
    try {
      let data, error;
      const actionType = isEditing ? "update" : "add";

      // Show loading toast
      toast({
        title: `${actionType === "update" ? "Updating" : "Adding"} Product`,
        description: "Please wait...",
      });

      console.log(
        `${actionType === "update" ? "Updating" : "Adding"} product with data:`,
        productData,
      );

      if (isEditing && currentProduct) {
        // Update existing product
        const result = await updateProduct(
          currentProduct.id,
          productData as ProductUpdate,
        );
        data = result.data;
        error = result.error;
      } else {
        // Create new product
        const result = await createProduct({
          ...(productData as ProductInsert),
          manufacturer_id: manufacturerId,
        });
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error(`Error ${actionType}ing product:`, error);
        toast({
          title: "Error",
          description: `Failed to ${actionType} product: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log(`Product ${actionType}ed successfully:`, data);
        toast({
          title: "Success",
          description: `Product ${actionType === "update" ? "updated" : "added"} successfully`,
        });
        setIsProductFormOpen(false);
        setCurrentProduct(null);
        setIsEditing(false);
        fetchProducts(); // Refresh the product list
      }
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "submitting"} product:`,
        error,
      );
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Your Products</CardTitle>
          <CardDescription>Manage your product catalog</CardDescription>
        </div>
        <Button
          onClick={handleAddProduct}
          className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </CardHeader>

      {/* Product Form Dialog */}
      <ProductForm
        open={isProductFormOpen}
        onOpenChange={(open) => {
          setIsProductFormOpen(open);
          if (!open) {
            setCurrentProduct(null);
            setCurrentProductFormData(undefined);
            setIsEditing(false);
          }
        }}
        onSubmit={handleProductSubmit}
        initialData={isEditing ? currentProductFormData : undefined}
        isEditing={isEditing}
        manufacturerId={manufacturerId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              product from your catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteProduct}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!viewProduct}
        onOpenChange={(open) => {
          if (!open) setViewProduct(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {viewProduct && (
            <div className="space-y-2">
              <div>
                <strong>Name:</strong> {viewProduct.name}
              </div>
              <div>
                <strong>Category:</strong> {viewProduct.category}
              </div>
              <div>
                <strong>Dimensions:</strong>{" "}
                {viewProduct.dimensions || "Not specified"}
              </div>
              <div>
                <strong>Price:</strong> ₹{viewProduct.price}{" "}
                {viewProduct.price_unit}
              </div>
              <div>
                <strong>Status:</strong>{" "}
                {viewProduct.is_available ? "Active" : "Inactive"}
              </div>
              <div>
                <strong>Description:</strong> {viewProduct.description || "-"}
              </div>
              {viewProduct.stock_quantity !== undefined && (
                <div>
                  <strong>Stock Quantity:</strong> {viewProduct.stock_quantity}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProduct(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You haven't added any products yet.</p>
            <Button
              onClick={handleAddProduct}
              variant="outline"
              className="mt-4"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Dimensions</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{product.name}</td>
                    <td className="py-3 px-4">{product.category}</td>
                    <td className="py-3 px-4">
                      {product.dimensions || "Not specified"}
                    </td>
                    <td className="py-3 px-4">
                      ₹{product.price} {product.price_unit}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${product.is_available ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {product.is_available ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewProduct(product.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditProduct(product.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-gray-500">
          Showing {products.length} product(s)
        </p>
      </CardFooter>
    </Card>
  );
};

export default ProductManagement;
