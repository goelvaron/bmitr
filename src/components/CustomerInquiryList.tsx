import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomerInquiryListProps {
  customerId: string;
}

interface Inquiry {
  id: string;
  manufacturer_name: string;
  manufacturer_phone: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  reply?: string;
  reply_by?: string | null;
  reply_at?: string | null;
}

const CustomerInquiryList: React.FC<CustomerInquiryListProps> = ({
  customerId,
}) => {
  const [loading, setLoading] = useState(true);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);

  useEffect(() => {
    fetchInquiries();
    // eslint-disable-next-line
  }, [customerId]);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      // Fetch all inquiries for this customer (no join)
      const { data: inquiries, error } = await supabase
        .from("inquiries")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Fetch all manufacturers referenced in these inquiries
      const manufacturerIds = [
        ...new Set(
          (inquiries || []).map((i) => i.manufacturer_id).filter(Boolean),
        ),
      ];
      let manufacturers = [];
      if (manufacturerIds.length > 0) {
        const { data: manuData } = await supabase
          .from("manufacturers")
          .select("id, name, phone")
          .in("id", manufacturerIds);
        manufacturers = manuData || [];
      }

      // Fetch all responses for these inquiries
      const inquiryIds = (inquiries || []).map((i: any) => i.id);
      let responses: any[] = [];
      if (inquiryIds.length > 0) {
        const { data: respData } = await supabase
          .from("inquiry_responses")
          .select("*")
          .in("inquiry_id", inquiryIds);
        responses = respData || [];
      }

      // Attach manufacturer info and latest response to each inquiry
      const enriched = (inquiries || []).map((inq: any) => {
        const manu = manufacturers.find(
          (m: any) => m.id === inq.manufacturer_id,
        );
        const response = responses
          .filter((r) => r.inquiry_id === inq.id)
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )[0];
        return {
          id: inq.id,
          manufacturer_name: manu?.name || inq.manufacturer_id,
          manufacturer_phone: manu?.phone || "",
          subject: inq.subject,
          message: inq.message,
          status: inq.status,
          created_at: inq.created_at,
          reply: response?.response_text || null,
          reply_by: response?.created_by_name || null,
          reply_at: response?.created_at || null,
        };
      });
      setInquiries(enriched);
    } catch (error) {
      setInquiries([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Inquiries</CardTitle>
        <CardDescription>
          View all your inquiries and manufacturer replies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-redFiredMustard-500"></div>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>You have not made any inquiries yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Manufacturer</th>
                  <th className="text-left py-3 px-4">Subject</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">
                          {inquiry.manufacturer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {inquiry.manufacturer_phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">{inquiry.subject}</td>
                      <td className="py-3 px-4">
                        {formatDate(inquiry.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {inquiry.status.charAt(0).toUpperCase() +
                            inquiry.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                    {inquiry.reply && (
                      <tr>
                        <td
                          colSpan={4}
                          className="bg-gray-50 px-4 py-2 text-sm text-gray-700"
                        >
                          <strong>Reply:</strong> {inquiry.reply}
                          {inquiry.manufacturer_name && (
                            <span className="ml-2 text-xs text-gray-500">
                              by {inquiry.manufacturer_name} (Manufacturer)
                            </span>
                          )}
                          {inquiry.reply_at && (
                            <span className="ml-2 text-xs text-gray-400">
                              at {formatDate(inquiry.reply_at)}
                            </span>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerInquiryList;
