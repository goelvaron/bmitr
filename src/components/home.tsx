import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Step = "language" | "role";

function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("language");
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLanguageSelect = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentStep("role");
  };

  const handleRoleSelect = (role: string) => {
    if (role === "endBuyer") {
      navigate("/e-ent-bazaar");
    } else {
      navigate("/landing");
    }
  };

  // Language Selection Screen
  if (currentStep === "language") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <Card className="bg-white shadow-2xl border border-gray-200">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <img
                    src="/bhattamitralogo.svg"
                    alt="Bhatta Mitra"
                    className="h-40 mx-auto mb-4 object-contain"
                  />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-2xl font-bold text-redFiredMustard-700 mb-2"
                >
                  {t("hero.chooseLanguage", "Choose Your Language")}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-redFiredMustard-600 mb-8"
                >
                  {t("hero.selectLanguage", "अपनी भाषा चुनें")}
                </motion.p>

                <div className="space-y-4">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleLanguageSelect("en")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      English
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleLanguageSelect("hi")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      हिन्दी
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleLanguageSelect("pa")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      ਪੰਜਾਬੀ
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleLanguageSelect("bn")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      বাংলা
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleLanguageSelect("ne")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-4 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      नेपाली
                    </Button>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // Role Selection Screen
  if (currentStep === "role") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            <Card className="bg-white shadow-2xl border border-gray-200">
              <CardContent className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="mb-6"
                >
                  <img
                    src="/bhattamitralogo.svg"
                    alt="Bhatta Mitra"
                    className="h-40 mx-auto mb-4 object-contain"
                  />
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-2xl font-bold text-redFiredMustard-700 mb-2"
                >
                  {t("hero.chooseRole", "Choose Your Role")}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-redFiredMustard-600 mb-8"
                >
                  {t(
                    "hero.categoryQuestion",
                    "Which category do you belong to?",
                  )}
                </motion.p>

                <div className="space-y-4">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleRoleSelect("endBuyer")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-8 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 min-h-[120px]"
                    >
                      <span className="text-xl">
                        {t("onboarding.form.endBuyer", "End Buyers")}
                      </span>
                      <span className="text-sm opacity-90">
                        {t("hero.goToEentBazaar", "Go to e-ENT BAZAAR")}
                      </span>
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                  >
                    <Button
                      onClick={() => handleRoleSelect("manufacturer")}
                      className="w-full bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white py-8 text-lg font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 flex flex-col items-center space-y-3 min-h-[120px]"
                    >
                      <span className="text-xl">
                        {t(
                          "hero.manufacturersAndOthers",
                          "Manufacturers & Others",
                        )}
                      </span>
                      <span className="text-sm opacity-90">
                        {t(
                          "hero.goToBhattaMitra",
                          "Go to Bhatta Mitra Landing Page",
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="mt-6"
                >
                  <Button
                    onClick={() => setCurrentStep("language")}
                    variant="ghost"
                    className="text-redFiredMustard-600 hover:text-redFiredMustard-700 text-sm"
                  >
                    {t("hero.changeLanguage", "Change Language")}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return null;
}

export default Home;
