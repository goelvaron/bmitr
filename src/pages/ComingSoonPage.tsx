import React from "react";
import { useTranslation } from "react-i18next";
import ComingSoon from "@/components/ComingSoon";

const ComingSoonPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {t("eentMarket.title")}
        </h1>
        <ComingSoon message={t("eentMarket.comingSoon")} />
      </div>
    </div>
  );
};

export default ComingSoonPage;
