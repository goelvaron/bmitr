import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PlaceOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quotation: any;
  onConfirm: (address: string, contact: string) => void;
  onCancel?: () => void;
  initialAddress?: string;
  initialContact?: string;
  customerId?: string;
}

const PlaceOrderDialog: React.FC<PlaceOrderDialogProps> = ({
  open,
  onOpenChange,
  quotation,
  onConfirm,
  onCancel,
  initialAddress = "",
  initialContact = "",
  customerId,
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [contact, setContact] = useState(initialContact);

  useEffect(() => {
    setAddress(initialAddress);
    setContact(initialContact);
  }, [initialAddress, initialContact, open]);

  if (!quotation) return null;
  const {
    product_name,
    quantity,
    quoted_price,
    manufacturer_name,
    message,
    total,
    status,
  } = quotation;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Your Order</DialogTitle>
          <DialogDescription>
            Please review the details below and confirm your order.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div>
            <strong>Manufacturer:</strong> {manufacturer_name}
          </div>
          <div>
            <strong>Product:</strong> {product_name}
          </div>
          <div>
            <strong>Quantity:</strong> {quantity}
          </div>
          <div>
            <strong>Quoted Price:</strong> ₹{quoted_price}
          </div>
          <div>
            <strong>Total:</strong> ₹{total || quoted_price * quantity}
          </div>
          {message && (
            <div>
              <strong>Message:</strong> {message}
            </div>
          )}
        </div>
        <div className="space-y-2 mt-4">
          <label className="block text-sm font-medium">Delivery Address</label>
          <Input
            type="text"
            placeholder="Enter delivery address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <label className="block text-sm font-medium mt-2">
            Contact Number
          </label>
          <Input
            type="text"
            placeholder="Enter contact number"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            className="bg-hotRed-600 hover:bg-hotRed-700"
            onClick={() => onConfirm(address, contact)}
          >
            Confirm Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceOrderDialog;
