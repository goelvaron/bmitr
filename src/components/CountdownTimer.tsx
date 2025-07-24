import { useTranslation } from "react-i18next";

interface CountdownTimerProps {
  className?: string;
}

const CountdownTimer = ({ className = "" }: CountdownTimerProps) => {
  const { t } = useTranslation();

  return (
    <div
      className={`bg-gradient-to-r from-redFiredMustard-900 to-redFiredMustard-800 p-6 rounded-lg shadow-lg border border-redFiredMustard-700 ${className}`}
    >
      <div className="text-center text-white">
        <p className="text-lg font-bold uppercase tracking-wider text-white">
          {t("countdown.launchMessage")}
        </p>
      </div>
    </div>
  );
};

export default CountdownTimer;
