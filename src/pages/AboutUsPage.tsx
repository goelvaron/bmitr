import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useWebsiteContent } from "@/services/contentService";

const AboutUsPage = () => {
  const { t } = useTranslation();
  const { content } = useWebsiteContent();

  const scrollToSection = () => {}; // Placeholder for header/footer compatibility
  const dummyRef = { current: null }; // Placeholder refs

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header
        scrollToSection={scrollToSection}
        aboutRef={dummyRef}
        servicesRef={dummyRef}
        onboardingRef={dummyRef}
        blogRef={dummyRef}
        page="about"
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
                {getLocalizedText(
                  "about.title",
                  content?.aboutTitle || "About Bhatta Mitra™",
                )}
              </motion.h1>
              <motion.p
                className="text-xl text-redFiredMustard-700 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {getLocalizedText(
                  "about.subtitle",
                  content?.aboutSubtitle ||
                    "Revolutionizing the brick kiln industry through digital innovation and sustainable practices.",
                )}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-8 text-redFiredMustard-900 leading-tight">
                {getLocalizedText(
                  "about.title",
                  content?.aboutTitle || "Transforming Brick Manufacturing",
                )}
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  {getLocalizedText(
                    "about.description1",
                    content?.aboutDescription1 ||
                      "Bhatta Mitra™, though officially launched in 2025, but has it's roots traced back to 2013 when the founder, Mr. Varun Goel, entered the brick manufacturing industry. Our founder is well-acquainted with the complexities and daily challenges faced by brick kiln owners. This understanding and hardships led to the development of an idea specifically designed to address these issues and help overcome the difficulties inherent in this otherwise marvelous industry. India is the second-largest producer of bricks globally, producing approximately 250 billion bricks annually, supported by around 140,000 brick kilns employing approximately 15 million workers ( Fun but Facts)",
                  )}
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  {getLocalizedText(
                    "about.description2",
                    content?.aboutDescription2 ||
                      "Our mission is to enhance efficiency, promote sustainable practices, and create a transparent ecosystem that benefits all participants in the brick manufacturing value chain.",
                  )}
                </p>
              </div>

              {/* Key Features */}
              <div className="mt-12 grid sm:grid-cols-2 gap-6">
                <div className="bg-redFiredMustard-50 p-6 rounded-xl border border-redFiredMustard-200">
                  <div className="w-12 h-12 bg-redFiredMustard-600 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-redFiredMustard-900 mb-2">
                    {getLocalizedText(
                      "about.keyFeatures.digitalInnovation.title",
                      "Digital Innovation",
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getLocalizedText(
                      "about.keyFeatures.digitalInnovation.description",
                      "Cutting-edge technology solutions for modern brick manufacturing",
                    )}
                  </p>
                </div>

                <div className="bg-redFiredMustard-50 p-6 rounded-xl border border-redFiredMustard-200">
                  <div className="w-12 h-12 bg-redFiredMustard-600 rounded-lg flex items-center justify-center mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-redFiredMustard-900 mb-2">
                    {getLocalizedText(
                      "about.keyFeatures.connectedNetwork.title",
                      "Connected Network",
                    )}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {getLocalizedText(
                      "about.keyFeatures.connectedNetwork.description",
                      "Seamless connections between all industry stakeholders",
                    )}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-redFiredMustard-100 to-redFiredMustard-200 p-8">
                <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
                  <div className="flex-1 flex items-center justify-center w-full p-4">
                    <img
                      src="/bhattamitralogo.svg"
                      alt="Bhatta Mitra Logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-center mt-6">
                    <h3 className="text-4xl md:text-5xl font-bold text-redFiredMustard-800 mb-3">
                      Bhatta Mitra™
                    </h3>
                    <p className="text-lg md:text-xl text-redFiredMustard-700">
                      Digital Platform for Brick Kiln Industry
                    </p>
                  </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-redFiredMustard-900/5 to-transparent pointer-events-none"></div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-redFiredMustard-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-redFiredMustard-900">
                    2025
                  </div>
                  <div className="text-sm text-gray-600">Launch Year</div>
                </div>
              </div>

              <div className="absolute -top-6 -right-6 bg-redFiredMustard-600 rounded-xl shadow-lg p-6 text-white">
                <div className="text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-sm opacity-90">Digital</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-white border-t border-redFiredMustard-200">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl border-8 border-redFiredMustard-600 p-12">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-redFiredMustard-900 mb-4">
                {getLocalizedText(
                  "about.missionVision.title",
                  "Our Mission & Vision",
                )}
              </h2>
              <p className="text-xl text-redFiredMustard-700 max-w-3xl mx-auto">
                {getLocalizedText(
                  "about.missionVision.subtitle",
                  "Building a sustainable future for the brick manufacturing industry",
                )}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              <motion.div
                className="bg-redFiredMustard-50 rounded-2xl p-8 border border-redFiredMustard-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-redFiredMustard-900 mb-4">
                  {getLocalizedText(
                    "about.missionVision.mission.title",
                    "Our Mission",
                  )}
                </h3>
                <p className="text-redFiredMustard-700 leading-relaxed">
                  {getLocalizedText(
                    "about.missionVision.mission.description",
                    "To revolutionize the brick kiln industry by providing innovative digital solutions that enhance efficiency, promote sustainability, and create value for all stakeholders in the manufacturing ecosystem.",
                  )}
                </p>
              </motion.div>

              <motion.div
                className="bg-redFiredMustard-50 rounded-2xl p-8 border border-redFiredMustard-200"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-redFiredMustard-600 rounded-full flex items-center justify-center mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-redFiredMustard-900 mb-4">
                  {getLocalizedText(
                    "about.missionVision.vision.title",
                    "Our Vision",
                  )}
                </h3>
                <p className="text-redFiredMustard-700 leading-relaxed">
                  {getLocalizedText(
                    "about.missionVision.vision.description",
                    "To become the leading digital platform that transforms traditional brick manufacturing into a modern, sustainable, and interconnected industry that serves communities across India and beyond.",
                  )}
                </p>
              </motion.div>
            </div>
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

export default AboutUsPage;
