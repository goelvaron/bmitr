import React from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ServicesPage = () => {
  const { t } = useTranslation();

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
        page="services"
      />

      {/* Hero Section */}
      <section className="-mt-20 pt-20">
        <div className="container mx-auto px-4">
          <div className="h-[300px] bg-gradient-to-br from-redFiredMustard-50 to-redFiredMustard-100 relative flex items-center justify-center border-8 border-redFiredMustard-600 rounded-2xl">
            <div className="max-w-4xl mx-auto text-center z-20">
              <motion.h1
                className="text-4xl md:text-5xl font-bold text-redFiredMustard-800 mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {t("services.hero.title")}
              </motion.h1>
              <motion.p
                className="text-xl text-redFiredMustard-700 max-w-2xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {t("services.hero.subtitle")}
              </motion.p>
            </div>
          </div>
        </div>
      </section>

      {/* Bhatta Mitra for Manufacturers Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-redFiredMustard-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("services.manufacturersSection.title")}
            </motion.h2>

            <motion.div
              className="bg-redFiredMustard-50 rounded-2xl p-8 shadow-lg border-4 border-redFiredMustard-200 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <p className="text-xl font-bold text-redFiredMustard-800 mb-4">
                  🧱 {t("services.manufacturersSection.mainText")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Free Account Benefits */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-200">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-4">
                    {t("services.manufacturersSection.freeAccount.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.manufacturersSection.freeAccount.benefit1",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.manufacturersSection.freeAccount.benefit2",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.manufacturersSection.freeAccount.benefit3",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.manufacturersSection.freeAccount.benefit4",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.manufacturersSection.freeAccount.benefit5",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="bg-redFiredMustard-100 rounded-lg p-3 mt-4">
                    <p className="text-redFiredMustard-800 font-bold text-center">
                      {t("services.manufacturersSection.freeAccount.noFees")}
                    </p>
                  </div>
                </div>

                {/* Verified Partner Benefits */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-300">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-2">
                    ⭐{" "}
                    {t("services.manufacturersSection.verifiedPartner.title")}
                  </h3>
                  <p className="text-redFiredMustard-700 font-medium mb-4">
                    {t(
                      "services.manufacturersSection.verifiedPartner.subtitle",
                    )}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600">🔝</span>
                      <p className="text-redFiredMustard-700 text-sm">
                        {t(
                          "services.manufacturersSection.verifiedPartner.benefit1",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600">🏅</span>
                      <p className="text-redFiredMustard-700 text-sm">
                        {t(
                          "services.manufacturersSection.verifiedPartner.benefit2",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600">🚀</span>
                      <p className="text-redFiredMustard-700 text-sm">
                        {t(
                          "services.manufacturersSection.verifiedPartner.benefit3",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600">📈</span>
                      <p className="text-redFiredMustard-700 text-sm">
                        {t(
                          "services.manufacturersSection.verifiedPartner.benefit4",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600">💼</span>
                      <p className="text-redFiredMustard-700 text-sm">
                        {t(
                          "services.manufacturersSection.verifiedPartner.benefit5",
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="bg-redFiredMustard-100 rounded-lg p-3 mb-4">
                    <p className="text-redFiredMustard-800 font-medium text-sm text-center">
                      👉{" "}
                      {t(
                        "services.manufacturersSection.verifiedPartner.exclusivity",
                      )}
                    </p>
                  </div>

                  <div className="bg-redFiredMustard-100 border border-redFiredMustard-300 rounded-lg p-3">
                    <p className="text-redFiredMustard-800 font-bold text-sm text-center">
                      ⏳ {t("services.manufacturersSection.waitingListAlert")}
                    </p>

                    <div className="mt-4 text-center">
                      <a
                        href="https://varun-fcq8klry.scoreapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 hover:from-redFiredMustard-700 hover:to-redFiredMustard-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-sm border-2 border-redFiredMustard-800 animate-pulse hover:animate-none"
                      >
                        🚀{" "}
                        {t(
                          "services.manufacturersSection.verifiedPartner.questionnaire",
                        )}{" "}
                        🚀
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 text-white rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-center mb-4">
                  🔥 {t("services.manufacturersSection.callToAction.title")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <p className="text-white">
                      {t("services.manufacturersSection.callToAction.step1")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <p className="text-white">
                      {t("services.manufacturersSection.callToAction.step2")}
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <p className="text-white">
                      {t("services.manufacturersSection.callToAction.step3")}{" "}
                      <a
                        href="https://varun-fcq8klry.scoreapp.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-redFiredMustard-200 hover:text-redFiredMustard-100 underline font-bold"
                      >
                        https://varun-fcq8klry.scoreapp.com
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Coal Suppliers & Transport Providers Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-redFiredMustard-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("services.coalTransportSection.title")}
            </motion.h2>

            <motion.div
              className="bg-redFiredMustard-50 rounded-2xl p-8 shadow-lg border-4 border-redFiredMustard-200 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <p className="text-xl font-bold text-redFiredMustard-800 mb-4">
                  🏭 {t("services.coalTransportSection.mainText")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Coal Suppliers Benefits */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-200">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-4">
                    ⛽ {t("services.coalTransportSection.coalSuppliers.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        📈
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.coalSuppliers.benefit1",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        📲
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.coalSuppliers.benefit2",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🔗
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.coalSuppliers.benefit3",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🚀
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.coalSuppliers.benefit4",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transport Providers Benefits */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-200">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-4">
                    🚛{" "}
                    {t(
                      "services.coalTransportSection.transportProviders.title",
                    )}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🚛
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.transportProviders.benefit1",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🔍
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.transportProviders.benefit2",
                        )}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🔗
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t(
                          "services.coalTransportSection.transportProviders.benefit3",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Exclusivity and Waitlist */}
              <div className="mt-8 space-y-4">
                <div className="bg-redFiredMustard-100 border border-redFiredMustard-300 rounded-lg p-4">
                  <p className="text-redFiredMustard-800 font-bold text-center">
                    ⭐ {t("services.coalTransportSection.exclusivity")}
                  </p>
                </div>

                <div className="bg-redFiredMustard-100 border border-redFiredMustard-300 rounded-lg p-4">
                  <p className="text-redFiredMustard-800 font-bold text-center">
                    ⏳ {t("services.coalTransportSection.joinWaitlist")}
                  </p>
                </div>
              </div>

              {/* How It Works */}
              <div className="bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 text-white rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-center mb-4">
                  🚦 {t("services.coalTransportSection.howItWorks.title")}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-redFiredMustard-200 text-lg">✅</span>
                    <p className="text-white">
                      {t("services.coalTransportSection.howItWorks.step1")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-redFiredMustard-200 text-lg">✅</span>
                    <p className="text-white">
                      {t("services.coalTransportSection.howItWorks.step2")}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-redFiredMustard-200 text-lg">✅</span>
                    <p className="text-white">
                      {t("services.coalTransportSection.howItWorks.step3")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Labour/Contractors Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-redFiredMustard-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("services.labourSection.title")}
            </motion.h2>

            <motion.div
              className="bg-redFiredMustard-50 rounded-2xl p-8 shadow-lg border-4 border-redFiredMustard-200 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <p className="text-xl font-bold text-redFiredMustard-800 mb-4">
                  {t("services.labourSection.mainText")}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Individual Labour & Contractors Benefits */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-200">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-4">
                    👷 {t("services.labourSection.individualLabour.title")}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        ✅
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit1")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🔍
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit2")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        📞
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit3")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🚀
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit4")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        🔗
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit5")}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-redFiredMustard-600 text-lg mt-1">
                        📊
                      </span>
                      <p className="text-redFiredMustard-700">
                        {t("services.labourSection.individualLabour.benefit6")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* No Waiting List */}
                <div className="bg-redFiredMustard-50 rounded-xl p-6 border-2 border-redFiredMustard-200">
                  <h3 className="text-xl font-bold text-redFiredMustard-800 mb-4">
                    🔥 {t("services.labourSection.noWaitingList.title")}
                  </h3>
                  <div className="bg-redFiredMustard-100 rounded-lg p-4 mb-4">
                    <p className="text-redFiredMustard-800 font-bold text-center">
                      {t("services.labourSection.noWaitingList.message")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Simple 3-Step Onboarding Process */}
              <div className="bg-gradient-to-r from-redFiredMustard-600 to-redFiredMustard-700 text-white rounded-xl p-6 mt-8">
                <h3 className="text-xl font-bold text-center mb-6">
                  ✅ {t("services.labourSection.onboardingProcess.title")}
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* For Workers */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-lg font-bold mb-3">
                      🧱{" "}
                      {t(
                        "services.labourSection.onboardingProcess.workers.title",
                      )}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          1️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.workers.step1",
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          2️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.workers.step2",
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          3️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.workers.step3",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* For Contractors */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-lg font-bold mb-3">
                      🏗️{" "}
                      {t(
                        "services.labourSection.onboardingProcess.contractors.title",
                      )}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          1️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.contractors.step1",
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          2️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.contractors.step2",
                          )}
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-redFiredMustard-200 font-bold">
                          3️⃣
                        </span>
                        <p className="text-white text-sm">
                          {t(
                            "services.labourSection.onboardingProcess.contractors.step3",
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Waitlist Concept Section */}
      <section className="py-16 bg-white -mt-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-redFiredMustard-800 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {t("services.waitlistConcept.title")}
            </motion.h2>

            <motion.div
              className="bg-redFiredMustard-50 rounded-2xl p-8 shadow-lg border-4 border-redFiredMustard-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-lg font-semibold text-redFiredMustard-800 mb-6">
                {t("services.waitlistConcept.purpose")}
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3 text-left">
                  <span className="text-redFiredMustard-600 text-xl mt-1">
                    ✅
                  </span>
                  <p className="text-redFiredMustard-700 font-medium">
                    {t("services.waitlistConcept.qualityControl")}
                  </p>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <span className="text-redFiredMustard-600 text-xl mt-1">
                    ✅
                  </span>
                  <p className="text-redFiredMustard-700 font-medium">
                    {t("services.waitlistConcept.balancedSupply")}
                  </p>
                </div>

                <div className="flex items-start gap-3 text-left">
                  <span className="text-redFiredMustard-600 text-xl mt-1">
                    ✅
                  </span>
                  <p className="text-redFiredMustard-700 font-medium">
                    {t("services.waitlistConcept.userExperience")}
                  </p>
                </div>
              </div>

              <div className="bg-redFiredMustard-100 rounded-lg p-4 mb-4">
                <p className="text-redFiredMustard-800 font-bold text-center italic">
                  {t("services.waitlistConcept.bestInBusiness")}
                </p>
              </div>

              <div className="bg-redFiredMustard-100 border-2 border-redFiredMustard-400 p-4 rounded-lg">
                <Link
                  to="/join-waitlist"
                  className="block text-lg font-bold text-redFiredMustard-800 text-center hover:text-redFiredMustard-900 transition-colors duration-200 cursor-pointer"
                >
                  ✨ {t("services.waitlistConcept.joinToday")}
                </Link>
              </div>
            </motion.div>
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

export default ServicesPage;
