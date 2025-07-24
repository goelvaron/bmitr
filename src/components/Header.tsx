import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import LanguageSelector from "@/components/LanguageSelector";
import { Link, useNavigate } from "react-router-dom";
import { useWebsiteContent } from "@/services/contentService";

interface HeaderProps {
  scrollToSection: (ref: React.RefObject<HTMLElement>) => void;
  aboutRef: React.RefObject<HTMLElement>;
  servicesRef: React.RefObject<HTMLElement>;
  onboardingRef: React.RefObject<HTMLElement>;
  blogRef: React.RefObject<HTMLElement>;
  page?: string;
}

const Header: React.FC<HeaderProps> = ({
  scrollToSection,
  aboutRef,
  servicesRef,
  onboardingRef,
  blogRef,
  page,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { content } = useWebsiteContent();

  // Helper function to get localized text - prioritizes i18next translations
  const getLocalizedText = (
    translationKey: string,
    fallbackContent?: string,
  ) => {
    const translation = t(translationKey);
    // If translation exists and is different from the key, use it
    if (translation && translation !== translationKey) {
      return translation;
    }
    // Otherwise fall back to content from database
    return fallbackContent || translation;
  };

  return (
    <header className="relative z-10 bg-transparent">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link
          to="/"
          className="flex items-center hover:opacity-90 transition-opacity"
        >
          <img
            src="/bhattamitralogo.svg"
            alt="Bhatta Mitra Logo"
            className="h-40 w-auto"
          />
        </Link>
        <nav className="hidden md:flex gap-6">
          <button
            onClick={() => navigate("/about")}
            className="text-redFiredMustard-700 hover:text-redFiredMustard-800 transition-colors text-left font-bold"
          >
            {getLocalizedText("header.aboutUs", content?.navAboutUs)}
          </button>
          <a
            href="/e-ent-bazaar"
            className="relative text-redFiredMustard-700 font-bold hover:text-redFiredMustard-800 transition-colors animate-pulse-highlight"
          >
            {getLocalizedText("header.eentMarket", "e-ENT BAZAAR")}
          </a>
          <button
            onClick={() => navigate("/services")}
            className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors text-left font-bold"
          >
            {getLocalizedText("header.services", content?.navServices)}
          </button>
          <button
            onClick={() => navigate("/blog")}
            className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors font-bold"
          >
            {getLocalizedText("header.blog", content?.navBlog)}
          </button>
          <button
            onClick={() => navigate("/reach-us")}
            className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors font-bold"
          >
            {getLocalizedText("header.reachUs", content?.navReachUs)}
          </button>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="hidden md:flex border-redFiredMustard-600 text-redFiredMustard-700 hover:bg-redFiredMustard-600 hover:text-white"
              >
                {getLocalizedText(
                  "header.loginDashboard",
                  content?.headerLoginDashboard,
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigate("/manufacturer-dashboard")}
              >
                {getLocalizedText(
                  "header.dashboard.brickKilnOwners",
                  content?.headerDashboardBrickKilnOwners,
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/coal-provider-auth")}>
                {getLocalizedText(
                  "header.dashboard.coalProviders",
                  content?.headerDashboardCoalProviders,
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate("/transport-provider-auth")}
              >
                {getLocalizedText(
                  "header.dashboard.transportProviders",
                  content?.headerDashboardTransportProviders,
                )}
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => navigate("/labour-auth")}>
                {getLocalizedText(
                  "header.dashboard.labour",
                  "Labour / Contractor",
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
