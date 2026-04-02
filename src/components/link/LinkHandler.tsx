"use client";

import { useEffect, useState } from "react";

import { useTranslations } from "next-intl";

import { InviteScreen } from "@/components/invite";
import { ApiError } from "@/lib/api/error-handler";
import { resolveShortLink, type PublicClickResponse } from "@/lib/api/public-booking";
import type { LinkKind } from "@/lib/api/shortLink";

type LinkHandlerProps = {
  nanoId: string;
};

type InviteState = {
  kind: Exclude<LinkKind, "marketing">;
  storeUrl: string | null;
};

type LinkState =
  | { status: "loading" }
  | { status: "invite"; invite: InviteState }
  | { status: "error"; message: string };

function resolveLinkError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function isInviteKind(kind: LinkKind): kind is Exclude<LinkKind, "marketing"> {
  return kind === "clientInvite" || kind === "employeeInvite";
}

function resolveInviteStoreUrl(response: PublicClickResponse): string | null {
  if (
    (response.fallbackTarget === "appStore" || response.fallbackTarget === "playStore")
    && response.fallbackUrl
  ) {
    return response.fallbackUrl;
  }

  return null;
}

function openAppWithFallback(
  response: PublicClickResponse,
  onInviteFallback: (invite: InviteState) => void,
) {
  if (typeof window === "undefined") {
    return;
  }

  if (!response.appUrl) {
    if (isInviteKind(response.kind)) {
      onInviteFallback({
        kind: response.kind,
        storeUrl: resolveInviteStoreUrl(response),
      });
      return;
    }

    if (response.fallbackUrl) {
      window.location.replace(response.fallbackUrl);
    }
    return;
  }

  let finished = false;
  let didHide = false;

  const cleanup = () => {
    finished = true;
    window.clearTimeout(timeoutId);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", handlePageHide);
    window.removeEventListener("blur", handleBlur);
  };

  const fallback = () => {
    if (finished || didHide) {
      cleanup();
      return;
    }

    cleanup();

    if (response.fallbackTarget === "webBooking" && response.fallbackUrl) {
      window.location.replace(response.fallbackUrl);
      return;
    }

    if (isInviteKind(response.kind)) {
      onInviteFallback({
        kind: response.kind,
        storeUrl: resolveInviteStoreUrl(response),
      });
      return;
    }

    if (response.fallbackUrl) {
      window.location.replace(response.fallbackUrl);
    }
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      didHide = true;
      cleanup();
    }
  };

  const handlePageHide = () => {
    didHide = true;
    cleanup();
  };

  const handleBlur = () => {
    didHide = true;
  };

  const timeoutId = window.setTimeout(fallback, 1400);

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);
  window.addEventListener("blur", handleBlur);

  window.location.assign(response.appUrl);
}

export const LinkHandler = ({ nanoId }: LinkHandlerProps) => {
  const t = useTranslations("linkHandler");
  const [state, setState] = useState<LinkState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const run = async () => {
      try {
        const response = await resolveShortLink(nanoId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        openAppWithFallback(response, (invite) => {
          setState({
            invite,
            status: "invite",
          });
        });
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
  }, [nanoId, t]);

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

  return (
    <InviteScreen
      kind={state.invite.kind}
      storeUrl={state.invite.storeUrl}
    />
  );
};
