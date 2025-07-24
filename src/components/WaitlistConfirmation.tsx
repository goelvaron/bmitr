import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WaitlistConfirmationProps {
  name?: string;
  email?: string;
  onClose?: () => void;
}

const WaitlistConfirmation = ({
  name = "Kiln Owner",
  email = "example@email.com",
  onClose = () => {},
}: WaitlistConfirmationProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6"
      >
        <CheckCircle className="w-10 h-10 text-green-600" />
      </motion.div>

      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {t("waitlistConfirmation.thankYou")}
      </h2>

      <p className="text-gray-600 mb-6">
        {t("waitlistConfirmation.hello")}{" "}
        <span className="font-semibold">{name}</span>,{" "}
        {t("waitlistConfirmation.received")}{" "}
        <span className="font-semibold">{email}</span>{" "}
        {t("waitlistConfirmation.updates")}
      </p>

      <div className="bg-redFiredMustard-50 p-4 rounded-md mb-6">
        <p className="text-redFiredMustard-800 text-sm">
          <span className="font-semibold">
            {t("waitlistConfirmation.nextSteps")}:
          </span>{" "}
          {t("waitlistConfirmation.keepEye")}
        </p>
      </div>

      <Button
        onClick={onClose}
        className="bg-redFiredMustard-600 hover:bg-redFiredMustard-700 text-white"
      >
        {t("waitlistConfirmation.close")}
      </Button>
    </motion.div>
  );
};

export default WaitlistConfirmation;
