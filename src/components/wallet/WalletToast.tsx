import { useEffect } from "react";

import { useTranslations } from "next-intl";

type WalletToastProps = {
  isVisible: boolean;
  walletType: "apple" | "google";
  onClose: () => void;
};

export const WalletToast = ({ isVisible, walletType, onClose }: WalletToastProps) => {
  const t = useTranslations("booking.walletShare");

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) {
    return null;
  }

  const message =
    walletType === "apple"
      ? t("toastApple")
      : t("toastGoogle");

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4">
      <div className="rounded-2xl bg-slate-900 px-6 py-4 text-sm font-medium text-white shadow-lg">
        {message}
      </div>
    </div>
  );
};
