import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductInsert, ProductUpdate } from "@/services/productService";

const productCategories = [
  "Building Materials",
  "Clay Bricks",
  "Concrete Blocks",
  "Fly Ash Bricks",
  "AAC Blocks",
  "Cement",
  "Sand",
  "Aggregates",
  "Other",
];

const productSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Product name must be at least 2 characters" }),
  category: z.string().min(1, { message: "Please select a category" }),
  description: z.string().optional(),
  dimensions: z.string().optional(),
  price: z.coerce
    .number()
    .positive({ message: "Price must be a positive number" }),
  price_unit: z.string().default("per piece"),
  stock_quantity: z.coerce.number().int().nonnegative().optional(),
  is_available: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ProductInsert | ProductUpdate) => void;
  initialData?: ProductFormValues;
  isEditing?: boolean;
  manufacturerId: string;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  isEditing = false,
  manufacturerId,
}) => {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      category: "",
      description: "",
      dimensions: "",
      price: 0,
      price_unit: "per piece",
      stock_quantity: 0,
      is_available: true,
    },
  });

  // Add this effect to update form values when initialData changes
  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData]);

  const handleSubmit = (values: ProductFormValues) => {
    // Create product data with proper type handling
    const productData: ProductInsert | ProductUpdate = {
      name: values.name,
      category: values.category || null,
      description: values.description || null,
      dimensions: values.dimensions || null,
      price: values.price || null,
      price_unit: values.price_unit || null,
      stock_quantity: values.stock_quantity || null,
      is_available: values.is_available ?? true,
      manufacturer_id: manufacturerId,
    };
    onSubmit(productData);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        // If closing the form and there are unsaved changes, confirm with the user
        if (!newOpen && form.formState.isDirty) {
          if (
            window.confirm(
              "You have unsaved changes. Are you sure you want to close this form?",
            )
          ) {
            onOpenChange(newOpen);
            form.reset(); // Reset form when closing
          }
        } else {
          onOpenChange(newOpen);
          if (!newOpen) form.reset(); // Reset form when closing
        }
      }}
    >
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your product information below."
              : "Fill in the details to add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Red Clay Bricks" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {productCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dimensions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dimensions</FormLabel>
                    <FormControl>
                      <Input placeholder="230 x 110 x 70 mm" {...field} />
                    </FormControl>
                    <FormDescription>
                      Format: Length x Width x Height
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <FormControl>
                        <Input placeholder="per piece" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="stock_quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your product..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <FormDescription>
                      Set whether this product is active and visible to
                      customers
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (form.formState.isDirty) {
                    if (
                      window.confirm(
                        "You have unsaved changes. Are you sure you want to cancel?",
                      )
                    ) {
                      onOpenChange(false);
                    }
                  } else {
                    onOpenChange(false);
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></span>
                    {isEditing ? "Updating..." : "Adding..."}
                  </span>
                ) : isEditing ? (
                  "Update Product"
                ) : (
                  "Add Product"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
