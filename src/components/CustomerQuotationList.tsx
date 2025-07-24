import React, { useEffect, useState } from "react";
import { getCustomerQuotationsWithDetails } from "@/services/quotationService";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CustomerQuotationListProps {
  customerId: string;
  onPlaceOrder: (quotation: any) => void;
}

const CustomerQuotationList: React.FC<CustomerQuotationListProps> = ({
  customerId,
  onPlaceOrder,
}) => {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuotations();
  }, [customerId]);

  const fetchQuotations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCustomerQuotationsWithDetails(customerId);
      setQuotations(data);
    } catch (err) {
      setError("Failed to fetch quotations. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Quotations</CardTitle>
        <CardDescription>
          View and manage your quotation requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8">{error}</div>
        ) : quotations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No quotations found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Manufacturer</th>
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Quantity</th>
                  <th className="text-left py-3 px-4">Quoted Price</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Message</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created At</th>
                  <th className="text-left py-3 px-4">Response</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {quotations.map((q) => (
                  <tr key={q.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">
                        {q.manufacturers?.name ||
                          q.manufacturers?.company_name ||
                          "-"}
                      </div>
                    </td>
                    <td className="py-3 px-4">{q.products?.name || "-"}</td>
                    <td className="py-3 px-4">{q.products?.category || "-"}</td>
                    <td className="py-3 px-4">{q.quantity}</td>
                    <td className="py-3 px-4">₹{q.quoted_price}</td>
                    <td className="py-3 px-4">₹{q.total_amount}</td>
                    <td className="py-3 px-4">{q.message || "-"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${q.status === "pending" ? "bg-yellow-100 text-yellow-800" : q.status === "accepted" ? "bg-green-100 text-green-800" : q.status === "rejected" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {q.created_at ? formatDate(q.created_at) : "-"}
                    </td>
                    <td className="py-3 px-4">
                      {q.status === "accepted" && (
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Response:</span>{" "}
                            {q.response_message}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Quantity:</span>{" "}
                            {q.response_quantity}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Price:</span> ₹
                            {q.response_price}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Expires:</span>{" "}
                            {q.offer_expiry ? formatDate(q.offer_expiry) : "-"}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {q.status === "accepted" &&
                        (() => {
                          const isOfferExpired =
                            q.offer_expiry &&
                            new Date(q.offer_expiry) < new Date();
                          if (isOfferExpired) {
                            return (
                              <div className="text-red-600 font-medium text-sm">
                                Offer expired
                              </div>
                            );
                          }
                          return (
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() =>
                                onPlaceOrder({
                                  ...q,
                                  manufacturer_name:
                                    q.manufacturers?.company_name ||
                                    q.manufacturers?.name ||
                                    "-",
                                  product_name: q.products?.name || "-",
                                })
                              }
                            >
                              Place Order
                            </Button>
                          );
                        })()}
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

export default CustomerQuotationList;
