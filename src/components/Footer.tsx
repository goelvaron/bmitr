import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Link } from "react-router-dom";
import { useWebsiteContent } from "@/services/contentService";

interface FooterProps {
  scrollToSection: (ref: React.RefObject<HTMLElement>) => void;
  aboutRef: React.RefObject<HTMLElement>;
  servicesRef: React.RefObject<HTMLElement>;
  onboardingRef: React.RefObject<HTMLElement>;
  blogRef: React.RefObject<HTMLElement>;
}

const Footer: React.FC<FooterProps> = ({
  scrollToSection,
  aboutRef,
  servicesRef,
  onboardingRef,
  blogRef,
}) => {
  const { t } = useTranslation();
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
    <footer className="bg-white py-12 border-t border-redFiredMustard-200">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link
              to="/"
              className="flex items-center mb-4 hover:opacity-90 transition-opacity"
            >
              <img
                src="/bhattamitralogo.svg"
                alt="Bhatta Mitra Logo"
                className="h-32 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground">
              {getLocalizedText(
                "footer.description",
                content?.footerDescription,
              )}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-redFiredMustard-700">
              {getLocalizedText("footer.quickLinks", content?.footerQuickLinks)}
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors text-left cursor-pointer"
                >
                  {getLocalizedText("header.aboutUs", "About Us")}
                </Link>
              </li>
              <li>
                <a
                  href="/e-ent-bazaar"
                  className="relative text-redFiredMustard-700 font-bold hover:text-redFiredMustard-800 transition-colors animate-pulse-highlight block"
                >
                  {getLocalizedText("header.eentMarket", "e-ENT BAZAAR")}
                </a>
              </li>
              <li>
                <Link
                  to="/join-waitlist"
                  className="relative text-redFiredMustard-700 font-bold hover:text-redFiredMustard-800 transition-colors animate-pulse-highlight block"
                >
                  {getLocalizedText("header.joinWaitlist", "Join Waitlist")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors text-left cursor-pointer"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="text-redFiredMustard-600 hover:text-redFiredMustard-700 transition-colors text-left cursor-pointer"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-redFiredMustard-700">
              {getLocalizedText("footer.contact", content?.footerContact)}
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-mail mt-0.5"
                >
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <span className="text-redFiredMustard-600">
                  customervoice@bhattamitra.com
                </span>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-phone mt-0.5"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <div className="flex items-center gap-2 text-redFiredMustard-600">
                  <span>+91 8008009560</span>
                  <span>+91 8008006245</span>
                  <a
                    href="https://wa.me/918008006245"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-5 h-5 bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                    </svg>
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-map-pin mt-0.5"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-redFiredMustard-600">
                  Saharanpur, Uttar Pradesh (UP), India, 247232
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-redFiredMustard-700">
              {getLocalizedText("footer.followUs", content?.footerFollowUs)}
            </h4>
            <div className="flex gap-2">
              <a
                href="https://twitter.com/bhattamitra"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#000000",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M13.6823 10.6218L20.2391 3H18.6854L12.9921 9.61788L8.44486 3H3.2002L10.0765 13.0074L3.2002 21H4.75404L10.7663 14.0113L15.5549 21H20.7996L13.6819 10.6218H13.6823ZM11.5541 13.0956L10.8574 12.0991L5.31391 4.16971H7.70053L12.1742 10.5689L12.8709 11.5655L18.6861 19.8835H16.2995L11.5541 13.096V13.0956Z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61574884373376"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#1877F2",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/bhattamitra_sint/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/106747205/admin/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0A66C2",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@bhattamitra"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#FF0000",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a
                href="https://t.me/bhattamitra"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform hover:scale-110"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  backgroundColor: "#0088CC",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12s5.374 12 12 12 12-5.373 12-12S18.626 0 12 0zm5.568 8.16c-.169 1.858-.896 6.728-1.268 8.928-.158.934-.468 1.249-.768 1.28-.65.066-1.144-.43-1.774-.84-.985-.642-1.544-1.04-2.502-1.667-1.108-.724-.39-1.122.242-1.772.165-.17 3.045-2.789 3.104-3.044.007-.031.014-.146-.054-.207-.067-.06-.166-.04-.237-.023-.101.024-1.793 1.14-5.062 3.345-.479.329-.913.489-1.302.479-.428-.009-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-redFiredMustard-300 mt-8 pt-8 text-center text-sm text-redFiredMustard-600">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            {i18n.language === "hi"
              ? "भट्टा मित्रा™ - आपकी आवश्यकता में मित्र"
              : "BHATTA MITRA™ - FRIEND IN YOUR NEED"}
            . {getLocalizedText("footer.copyright", content?.footerCopyright)}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
