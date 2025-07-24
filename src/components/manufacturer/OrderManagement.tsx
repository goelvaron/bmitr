import React, { useEffect, useState } from "react";
import {
  getManufacturerOrdersWithDetailsNoJoin,
  updateOrder,
} from "@/services/orderService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import type { OrderStatus } from "@/types/order";

interface OrderManagementProps {
  manufacturerId: string;
}

const OrderManagement: React.FC<OrderManagementProps> = ({
  manufacturerId,
}) => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const data =
          await getManufacturerOrdersWithDetailsNoJoin(manufacturerId);
        setOrders(data);
      } catch (err) {
        setError("Failed to fetch orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [manufacturerId]);

  const refreshOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getManufacturerOrdersWithDetailsNoJoin(manufacturerId);
      setOrders(data);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Status badge color mapping
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "returned":
        return "bg-gray-200 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Orders</CardTitle>
        <CardDescription>
          List of all orders placed for your products
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Customer Name</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created At</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.product_name || "-"}</td>
                    <td className="py-3 px-4">{order.customer_name || "-"}</td>
                    <td className="py-3 px-4">{order.contact_number || "-"}</td>
                    <td className="py-3 px-4">{order.quantity}</td>
                    <td className="py-3 px-4">₹{order.price}</td>
                    <td className="py-3 px-4">₹{order.total_amount}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(order.status)}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.created_at
                        ? new Date(order.created_at).toLocaleString()
                        : "-"}
                    </td>
                    <td className="py-3 px-4 flex flex-col gap-2 min-w-[180px]">
                      <Select
                        value={order.status}
                        onValueChange={async (newStatus) => {
                          if (newStatus === order.status) return;
                          setSavingId(order.id);
                          await updateOrder(order.id, {
                            status: newStatus as OrderStatus,
                          });
                          setSavingId(null);
                          await refreshOrders();
                        }}
                        disabled={savingId === order.id}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">
                            Processing (Accept)
                          </SelectItem>
                          <SelectItem value="shipped">
                            Shipped (In Transit)
                          </SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">
                            Cancelled (Reject)
                          </SelectItem>
                          <SelectItem value="returned">
                            Returned (Not Possible)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderManagement;
