import React, { useState, useEffect } from "react";
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
import {
  MapPin,
  Package,
  Factory,
  Truck,
  ShoppingCart,
  Check,
  MessageSquare,
  Star,
  StarHalf,
  Send,
  AlertCircle,
} from "lucide-react";
import type { Manufacturer, Product } from "@/services/productMatchingService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createInquiry } from "@/services/inquiryService";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { saveQuotation } from "../services/quotationService";
import { supabase } from "@/lib/supabase";

interface MatchedProductsProps {
  manufacturers: Manufacturer[];
  isLoading: boolean;
  onClose: () => void;
  customerId: string | null;
}

interface OrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  manufacturer: Manufacturer;
  customerId: string | null;
  onOrderSubmit: (
    quantity: number,
    deliveryAddress: string,
    contactNumber: string,
  ) => void;
}

interface InquiryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturer: Manufacturer;
  customerId: string | null;
  onInquirySubmit: (subject: string, message: string) => void;
}

interface RatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  manufacturer: Manufacturer;
  customerId: string | null;
  onRatingSubmit: (rating: number, comment: string) => void;
}

// Order Dialog Component
const OrderDialog: React.FC<OrderDialogProps> = ({
  isOpen,
  onClose,
  product,
  manufacturer,
  customerId,
  onOrderSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [deliveryAddress, setDeliveryAddress] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!deliveryAddress || !contactNumber) {
      alert("Please fill in all required fields");
      return;
    }

    if (!customerId) {
      alert("You must be logged in to place an order");
      return;
    }

    setIsSubmitting(true);
    try {
      // Call the actual API endpoint
      await onOrderSubmit(quantity, deliveryAddress, contactNumber);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting order:", error);
      setIsSubmitting(false);
      // Don't show alert, the parent component will handle the toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Order Product</DialogTitle>
          <DialogDescription>
            You are ordering {product.name} from {manufacturer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="product" className="text-right">
              Product
            </Label>
            <div id="product" className="col-span-3 font-medium">
              {product.name}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <div id="price" className="col-span-3">
              ₹{product.price}/piece
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <div id="total" className="col-span-3 font-bold">
              ₹{(product.price * quantity).toFixed(2)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deliveryAddress" className="text-right">
              Delivery Address*
            </Label>
            <Textarea
              id="deliveryAddress"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="col-span-3"
              placeholder="Enter your complete delivery address"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="contactNumber" className="text-right">
              Contact Number*
            </Label>
            <Input
              id="contactNumber"
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="col-span-3"
              placeholder="Enter your contact number"
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            className="bg-hotRed-600 hover:bg-hotRed-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Order Placed!
              </span>
            ) : (
              <span className="flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Place Order
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Inquiry Dialog Component
const InquiryDialog: React.FC<InquiryDialogProps> = ({
  isOpen,
  onClose,
  manufacturer,
  customerId,
  onInquirySubmit,
}) => {
  const [subject, setSubject] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!subject || !message) {
      alert("Please fill in all required fields");
      return;
    }

    if (!customerId) {
      alert("You must be logged in to send an inquiry");
      return;
    }

    setIsSubmitting(true);
    try {
      await onInquirySubmit(subject, message);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setIsSubmitting(false);
      // Don't show alert, the parent component will handle the toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Inquiry</DialogTitle>
          <DialogDescription>
            Send an inquiry to {manufacturer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subject" className="text-right">
              Subject*
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="col-span-3"
              placeholder="Enter subject"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message*
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              placeholder="Enter your message"
              rows={5}
              required
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            className="bg-hotRed-600 hover:bg-hotRed-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Sent!
              </span>
            ) : (
              <span className="flex items-center">
                <Send className="h-4 w-4 mr-2" />
                Send Inquiry
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Rating Dialog Component
const RatingDialog: React.FC<RatingDialogProps> = ({
  isOpen,
  onClose,
  manufacturer,
  customerId,
  onRatingSubmit,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!customerId) {
      alert("You must be logged in to submit a rating");
      return;
    }

    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating, comment);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      console.error("Error submitting rating:", error);
      setIsSubmitting(false);
      // Don't show alert, the parent component will handle the toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Manufacturer</DialogTitle>
          <DialogDescription>
            Rate your experience with {manufacturer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">
              Rating*
            </Label>
            <div className="col-span-3 flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-yellow-400 focus:outline-none"
                >
                  {star <= rating ? (
                    <Star className="h-6 w-6 fill-current" />
                  ) : (
                    <Star className="h-6 w-6" />
                  )}
                </button>
              ))}
              <span className="ml-2 text-gray-600">{rating} out of 5</span>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">
              Comment
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3"
              placeholder="Share your experience (optional)"
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            className="bg-hotRed-600 hover:bg-hotRed-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-2" />
                Submitted!
              </span>
            ) : (
              <span className="flex items-center">
                <Star className="h-4 w-4 mr-2" />
                Submit Rating
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Quotation Dialog Component
const QuotationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  manufacturer: Manufacturer;
  customerId: string | null;
  onQuotationSubmit: (
    quantity: number,
    quotedPrice: number,
    message: string,
  ) => void;
}> = ({
  isOpen,
  onClose,
  product,
  manufacturer,
  customerId,
  onQuotationSubmit,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [quotedPrice, setQuotedPrice] = useState<number>(product.price);
  const [message, setMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const total = quantity * quotedPrice;

  const handleSubmit = async () => {
    if (!quantity || !quotedPrice) {
      alert("Please fill in all required fields");
      return;
    }
    if (!customerId) {
      alert("You must be logged in to request a quote");
      return;
    }
    setIsSubmitting(true);
    try {
      await onQuotationSubmit(quantity, quotedPrice, message);
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      // Don't show alert, the parent component will handle the toast
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Quote</DialogTitle>
          <DialogDescription>
            Request a quote for {product.name} from {manufacturer.name}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quotedPrice" className="text-right">
              Quoted Price
            </Label>
            <Input
              id="quotedPrice"
              type="number"
              min="1"
              value={quotedPrice}
              onChange={(e) => setQuotedPrice(parseFloat(e.target.value) || 1)}
              className="col-span-3"
              placeholder="Enter your quoted price per piece"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="total" className="text-right">
              Total
            </Label>
            <div id="total" className="col-span-3 font-bold">
              ₹{total.toFixed(2)}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="message" className="text-right">
              Message
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="col-span-3"
              placeholder="Add a message (optional)"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || isSuccess}
            className="bg-hotRed-600 hover:bg-hotRed-700"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Sending...
              </span>
            ) : isSuccess ? (
              <span className="flex items-center">
                <Check className="h-4 w-4 mr-2" /> Sent!
              </span>
            ) : (
              <span className="flex items-center">
                <Truck className="h-4 w-4 mr-2" /> Request Quote
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const MatchedProducts: React.FC<MatchedProductsProps> = ({
  manufacturers,
  isLoading,
  onClose,
  customerId: propCustomerId,
}) => {
  const { toast } = useToast();
  const [orderDialogState, setOrderDialogState] = useState<{
    isOpen: boolean;
    product: Product | null;
    manufacturer: Manufacturer | null;
  }>({
    isOpen: false,
    product: null,
    manufacturer: null,
  });

  const [inquiryDialogState, setInquiryDialogState] = useState<{
    isOpen: boolean;
    manufacturer: Manufacturer | null;
  }>({
    isOpen: false,
    manufacturer: null,
  });

  const [ratingDialogState, setRatingDialogState] = useState<{
    isOpen: boolean;
    manufacturer: Manufacturer | null;
  }>({
    isOpen: false,
    manufacturer: null,
  });

  const [quotationDialogState, setQuotationDialogState] = useState<{
    isOpen: boolean;
    product: Product | null;
    manufacturer: Manufacturer | null;
  }>({
    isOpen: false,
    product: null,
    manufacturer: null,
  });

  // Use customer ID from props (passed from parent component)
  // This ensures we use the correct, current customer ID instead of potentially stale localStorage data
  const customerId = propCustomerId;

  // Debug logging to track customer ID usage
  useEffect(() => {
    console.log("🔍 [MATCHED PRODUCTS] Customer ID received:", customerId);
    console.log("🔍 [MATCHED PRODUCTS] Is authenticated:", !!customerId);
  }, [customerId]);

  const handleOrderClick = (product: Product, manufacturer: Manufacturer) => {
    console.log("🔍 [ORDER CLICK] Customer ID check:", customerId);
    if (!customerId) {
      console.log("🚨 [ORDER CLICK] No customer ID - showing auth prompt");
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and place orders, please proceed to authentication.",
        variant: "default",
      });
      return;
    }

    console.log(
      "✅ [ORDER CLICK] Customer authenticated, opening order dialog",
    );
    setOrderDialogState({
      isOpen: true,
      product,
      manufacturer,
    });
  };

  const handleInquiryClick = (manufacturer: Manufacturer) => {
    console.log("🔍 [INQUIRY CLICK] Customer ID check:", customerId);
    if (!customerId) {
      console.log("🚨 [INQUIRY CLICK] No customer ID - showing auth prompt");
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and send inquiries, please proceed to authentication.",
        variant: "default",
      });
      return;
    }

    console.log(
      "✅ [INQUIRY CLICK] Customer authenticated, opening inquiry dialog",
    );
    setInquiryDialogState({
      isOpen: true,
      manufacturer,
    });
  };

  const handleRatingClick = (manufacturer: Manufacturer) => {
    console.log("🔍 [RATING CLICK] Customer ID check:", customerId);
    if (!customerId) {
      console.log("🚨 [RATING CLICK] No customer ID - showing auth prompt");
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and submit ratings, please proceed to authentication.",
        variant: "default",
      });
      return;
    }

    console.log(
      "✅ [RATING CLICK] Customer authenticated, opening rating dialog",
    );
    setRatingDialogState({
      isOpen: true,
      manufacturer,
    });
  };

  const handleQuotationClick = (
    product: Product,
    manufacturer: Manufacturer,
  ) => {
    console.log("🔍 [QUOTATION CLICK] Customer ID check:", customerId);
    if (!customerId) {
      console.log("🚨 [QUOTATION CLICK] No customer ID - showing auth prompt");
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and request quotes, please proceed to authentication.",
        variant: "default",
      });
      return;
    }

    console.log(
      "✅ [QUOTATION CLICK] Customer authenticated, opening quotation dialog",
    );
    setQuotationDialogState({
      isOpen: true,
      product,
      manufacturer,
    });
  };

  const handleOrderSubmit = async (
    quantity: number,
    deliveryAddress: string,
    contactNumber: string,
  ) => {
    // Check authentication first and throw error if not authenticated
    console.log("🔍 [ORDER SUBMIT] Customer ID check:", customerId);
    if (!customerId) {
      console.log(
        "🚨 [ORDER SUBMIT] No customer ID - blocking order submission",
      );
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and place orders, please proceed to authentication.",
        variant: "default",
      });
      throw new Error("Authentication required");
    }

    // Check for required data
    if (!orderDialogState.product || !orderDialogState.manufacturer) {
      toast({
        title: "Error",
        description: "Product or manufacturer information is missing.",
        variant: "destructive",
      });
      throw new Error("Missing product or manufacturer information");
    }

    try {
      const product = orderDialogState.product;
      const manufacturer = orderDialogState.manufacturer;

      const orderData = {
        customer_id: customerId,
        manufacturer_id: manufacturer.id,
        product_id: product.id,
        quantity: quantity,
        price: product.price,
        total_amount: product.price * quantity,
        delivery_address: deliveryAddress,
        contact_number: contactNumber,
        status: "pending",
      };

      const { data: result, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Failed to save order: ${orderError.message}`);
      }

      if (result) {
        toast({
          title: "Order Placed Successfully",
          description: `Your order for ${quantity} units of ${product.name} has been placed.`,
          variant: "default",
          action: <ToastAction altText="View Orders">View Orders</ToastAction>,
        });

        console.log(
          `Order placed: ${quantity} units of ${product.name} from ${manufacturer.name}`,
          `Delivery Address: ${deliveryAddress}`,
          `Contact Number: ${contactNumber}`,
        );
      } else {
        throw new Error("Failed to save order");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleInquirySubmit = async (subject: string, message: string) => {
    console.log("🔍 [INQUIRY SUBMIT] Customer ID check:", customerId);
    if (!customerId) {
      console.log(
        "🚨 [INQUIRY SUBMIT] No customer ID - blocking inquiry submission",
      );
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and send inquiries, please proceed to authentication.",
        variant: "default",
      });
      throw new Error("Authentication required");
    }

    if (!inquiryDialogState.manufacturer) {
      toast({
        title: "Error",
        description: "Manufacturer information is missing.",
        variant: "destructive",
      });
      throw new Error("Missing manufacturer information");
    }

    try {
      const manufacturer = inquiryDialogState.manufacturer;

      const inquiryData = {
        customer_id: customerId,
        manufacturer_id: manufacturer.id,
        subject: subject,
        message: message,
        status: "pending",
      };

      const result = await createInquiry(inquiryData);
      const success = result.data && !result.error;

      if (success) {
        toast({
          title: "Inquiry Sent Successfully",
          description: `Your inquiry has been sent to ${manufacturer.name}.`,
          variant: "default",
        });

        console.log(
          `Inquiry sent to ${manufacturer.name}`,
          `Subject: ${subject}`,
          `Message: ${message}`,
        );
      } else {
        throw new Error("Failed to save inquiry");
      }
    } catch (error) {
      console.error("Error sending inquiry:", error);
      toast({
        title: "Inquiry Failed",
        description: "Failed to send inquiry. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleRatingSubmit = async (rating: number, comment: string) => {
    console.log("🔍 [RATING SUBMIT] Customer ID check:", customerId);
    if (!customerId) {
      console.log(
        "🚨 [RATING SUBMIT] No customer ID - blocking rating submission",
      );
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and submit ratings, please proceed to authentication.",
        variant: "default",
      });
      throw new Error("Authentication required");
    }

    if (!ratingDialogState.manufacturer) {
      toast({
        title: "Error",
        description: "Manufacturer information is missing.",
        variant: "destructive",
      });
      throw new Error("Missing manufacturer information");
    }

    try {
      const manufacturer = ratingDialogState.manufacturer;

      const ratingData = {
        customer_id: customerId,
        manufacturer_id: manufacturer.id,
        rating: rating,
        comment: comment,
      };

      const { data: result, error: ratingError } = await supabase
        .from("ratings")
        .insert(ratingData)
        .select()
        .single();

      if (ratingError) {
        throw new Error(`Failed to save rating: ${ratingError.message}`);
      }

      if (result) {
        toast({
          title: "Rating Submitted Successfully",
          description: `Your ${rating}-star rating for ${manufacturer.name} has been submitted.`,
          variant: "default",
        });

        console.log(
          `Rating submitted for ${manufacturer.name}`,
          `Rating: ${rating}`,
          `Comment: ${comment}`,
        );
      } else {
        throw new Error("Failed to save rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Rating Failed",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleQuotationSubmit = async (
    quantity: number,
    quotedPrice: number,
    message: string,
  ) => {
    console.log("🔍 [QUOTATION SUBMIT] Customer ID check:", customerId);
    if (!customerId) {
      console.log(
        "🚨 [QUOTATION SUBMIT] No customer ID - blocking quotation submission",
      );
      toast({
        title: "Please Register or Sign In",
        description:
          "To unlock more features and request quotes, please proceed to authentication.",
        variant: "default",
      });
      throw new Error("Authentication required");
    }

    if (!quotationDialogState.product || !quotationDialogState.manufacturer) {
      toast({
        title: "Error",
        description: "Product or manufacturer information is missing.",
        variant: "destructive",
      });
      throw new Error("Missing product or manufacturer information");
    }

    try {
      const product = quotationDialogState.product;
      const manufacturer = quotationDialogState.manufacturer;
      const quotationData = {
        customer_id: customerId,
        manufacturer_id: manufacturer.id,
        product_id: product.id,
        quantity,
        quoted_price: quotedPrice,
        total_amount: quotedPrice * quantity,
        message,
        status: "pending",
      };
      const result = await saveQuotation(quotationData);
      if (result) {
        toast({
          title: "Quotation Sent Successfully",
          description: `Your quotation request for ${quantity} units of ${product.name} has been sent to ${manufacturer.name}.`,
          variant: "default",
        });
      } else {
        throw new Error("Failed to save quotation");
      }
    } catch (error) {
      console.error("Error sending quotation:", error);
      toast({
        title: "Quotation Failed",
        description: "Failed to send quotation request. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hotRed-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium">Finding nearby manufacturers...</p>
      </div>
    );
  }

  // Add defensive checks for manufacturers data
  const safeManufacturers = Array.isArray(manufacturers) ? manufacturers : [];

  if (safeManufacturers.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="mb-4">
          <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-3" />
          <p className="text-lg font-medium mb-2">
            No manufacturers found in your area
          </p>
          <p className="text-gray-500 mb-4">
            We couldn't find any registered brick manufacturers near your
            location. This could be because:
          </p>
          <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>No manufacturers have registered in your area yet</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>Your location couldn't be determined accurately</span>
            </div>
            <div className="flex items-start">
              <span className="mr-2">•</span>
              <span>
                Manufacturers in your area are temporarily unavailable
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Try refreshing the page or contact our support team for assistance.
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="text-orange-600 border-orange-600"
            >
              Refresh Page
            </Button>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto p-2">
      {orderDialogState.isOpen &&
        orderDialogState.product &&
        orderDialogState.manufacturer && (
          <OrderDialog
            isOpen={orderDialogState.isOpen}
            onClose={() =>
              setOrderDialogState({
                isOpen: false,
                product: null,
                manufacturer: null,
              })
            }
            product={orderDialogState.product}
            manufacturer={orderDialogState.manufacturer}
            customerId={customerId}
            onOrderSubmit={handleOrderSubmit}
          />
        )}

      {inquiryDialogState.isOpen && inquiryDialogState.manufacturer && (
        <InquiryDialog
          isOpen={inquiryDialogState.isOpen}
          onClose={() =>
            setInquiryDialogState({
              isOpen: false,
              manufacturer: null,
            })
          }
          manufacturer={inquiryDialogState.manufacturer}
          customerId={customerId}
          onInquirySubmit={handleInquirySubmit}
        />
      )}

      {ratingDialogState.isOpen && ratingDialogState.manufacturer && (
        <RatingDialog
          isOpen={ratingDialogState.isOpen}
          onClose={() =>
            setRatingDialogState({
              isOpen: false,
              manufacturer: null,
            })
          }
          manufacturer={ratingDialogState.manufacturer}
          customerId={customerId}
          onRatingSubmit={handleRatingSubmit}
        />
      )}

      {quotationDialogState.isOpen &&
        quotationDialogState.product &&
        quotationDialogState.manufacturer && (
          <QuotationDialog
            isOpen={quotationDialogState.isOpen}
            onClose={() =>
              setQuotationDialogState({
                isOpen: false,
                product: null,
                manufacturer: null,
              })
            }
            product={quotationDialogState.product}
            manufacturer={quotationDialogState.manufacturer}
            customerId={customerId}
            onQuotationSubmit={handleQuotationSubmit}
          />
        )}

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-hotRed-700">
          Nearby Manufacturers
        </h2>
        <p className="text-gray-500">Based on your location</p>
      </div>

      {safeManufacturers.map((manufacturer) => (
        <Card
          key={manufacturer.id}
          className="shadow-md hover:shadow-lg transition-shadow"
        >
          <CardHeader className="bg-orange-50">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-hotRed-700">
                  {manufacturer.name}
                </CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  {manufacturer.location.city}, {manufacturer.location.state}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-white">
                {manufacturer.distance ? manufacturer.distance.toFixed(2) : "0"}{" "}
                km away
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center text-sm text-gray-500">
                <Factory className="h-4 w-4 mr-2" />
                {manufacturer.location.address}
              </div>

              <Separator />

              <h3 className="font-medium flex items-center">
                <Package className="h-4 w-4 mr-2" /> Available Products
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(manufacturer.products || []).map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-md p-3 hover:bg-orange-50 transition-colors"
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {product.description}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="font-bold text-hotRed-600">
                        ₹{product.price || 0}/piece
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-hotRed-600 hover:bg-hotRed-700"
                          onClick={() =>
                            handleOrderClick(product, manufacturer)
                          }
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" /> Order
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-hotRed-600 border-hotRed-600 ml-2"
                          onClick={() =>
                            handleQuotationClick(product, manufacturer)
                          }
                        >
                          <Truck className="h-3 w-3 mr-1" /> Request Quote
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-hotRed-600 border-hotRed-600"
                onClick={() => handleInquiryClick(manufacturer)}
              >
                <MessageSquare className="h-4 w-4 mr-2" /> Send Inquiry
              </Button>
              <Button
                variant="outline"
                className="text-yellow-600 border-yellow-600"
                onClick={() => handleRatingClick(manufacturer)}
              >
                <Star className="h-4 w-4 mr-2" /> Rate
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      <div className="flex justify-center pt-4">
        <Button onClick={onClose} variant="outline" className="mx-auto">
          Close
        </Button>
      </div>
    </div>
  );
};

export default MatchedProducts;
