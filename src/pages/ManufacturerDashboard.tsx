import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Package,
  ShoppingCart,
  FileText,
  MessageSquare,
  Fuel,
  Truck,
  Users,
} from "lucide-react";
import ProfileManagement from "@/components/manufacturer/ProfileManagement";
import ProductManagement from "@/components/manufacturer/ProductManagement";
import InquiryManagement from "@/components/manufacturer/InquiryManagement";
import OrderManagement from "@/components/manufacturer/OrderManagement";
import QuotationManagement from "@/components/manufacturer/QuotationManagement";
import CoalFuelProvidersList from "@/components/manufacturer/CoalFuelProvidersList";
import TransportProvidersList from "@/components/manufacturer/TransportProvidersList";
import LabourContractorsList from "@/components/manufacturer/LabourContractorsList";

const ManufacturerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [manufacturerId, setManufacturerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in as a manufacturer
    const storedManufacturerId = localStorage.getItem("manufacturerId");
    if (!storedManufacturerId) {
      console.log(
        "No manufacturer ID found in localStorage, redirecting to auth",
      );
      navigate("/manufacturer-auth", { replace: true });
      return;
    }

    // Set the ID immediately to prevent flickering
    setManufacturerId(storedManufacturerId);

    // Verify the manufacturer ID exists in the database
    const verifyManufacturer = async () => {
      try {
        console.log("Verifying manufacturer ID:", storedManufacturerId);
        const { data, error } = await supabase
          .from("manufacturers")
          .select("id, phone, name, company_name")
          .eq("id", storedManufacturerId)
          .maybeSingle();

        if (error) {
          console.error("Database error verifying manufacturer:", error);
          localStorage.removeItem("manufacturerId");
          navigate("/manufacturer-auth", { replace: true });
          return;
        }

        if (!data) {
          console.log(
            "Manufacturer ID not found in database:",
            storedManufacturerId,
          );
          console.log(
            "Clearing invalid manufacturer ID and redirecting to auth",
          );
          localStorage.removeItem("manufacturerId");
          navigate("/manufacturer-auth", { replace: true });
          return;
        } else {
          console.log("Manufacturer verified successfully:", {
            id: data.id,
            phone: data.phone,
            name: data.name,
            company: data.company_name,
          });
        }
      } catch (err) {
        console.error("Exception verifying manufacturer:", err);
        localStorage.removeItem("manufacturerId");
        navigate("/manufacturer-auth", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    verifyManufacturer();
  }, [navigate]);

  const handleLogout = () => {
    console.log("Logging out manufacturer:", manufacturerId);
    localStorage.removeItem("manufacturerId");
    setManufacturerId(null);
    navigate("/manufacturer-auth", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        scrollToSection={() => {}}
        aboutRef={{ current: null }}
        servicesRef={{ current: null }}
        onboardingRef={{ current: null }}
        blogRef={{ current: null }}
        page="manufacturer-dashboard"
      />

      <main className="flex-grow bg-orange-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-orange-800">
              Manufacturer Dashboard
            </h1>
            <Button
              variant="outline"
              className="border-redFiredMustard-600 text-redFiredMustard-600 hover:bg-redFiredMustard-50"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <div className="mb-8 bg-orange-100 p-1 rounded-xl border border-orange-200 overflow-x-auto">
              <TabsList className="flex w-full justify-between">
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <User className="h-3 w-3" />
                  <span>Company Profile</span>
                </TabsTrigger>
                <TabsTrigger
                  value="products"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Package className="h-3 w-3" />
                  <span>Finished Products</span>
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <ShoppingCart className="h-3 w-3" />
                  <span>End Buy Orders</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quotations"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <FileText className="h-3 w-3" />
                  <span>End Buy Quotations</span>
                </TabsTrigger>
                <TabsTrigger
                  value="inquiries"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <MessageSquare className="h-3 w-3" />
                  <span>All Inquiries</span>
                </TabsTrigger>
                <TabsTrigger
                  value="coal-providers"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Fuel className="h-3 w-3" />
                  <span>Raw M Coal</span>
                </TabsTrigger>
                <TabsTrigger
                  value="transport-providers"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Truck className="h-3 w-3" />
                  <span>Raw M Transport</span>
                </TabsTrigger>
                <TabsTrigger
                  value="labour-contractors"
                  className="flex items-center gap-1 px-2 py-3 rounded-lg font-medium transition-all duration-200 data-[state=active]:bg-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-orange-200 text-orange-800 text-xs whitespace-nowrap flex-1 justify-center"
                >
                  <Users className="h-3 w-3" />
                  <span>Labour</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="profile">
              {manufacturerId && (
                <ProfileManagement manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="products">
              {manufacturerId && (
                <ProductManagement manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="orders">
              {manufacturerId && (
                <OrderManagement manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="quotations">
              {manufacturerId && (
                <QuotationManagement manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="inquiries">
              {manufacturerId && (
                <InquiryManagement manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="coal-providers">
              {manufacturerId && (
                <CoalFuelProvidersList manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="transport-providers">
              {manufacturerId && (
                <TransportProvidersList manufacturerId={manufacturerId} />
              )}
            </TabsContent>

            <TabsContent value="labour-contractors">
              {manufacturerId && (
                <LabourContractorsList manufacturerId={manufacturerId} />
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

export default ManufacturerDashboard;
