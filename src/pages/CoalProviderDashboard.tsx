import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Tables } from "@/types/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, MessageSquare } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import CoalProviderProfileManagement from "@/components/coalProvider/CoalProviderProfileManagement";
import CoalProviderInquiryManagement from "@/components/coalProvider/CoalProviderInquiryManagement";

type CoalProvider = Tables<"coal_providers">;

const CoalProviderDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [coalProviderId, setCoalProviderId] = useState<string | null>(null);
  const [coalProviderData, setCoalProviderData] = useState<CoalProvider | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as a coal provider
    const storedCoalProviderId = localStorage.getItem("coalProviderId");
    if (!storedCoalProviderId) {
      navigate("/coal-provider-auth");
      return;
    }

    // Set the ID immediately to prevent flickering
    setCoalProviderId(storedCoalProviderId);

    // Verify the coal provider ID exists in the database and fetch data
    const verifyCoalProvider = async () => {
      try {
        console.log("=== COAL PROVIDER DASHBOARD VERIFICATION ===");
        console.log("Verifying coal provider ID:", storedCoalProviderId);
        console.log("Coal provider ID type:", typeof storedCoalProviderId);
        console.log("Coal provider ID length:", storedCoalProviderId?.length);

        const { data, error } = await supabase
          .from("coal_providers")
          .select("*")
          .eq("id", storedCoalProviderId)
          .single();

        if (error || !data) {
          console.error("Error verifying coal provider:", error);
          localStorage.removeItem("coalProviderId");
          navigate("/coal-provider-auth");
          return;
        }

        console.log("Coal provider verified successfully:", data.company_name);
        console.log("Coal provider data:", data);
        console.log("=== END COAL PROVIDER DASHBOARD VERIFICATION ===");
        setCoalProviderData(data as CoalProvider);
      } catch (err) {
        console.error("Exception verifying coal provider:", err);
        localStorage.removeItem("coalProviderId");
        navigate("/coal-provider-auth");
      } finally {
        setLoading(false);
      }
    };

    verifyCoalProvider();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("coalProviderId");
    navigate("/coal-provider-auth");
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
        page="coal-provider-dashboard"
      />

      <main className="flex-grow bg-orange-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-orange-800">
                Coal/Fuel Provider Dashboard
              </h1>
              {coalProviderData && (
                <p className="text-lg text-gray-600 mt-2">
                  Welcome back, {coalProviderData.name}!
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

          {coalProviderData && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Company Overview
                  </CardTitle>
                  <CardDescription>
                    Quick overview of your coal/fuel provider profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Company Name
                      </p>
                      <p className="text-lg font-semibold">
                        {coalProviderData.company_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Fuel Types
                      </p>
                      <p className="text-lg font-semibold capitalize">
                        {Array.isArray(coalProviderData.fuel_types)
                          ? coalProviderData.fuel_types.join(", ")
                          : coalProviderData.fuel_types || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        Location
                      </p>
                      <p className="text-lg font-semibold">
                        {coalProviderData.city}, {coalProviderData.state}
                      </p>
                    </div>
                    {coalProviderData.supply_capacity && (
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Supply Capacity
                        </p>
                        <p className="text-lg font-semibold">
                          {coalProviderData.supply_capacity}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-lg font-semibold">
                        {coalProviderData.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone</p>
                      <p className="text-lg font-semibold">
                        {coalProviderData.phone}
                      </p>
                    </div>
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
              {coalProviderId && (
                <CoalProviderProfileManagement
                  coalProviderId={coalProviderId}
                />
              )}
            </TabsContent>

            <TabsContent value="inquiries">
              {coalProviderId && (
                <CoalProviderInquiryManagement
                  coalProviderId={coalProviderId}
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

export default CoalProviderDashboard;
