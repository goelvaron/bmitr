import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Settings, MessageSquare } from "lucide-react";
import TransportProviderProfileManagement from "@/components/transportProvider/TransportProviderProfileManagement";
import TransportInquiryManagement from "@/components/transportProvider/TransportInquiryManagement";

const TransportProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [transportProviderId, setTransportProviderId] = useState<string | null>(
    null,
  );
  const [transportProviderData, setTransportProviderData] = useState<any>(null);

  const handleProfileUpdate = (updatedData: any) => {
    setTransportProviderData(updatedData);
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as a transport provider
    const storedTransportProviderId = localStorage.getItem(
      "transportProviderId",
    );
    if (!storedTransportProviderId) {
      navigate("/transport-provider-auth");
      return;
    }

    // Set the ID immediately to prevent flickering
    setTransportProviderId(storedTransportProviderId);

    // Verify the transport provider ID exists in the database and fetch data
    const verifyTransportProvider = async () => {
      try {
        console.log(
          "Verifying transport provider ID:",
          storedTransportProviderId,
        );
        const { data, error } = await supabase
          .from("transport_providers")
          .select("*")
          .eq("id", storedTransportProviderId)
          .single();

        if (error || !data) {
          console.error("Error verifying transport provider:", error);
          localStorage.removeItem("transportProviderId");
          navigate("/transport-provider-auth");
          return;
        }

        console.log("Transport provider verified successfully");
        setTransportProviderData(data);
      } catch (err) {
        console.error("Exception verifying transport provider:", err);
        localStorage.removeItem("transportProviderId");
        navigate("/transport-provider-auth");
      } finally {
        setLoading(false);
      }
    };

    verifyTransportProvider();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("transportProviderId");
    navigate("/transport-provider-auth");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
        page="transport-provider-dashboard"
      />

      <main className="flex-grow bg-orange-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-800">
                Transport Provider Dashboard
              </h1>
              {transportProviderData && (
                <p className="text-lg text-gray-600 mt-2">
                  Welcome back, {transportProviderData.name}!
                </p>
              )}
            </div>
            <Button
              variant="outline"
              className="border-orange-600 text-orange-600 hover:bg-orange-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          {transportProviderData && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Company Overview
                  </CardTitle>
                  <CardDescription>
                    Quick overview of your transport provider profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Company Name
                      </p>
                      <p className="text-lg font-semibold">
                        {transportProviderData.company_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Transport Type
                      </p>
                      <p className="text-lg font-semibold capitalize">
                        {transportProviderData.transport_type}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Location
                      </p>
                      <p className="text-lg font-semibold">
                        {transportProviderData.city},{" "}
                        {transportProviderData.state}
                      </p>
                    </div>
                    {transportProviderData.vehicle_capacity && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Vehicle Capacity
                        </p>
                        <p className="text-lg font-semibold">
                          {transportProviderData.vehicle_capacity}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold">
                        {transportProviderData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-lg font-semibold">
                        {transportProviderData.phone}
                      </p>
                    </div>
                    {transportProviderData.service_area && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Service Area
                        </p>
                        <p className="text-lg font-semibold">
                          {transportProviderData.service_area}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <Tabs defaultValue="profile" className="w-full">
            <div className="mb-8 bg-orange-100 p-1 rounded-xl border border-orange-200 overflow-x-auto">
              <TabsList className="flex w-full justify-between">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Settings className="h-3 w-3" />
                  <span>Company Profile Management</span>
                </TabsTrigger>
                <TabsTrigger
                  value="inquiries"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>Inquiry Management</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              {transportProviderData && (
                <TransportProviderProfileManagement
                  transportProviderId={transportProviderId!}
                  transportProviderData={transportProviderData}
                  onProfileUpdate={handleProfileUpdate}
                />
              )}
            </TabsContent>

            <TabsContent value="inquiries">
              {transportProviderId && (
                <TransportInquiryManagement
                  transportProviderId={transportProviderId}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
      />
    </div>
  );
};

export default TransportProviderDashboard;
