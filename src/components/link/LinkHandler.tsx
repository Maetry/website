"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { useTranslations } from "next-intl";

import BookingScreen from "@/app/[locale]/booking/[salonId]/BookingScreen";
import { InviteScreen } from "@/components/invite";
import { getMarketingCampaign } from "@/lib/api/getMarketingCampaign";
import { registerClick } from "@/lib/api/registerClick";
import type { LinkKind } from "@/lib/api/shortLink";

interface LinkHandlerProps {
  nanoId: string;
}

interface MarketingCampaign {
  salonId: string;
}

export const LinkHandler = ({ nanoId }: LinkHandlerProps) => {
  const params = useParams();
  const t = useTranslations("linkHandler");
  const [isProcessing, setIsProcessing] = useState(true);
  const [inviteKind, setInviteKind] = useState<LinkKind | null>(null);
  const [marketingCampaign, setMarketingCampaign] = useState<MarketingCampaign | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Определяем локаль из params (как в других компонентах)
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    const handleLink = async () => {
      try {
        // Регистрируем клик и получаем тип ссылки
        const magicLink = await registerClick(nanoId);

        // Обрабатываем в зависимости от типа
        switch (magicLink.kind) {
          case "marketing": {
            try {
              // Получаем информацию о кампании
              const campaign = await getMarketingCampaign(nanoId);
              
              // Сохраняем данные кампании и показываем BookingScreen на той же странице
              // Это защищает от обхода регистрации клика - пользователь не может поделиться
              // прямой ссылкой на /booking/ без trackingId
              setMarketingCampaign(campaign);
              setIsProcessing(false);
              return;
            } catch {
              setError(t("errorCampaign"));
              setIsProcessing(false);
              return;
            }
          }

          case "employeeInvite":
          case "clientInvite": {
            // Показываем информационную страницу приглашения
            setInviteKind(magicLink.kind);
            setIsProcessing(false);
            return;
          }

          default: {
            setError(t("errorUnknownType"));
            setIsProcessing(false);
          }
        }
      } catch (error) {
        // Показываем более информативное сообщение об ошибке
        const errorMessage =
          error instanceof Error ? error.message : t("errorProcessing");
        setError(errorMessage);
        setIsProcessing(false);
      }
    };

    handleLink();
  }, [nanoId, locale, t]);

  if (isProcessing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="h-8 w-8 animate-spin text-slate-600 dark:text-slate-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              {t("errorTitle")}
            </h2>
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  // Показываем BookingScreen для маркетинговых ссылок
  if (marketingCampaign) {
    return (
      <BookingScreen 
        salonId={marketingCampaign.salonId} 
        locale={locale}
        trackingId={nanoId}
      />
    );
  }

  if (inviteKind) {
    return <InviteScreen kind={inviteKind} />;
  }

  return null;
};
