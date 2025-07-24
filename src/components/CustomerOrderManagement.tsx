import React, { useEffect, useState } from "react";
import {
  getCustomerOrders,
  updateOrder,
  cancelOrder,
  getOrderWithDetails,
} from "@/services/orderService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomerOrderManagementProps {
  customerId: string;
}

type EditableOrder = {
  id: string;
  product_name: string;
  manufacturer_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  delivery_address: string;
  contact_number: string;
  status: string;
  created_at: string;
};

const CustomerOrderManagement: React.FC<CustomerOrderManagementProps> = ({
  customerId,
}) => {
  const [orders, setOrders] = useState<EditableOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [editFields, setEditFields] = useState<Partial<EditableOrder>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [customerId]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const rawOrders = await getCustomerOrders(customerId);
      // Fetch product/manufacturer info for each order
      const detailedOrders = await Promise.all(
        rawOrders.map(async (order) => {
          const details = await getOrderWithDetails(order.id);
          return {
            id: order.id,
            product_name: details?.product_name || "-",
            manufacturer_name: details?.manufacturer_name || "-",
            quantity: order.quantity,
            price: order.price,
            total_amount: order.total_amount,
            delivery_address: order.delivery_address,
            contact_number: order.contact_number,
            status: order.status,
            created_at: order.created_at,
          };
        }),
      );
      setOrders(detailedOrders);
    } catch (err) {
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order: EditableOrder) => {
    setEditOrderId(order.id);
    setEditFields({
      quantity: order.quantity,
      delivery_address: order.delivery_address,
      contact_number: order.contact_number,
    });
  };

  const handleEditFieldChange = (field: keyof EditableOrder, value: any) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (order: EditableOrder) => {
    setSaving(true);
    try {
      const updates: any = {
        quantity: editFields.quantity,
        delivery_address: editFields.delivery_address,
        contact_number: editFields.contact_number,
      };
      await updateOrder(order.id, updates);
      setEditOrderId(null);
      setEditFields({});
      fetchOrders();
    } catch (err) {
      alert("Failed to update order. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setSaving(true);
    try {
      await cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      alert("Failed to cancel order. Please try again.");
    } finally {
      setSaving(false);
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
          Manage your orders: edit or cancel if pending
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
                  <th className="text-left py-3 px-4">Manufacturer</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Address</th>
                  <th className="text-left py-3 px-4">Contact</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created At</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{order.id}</td>
                    <td className="py-3 px-4">{order.product_name}</td>
                    <td className="py-3 px-4">{order.manufacturer_name}</td>
                    <td className="py-3 px-4">
                      {editOrderId === order.id ? (
                        <Input
                          type="number"
                          min={1}
                          value={editFields.quantity ?? order.quantity}
                          onChange={(e) =>
                            handleEditFieldChange(
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-20"
                        />
                      ) : (
                        order.quantity
                      )}
                    </td>
                    <td className="py-3 px-4">₹{order.price}</td>
                    <td className="py-3 px-4">₹{order.total_amount}</td>
                    <td className="py-3 px-4">
                      {editOrderId === order.id ? (
                        <Input
                          value={
                            editFields.delivery_address ??
                            order.delivery_address
                          }
                          onChange={(e) =>
                            handleEditFieldChange(
                              "delivery_address",
                              e.target.value,
                            )
                          }
                          className="w-40"
                        />
                      ) : (
                        order.delivery_address
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {editOrderId === order.id ? (
                        <Input
                          value={
                            editFields.contact_number ?? order.contact_number
                          }
                          onChange={(e) =>
                            handleEditFieldChange(
                              "contact_number",
                              e.target.value,
                            )
                          }
                          className="w-32"
                        />
                      ) : (
                        order.contact_number
                      )}
                    </td>
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
                    <td className="py-3 px-4 flex justify-between flex-col gap-2">
                      {order.status === "pending" &&
                        (editOrderId === order.id ? (
                          <>
                            <Button
                              size="sm"
                              className="w-full mr-2 bg-hotRed-600 hover:bg-hotRed-700 text-white"
                              onClick={() => handleSave(order)}
                              disabled={saving}
                            >
                              Save Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditOrderId(null)}
                              disabled={saving}
                            >
                              Cancel Order
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              className="w-full mr-2 bg-hotRed-600 hover:bg-hotRed-700 text-white"
                              onClick={() => handleEdit(order)}
                              disabled={saving}
                            >
                              Edit Order
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(order.id)}
                              disabled={saving}
                            >
                              Cancel Order
                            </Button>
                          </>
                        ))}
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

export default CustomerOrderManagement;
