import { useState } from "react";

import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { LocalizedImage } from "@/shared/localization";

import { WalletToast } from "./WalletToast";

export type AddToGoogleWalletBadgeProps = {
  passId: string;
  shareUrl?: string;
  className?: string;

  onClickStart?: () => void;
  onClickSuccess?: () => void;
  onClickError?: (error: unknown) => void;
};

// Фиксированные размеры для кнопки
const IMAGE_WIDTH = 283;
const IMAGE_HEIGHT = 50;

const GOOGLE_BASE_IMAGE =
  "/images/add-to-google-wallet/add-to-google-wallet.svg";

export const AddToGoogleWalletBadge = ({
  passId,
  shareUrl,
  className,
  onClickStart,
  onClickSuccess,
  onClickError,
}: AddToGoogleWalletBadgeProps) => {
  const platform = usePlatform();
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onClickStart?.();

    try {
      // На Android - прямой редирект на локальный API endpoint
      if (platform.isAndroid) {
        window.location.href = `/api/wallet/google?id=${encodeURIComponent(passId)}`;
        onClickSuccess?.();
        return;
      }

      // На iOS и других платформах показываем тост
      setShowToast(true);
      setIsLoading(false);
      onClickSuccess?.();
    } catch (error) {
      console.error("Failed to redirect to Google Wallet:", error);
      setIsLoading(false);
      onClickError?.(error);

      // В случае ошибки используем fallback URL
      if (shareUrl) {
        if (platform.isAndroid) {
          window.location.href = shareUrl;
        } else {
          setShowToast(true);
        }
      }
    }
  };

  return (
    <>
      <button
        type="button"
        aria-label="Add to Google Wallet"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex h-[50px] w-[283px] items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      >
        <LocalizedImage
          baseImage={GOOGLE_BASE_IMAGE}
          alt="Add to Google Wallet"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="h-[50px] w-[283px]"
        />
      </button>

      <WalletToast
        isVisible={showToast}
        walletType="google"
        onClose={() => setShowToast(false)}
      />
    </>
  );
};
