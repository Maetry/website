"use client";

import { useEffect, useState } from "react";

import { AlertCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Paragraph, Spinner, Text, XStack, YStack } from "tamagui";

import { ApiError } from "@/lib/api/error-handler";
import { resolveShortLink, type PublicClickResponse } from "@/lib/api/public-booking";
import { detectPlatform } from "@/lib/userAgent/detectPlatform";
import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { getClientAppSurfaceStyle } from "@/src/shared/tamagui/clientAppTheme";

type LinkHandlerProps = {
  nanoId: string;
};

type LinkState =
  | { status: "loading" }
  | { status: "error"; message: string };

const CANONICAL_CONSUMER_ORIGIN = "https://maetry.com";

function resolveLinkError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function isInviteKind(
  kind: PublicClickResponse["kind"],
): kind is "clientInvite" | "employeeInvite" {
  return kind === "clientInvite" || kind === "employeeInvite";
}

function normalizeHost(rawHost: string): string {
  return rawHost.replace(/^https?:\/\//, "").toLowerCase();
}

function resolveInviteBaseUrl(): string {
  if (typeof window === "undefined") {
    return "";
  }

  const currentHost = normalizeHost(window.location.host);
  const shortlinkHost = normalizeHost(
    process.env.NEXT_PUBLIC_SHORTLINK_HOST ?? "link.maetry.com",
  );
  const isLocal =
    currentHost.includes("localhost") || currentHost.includes("127.0.0.1");
  const isPreview =
    currentHost.includes("vercel.app") || currentHost.includes("vercel.live");

  if (isLocal || isPreview || !currentHost.includes("maetry.com")) {
    return "";
  }

  if (currentHost === shortlinkHost) {
    return CANONICAL_CONSUMER_ORIGIN;
  }

  return "";
}

function resolveInviteFallbackUrl(
  response: PublicClickResponse,
  locale: string,
): string | null {
  if (!response.nanoId) {
    return null;
  }

  const baseUrl = resolveInviteBaseUrl();

  if (response.kind === "clientInvite") {
    return `${baseUrl}/${locale}/client/invite/${encodeURIComponent(response.nanoId)}`;
  }

  if (response.kind === "employeeInvite") {
    return `${baseUrl}/${locale}/staff/invite/${encodeURIComponent(response.nanoId)}`;
  }

  return null;
}

const ALLOWED_APP_NAVIGATION_PROTOCOLS = new Set([
  "maetry:",
  "maesole:",
  "https:",
  "http:",
]);

/**
 * Проверка до window.location.assign: иначе Safari показывает «address is invalid»
 * для битых legacy custom scheme и пустых ссылок.
 */
function canSafelyNavigateToAppUrl(rawUrl: string): boolean {
  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return false;
  }

  const protocol = url.protocol.toLowerCase();
  if (!ALLOWED_APP_NAVIGATION_PROTOCOLS.has(protocol)) {
    return false;
  }

  if (protocol === "http:" || protocol === "https:") {
    return Boolean(url.hostname);
  }

  // Legacy custom scheme: не пустой хвост после схемы.
  const schemeMatch = trimmed.match(/^(maetry|maesole):/i);
  if (!schemeMatch) {
    return false;
  }

  const afterScheme = trimmed.slice(schemeMatch[0].length).trim();
  if (!afterScheme || afterScheme === "//") {
    return false;
  }

  // На десктопе custom scheme почти всегда приводит к ошибке в браузере — сразу fallback
  if (detectPlatform().isDesktop) {
    return false;
  }

  return true;
}

function openAppWithFallback(response: PublicClickResponse, locale: string) {
  if (typeof window === "undefined") {
    return;
  }

  const inviteFallbackUrl = isInviteKind(response.kind)
    ? resolveInviteFallbackUrl(response, locale)
    : null;

  // Invite short links всегда канонизируем в локализованный web route.
  // Дальше universal/app links на основном домене сами решают, открывать app или web.
  if (inviteFallbackUrl) {
    window.location.replace(inviteFallbackUrl);
    return;
  }

  if (!response.appUrl || !canSafelyNavigateToAppUrl(response.appUrl)) {
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

  const timeoutId = window.setTimeout(fallback, 1400);

  // iOS Safari can blur the page while showing the native "Open in app?" sheet.
  // If the user taps Cancel, the document stays visible and we still need the web fallback.
  // Treat only a real hide/page unload as a successful handoff to the native app.
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", handlePageHide);

  window.location.assign(response.appUrl);
}

function LinkStatusScreen({
  action,
  description,
  icon,
  plain,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  plain?: boolean;
  title: string;
}) {
  const platformInfo = usePlatform();
  const platform = platformInfo.isAndroid ? "android" : "ios";
  const surface = getClientAppSurfaceStyle(platform);

  return (
    <YStack
      alignItems="center"
      flex={1}
      justifyContent="center"
      minHeight="100dvh"
      padding="$6"
      width="100%"
    >
      <YStack
        alignItems="center"
        gap="$3"
        maxWidth={420}
        paddingHorizontal="$5"
        paddingVertical="$6"
        width="100%"
      >
        {icon}
        {plain ? null : (
          <YStack alignItems="center" gap="$2">
            <Text
              color="$textPrimary"
              fontSize={surface.state.titleFontSize}
              fontWeight="700"
              lineHeight={surface.state.titleLineHeight}
              textAlign="center"
            >
              {title}
            </Text>
            <Paragraph
              color="$textSecondary"
              fontSize={surface.state.descriptionFontSize}
              lineHeight={surface.state.descriptionLineHeight}
              maxWidth={320}
              textAlign="center"
            >
              {description}
            </Paragraph>
          </YStack>
        )}
        {action}
      </YStack>
    </YStack>
  );
}

export const LinkHandler = ({ nanoId }: LinkHandlerProps) => {
  const locale = useLocale();
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

        openAppWithFallback(response, locale);
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
  }, [locale, nanoId, t]);

  if (state.status === "loading") {
    return (
      <LinkStatusScreen
        icon={<Spinner size="large" color="$primary" />}
        plain
        title=""
        description=""
      />
    );
  }

  if (state.status === "error") {
    return (
      <LinkStatusScreen
        action={
          <Button
            backgroundColor="$primary"
            borderRadius={999}
            minHeight={50}
            onPress={() => window.location.reload()}
            paddingHorizontal="$5"
          >
            <Text color="white" fontSize="$5" fontWeight="700">
              {t("retry")}
            </Text>
          </Button>
        }
        description={state.message}
        icon={
          <XStack
            alignItems="center"
            backgroundColor="$primarySoft"
            borderRadius={999}
            height={48}
            justifyContent="center"
            width={48}
          >
            <Text color="$danger">
              <AlertCircle size={22} />
            </Text>
          </XStack>
        }
        title={t("errorTitle")}
      />
    );
  }
  return null;
};
