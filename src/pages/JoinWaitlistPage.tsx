import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import OnboardingForm from "@/components/OnboardingForm";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWebsiteContent } from "@/services/contentService";

const JoinWaitlistPage = () => {
  const { t } = useTranslation();
  const { content } = useWebsiteContent();

  const scrollToSection = () => {}; // Placeholder for header/footer compatibility
  const dummyRef = { current: null }; // Placeholder refs

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header
        scrollToSection={scrollToSection}
        aboutRef={dummyRef}
        servicesRef={dummyRef}
        onboardingRef={dummyRef}
        blogRef={dummyRef}
        page="waitlist"
      />

      {/* Hero Section */}
      <section className="-mt-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="h-[400px] bg-gradient-to-br from-redFiredMustard-50 to-redFiredMustard-100 relative flex items-center justify-center border-8 border-redFiredMustard-600 rounded-2xl">
            <div className="max-w-4xl mx-auto text-center z-20">
              <motion.h1
                className="text-4xl md:text-6xl font-bold text-redFiredMustard-800 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {t("onboarding.title")}
              </motion.h1>
              <motion.p
                className="text-xl text-redFiredMustard-700 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t("onboarding.description")}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <OnboardingForm />
          </div>
        </div>
      </section>

      <Footer
        scrollToSection={scrollToSection}
        aboutRef={dummyRef}
        servicesRef={dummyRef}
        onboardingRef={dummyRef}
        blogRef={dummyRef}
      />
    </div>
  );
};

export default JoinWaitlistPage;
