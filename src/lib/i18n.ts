import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enTranslation from "../locales/en.json";
import hiTranslation from "../locales/hi.json";
import paTranslation from "../locales/pa.json";
import bnTranslation from "../locales/bn.json";
import neTranslation from "../locales/ne.json";

i18n
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      hi: {
        translation: hiTranslation,
      },
      pa: {
        translation: paTranslation,
      },
      bn: {
        translation: bnTranslation,
      },
      ne: {
        translation: neTranslation,
      },
    },
    supportedLngs: ["en", "hi", "pa", "bn", "ne"],
    checkForSupportedLanguage: true,
    fallbackLng: "en",
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    // Add performance optimizations
    react: {
      useSuspense: false, // Disable suspense to prevent loading delays
    },
    // Preload all languages for faster switching
    preload: ["en", "hi", "pa", "bn", "ne"],
  });

export default i18n;
