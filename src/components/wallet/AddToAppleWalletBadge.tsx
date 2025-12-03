import { useState } from "react";

import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { LocalizedImage } from "@/shared/localization";

import { WalletToast } from "./WalletToast";

export type AddToAppleWalletBadgeProps = {
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

const APPLE_BASE_IMAGE = "/images/add-to-apple-wallet/add-to-apple-wallet.svg";

export const AddToAppleWalletBadge = ({
  passId,
  shareUrl,
  className,
  onClickStart,
  onClickSuccess,
  onClickError,
}: AddToAppleWalletBadgeProps) => {
  const platform = usePlatform();
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsLoading(true);
    onClickStart?.();

    try {
      // На iOS/macOS - прямой редирект на локальный API endpoint
      if (platform.isIOS || platform.isMacOS) {
        window.location.href = `/api/wallet/apple?id=${encodeURIComponent(passId)}`;
        onClickSuccess?.();
        return;
      }

      // На всех остальных платформах показываем тост
      setShowToast(true);
      setIsLoading(false);
      onClickSuccess?.();
    } catch (error) {
      console.error("Failed to redirect to Apple Wallet:", error);
      setIsLoading(false);
      onClickError?.(error);

      // В случае ошибки используем fallback URL
      if (shareUrl) {
        if (platform.isIOS || platform.isMacOS) {
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
        aria-label="Add to Apple Wallet"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex h-[50px] w-[283px] items-center justify-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
      >
        <LocalizedImage
          baseImage={APPLE_BASE_IMAGE}
          alt="Add to Apple Wallet"
          width={IMAGE_WIDTH}
          height={IMAGE_HEIGHT}
          className="h-[50px] w-[283px]"
        />
      </button>

      <WalletToast
        isVisible={showToast}
        walletType="apple"
        onClose={() => setShowToast(false)}
      />
    </>
  );
};
