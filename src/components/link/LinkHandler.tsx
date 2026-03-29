"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { InviteScreen } from "@/components/invite";
import { ApiError, NotFoundError } from "@/lib/api/error-handler";
import {
  PublicMarketingCampaign,
  getCampaignByLink,
  registerLinkClick,
} from "@/lib/api/public-booking";
import type { LinkKind } from "@/lib/api/shortLink";

type LinkHandlerProps = {
  /** Полный путь ссылки: `nanoId`, `b/nanoId`, `ci/nanoId`, `si/nanoId`. */
  linkPath: string;
  locale: string;
};

type LinkState =
  | { status: "loading" }
  | {
      status: "invite";
      kind: Exclude<LinkKind, "marketing">;
    }
  | {
      status: "error";
      message: string;
    };

function readTrackingIdFromLocation() {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get("trackingId");
}

function readNanoIdFromLinkPath(linkPath: string) {
  const segments = linkPath.split("/").filter(Boolean);
  return segments.at(-1) ?? linkPath;
}

function getBookingOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  const configuredShortlinkHost =
    process.env.NEXT_PUBLIC_SHORTLINK_HOST || "link.maetry.com";
  const shortlinkHost = configuredShortlinkHost
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (
    window.location.hostname === shortlinkHost ||
    window.location.hostname.includes(shortlinkHost)
  ) {
    const mainHost = window.location.hostname.replace(/^link\./, "");
    return `${window.location.protocol}//${mainHost}`;
  }

  return window.location.origin;
}

function buildBookingRedirectUrl(
  locale: string,
  salonId: string,
  nanoId: string,
  trackingId: string | null,
) {
  const url = new URL(
    `/${locale}/booking/${encodeURIComponent(salonId)}`,
    getBookingOrigin(),
  );

  url.searchParams.set("nanoid", nanoId);

  if (trackingId) {
    url.searchParams.set("trackingId", trackingId);
  }

  return url.toString();
}

function resolveLinkError(
  error: unknown,
  fallbackMessage: string,
) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Обработка link.maetry.com (и /{locale}/link/…):
 * 1) Сразу регистрируем клик с fingerprint в теле запроса — бэкенд может сопоставить установку приложения.
 * 2) Затем подгружаем кампанию (маркетинг) или ветвимся по kind из ответа клика (инвайты).
 */
export const LinkHandler = ({ linkPath, locale }: LinkHandlerProps) => {
  const t = useTranslations("linkHandler");
  const [state, setState] = useState<LinkState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const redirectToBooking = (
      campaign: PublicMarketingCampaign | null,
      salonIdFromClick?: string | null,
    ) => {
      const trackingId = readTrackingIdFromLocation();
      const salonId = campaign?.salonId ?? salonIdFromClick;
      const nanoId = readNanoIdFromLinkPath(linkPath);

      if (!salonId) {
        setState({
          message: t("errorCampaign"),
          status: "error",
        });
        return;
      }

      window.location.replace(
        buildBookingRedirectUrl(locale, salonId, nanoId, trackingId),
      );
    };

    const run = async () => {
      try {
        const click = await registerLinkClick(linkPath, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (click.kind === "employeeInvite" || click.kind === "clientInvite") {
          setState({
            kind: click.kind,
            status: "invite",
          });
          return;
        }

        try {
          const campaign = await getCampaignByLink(linkPath, {
            signal: controller.signal,
          });

          if (controller.signal.aborted) {
            return;
          }

          redirectToBooking(campaign, click.payload?.salonId);
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          if (
            error instanceof NotFoundError ||
            (error instanceof ApiError && error.status === 404)
          ) {
            redirectToBooking(null, click.payload?.salonId);
            return;
          }

          setState({
            message: resolveLinkError(error, t("errorProcessing")),
            status: "error",
          });
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          message: resolveLinkError(error, t("errorProcessing")),
          status: "error",
        });
      }
    };

    void run();

    return () => {
      controller.abort();
    };
  }, [linkPath, locale, t]);

  if (state.status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_36%),linear-gradient(135deg,_#f7c8a8_0%,_#ffdff4_35%,_#dce7ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-white/50 bg-white/75 p-6 text-center shadow-[0_30px_90px_rgba(85,71,117,0.18)] backdrop-blur-2xl">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <div className="mt-5 space-y-2">
            <h1 className="text-xl font-semibold text-slate-950">
              {t("processing")}
            </h1>
            <p className="text-sm leading-6 text-slate-600">{t("pleaseWait")}</p>
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.82),_transparent_36%),linear-gradient(135deg,_#f7c8a8_0%,_#ffdff4_35%,_#dce7ff_100%)] px-4">
        <div className="w-full max-w-md rounded-[28px] border border-white/50 bg-white/75 p-6 text-center shadow-[0_30px_90px_rgba(85,71,117,0.18)] backdrop-blur-2xl">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-xl text-red-600">
            ×
          </div>
          <div className="mt-5 space-y-2">
            <h1 className="text-xl font-semibold text-slate-950">
              {t("errorTitle")}
            </h1>
            <p className="text-sm leading-6 text-red-600">{state.message}</p>
          </div>
          <button
            className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-slate-900 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
            onClick={() => window.location.reload()}
            type="button"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (state.status === "invite") {
    return <InviteScreen kind={state.kind} />;
  }

  return null;
};
