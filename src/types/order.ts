// Order status types
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

// Order interface
export interface Order {
  id: string;
  customer_id: string;
  manufacturer_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  delivery_address: string;
  contact_number: string;
  status: OrderStatus;
  tracking_number?: string;
  created_at: string;
  updated_at: string;
}

// Order creation interface
export interface OrderInsert {
  customer_id: string;
  manufacturer_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  delivery_address: string;
  contact_number: string;
  status?: OrderStatus;
  tracking_number?: string;
}

// Order update interface
export interface OrderUpdate {
  quantity?: number;
  delivery_address?: string;
  contact_number?: string;
  status?: OrderStatus;
  tracking_number?: string;
}

// Order with product and manufacturer details
export interface OrderWithDetails extends Order {
  product_name: string;
  product_description?: string;
  manufacturer_name: string;
}
