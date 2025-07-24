import { Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import LandingPage from "./pages/LandingPage";
import Home from "./components/home";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import BlogPostPage from "./components/blog/BlogPostPage";
import ComingSoonPage from "./pages/ComingSoonPage";
import EENTMarketPage from "./pages/EENTMarketPage";
import EndUserDashboard from "./pages/EndUserDashboard";
import UserProfile from "./components/UserProfile";
import EditProfile from "./components/EditProfile";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import ManufacturerAuth from "./pages/ManufacturerAuth";
import CoalProviderDashboard from "./pages/CoalProviderDashboard";
import CoalProviderAuth from "./pages/CoalProviderAuth";
import TransportProviderDashboard from "./pages/TransportProviderDashboard";
import TransportProviderAuth from "./pages/TransportProviderAuth";
import LabourDashboard from "./pages/LabourDashboard";
import LabourAuth from "./pages/LabourAuth";
import AboutUsPage from "./pages/AboutUsPage";
import ServicesPage from "./pages/ServicesPage";
import JoinWaitlistPage from "./pages/JoinWaitlistPage";
import BlogPage from "./pages/BlogPage";
import ReachUsPage from "./pages/ReachUsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsAndConditionsPage from "./pages/TermsAndConditionsPage";
import { Toaster } from "@/components/ui/toaster";
import { preloadGlobalContent } from "@/services/contentService";

function App() {
  const [isContentReady, setIsContentReady] = useState(false);

  useEffect(() => {
    // Check if user is navigating directly to e-ENT BAZAAR
    const isEENTBazaarRoute =
      window.location.pathname === "/e-ent-bazaar" ||
      window.location.pathname === "/e-ent-market";

    // Preload content to prevent flash
    preloadGlobalContent()
      .then(() => {
        // Skip delay for e-ENT BAZAAR routes to prevent double splash
        if (isEENTBazaarRoute) {
          setIsContentReady(true);
        } else {
          // Add a minimum delay to ensure smooth transition and prevent old logo flash
          setTimeout(() => {
            setIsContentReady(true);
          }, 5000);
        }
      })
      .catch((error) => {
        console.error("Failed to preload content:", error);
        // Still show the app even if content loading fails
        if (isEENTBazaarRoute) {
          setIsContentReady(true);
        } else {
          setTimeout(() => {
            setIsContentReady(true);
          }, 5000);
        }
      });
  }, []);

  // Show a minimal loading state while content is being preloaded
  if (!isContentReady) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <img
          src="/bhattamitralogo.svg"
          alt="Bhatta Mitra Logo"
          className="max-h-[600px] max-w-[600px] w-full h-auto object-contain animate-pulse drop-shadow-lg"
        />
      </div>
    );
  }

  return (
    <>
      {/* For the tempo routes - moved to top to prevent conflicts */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/about" element={<AboutUsPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/join-waitlist" element={<JoinWaitlistPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/reach-us" element={<ReachUsPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-conditions" element={<TermsAndConditionsPage />} />
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminDashboard />
            </AdminAuthGuard>
          }
        />
        <Route path="/posts/:slug" element={<BlogPostPage />} />
        <Route path="/e-ent-bazaar" element={<EENTMarketPage />} />
        <Route path="/e-ent-market" element={<EENTMarketPage />} />
        <Route path="/end-user-dashboard" element={<EndUserDashboard />} />
        <Route path="/dashboard" element={<EndUserDashboard />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

        {/* Manufacturer routes */}
        <Route
          path="/manufacturer-dashboard"
          element={<ManufacturerDashboard />}
        />
        <Route path="/manufacturer-auth" element={<ManufacturerAuth />} />

        {/* Coal Provider routes */}
        <Route
          path="/coal-provider-dashboard"
          element={<CoalProviderDashboard />}
        />
        <Route path="/coal-provider-auth" element={<CoalProviderAuth />} />

        {/* Transport Provider routes */}
        <Route
          path="/transport-provider-dashboard"
          element={<TransportProviderDashboard />}
        />
        <Route
          path="/transport-provider-auth"
          element={<TransportProviderAuth />}
        />

        {/* Labour/Contractor routes */}
        <Route path="/labour-dashboard" element={<LabourDashboard />} />
        <Route path="/labour-auth" element={<LabourAuth />} />

        {/* Add this before any catchall route */}
        {import.meta.env.VITE_TEMPO && (
          <Route path="/tempobook/*" element={null} />
        )}
      </Routes>

      <Toaster />
    </>
  );
}

export default App;
