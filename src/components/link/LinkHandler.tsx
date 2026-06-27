"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  MapPinOff,
  Search,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Button, Paragraph, Text, XStack, YStack, useThemeName } from "tamagui";

import { ApiError, NotFoundError } from "@/lib/api/error-handler";
import { resolveShortLink, type PublicClickResponse } from "@/lib/api/public-booking";
import { detectPlatform } from "@/lib/userAgent/detectPlatform";
import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { getClientAppSurfaceStyle } from "@/src/shared/tamagui/clientAppTheme";

type LinkHandlerProps = {
  nanoId: string;
};

type LinkState =
  | { status: "loading" }
  | { status: "unavailable" }
  | { status: "error"; message: string };

const CANONICAL_CONSUMER_ORIGIN = "https://maetry.com";
const CONSUMER_APP_STORE_URL =
  "https://apps.apple.com/app/apple-store/id6746678571";
const BUSINESS_APP_STORE_URL =
  "https://apps.apple.com/app/apple-store/id6755662689";
const SHORT_LINK_SPINNER_SIZE = 36;

function ShortLinkSpinner() {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg
      aria-label="Loading"
      height={SHORT_LINK_SPINNER_SIZE}
      role="progressbar"
      style={{
        color: "#007AFF",
        display: "block",
        flex: `0 0 ${SHORT_LINK_SPINNER_SIZE}px`,
        height: SHORT_LINK_SPINNER_SIZE,
        width: SHORT_LINK_SPINNER_SIZE,
      }}
      viewBox="0 0 32 32"
      width={SHORT_LINK_SPINNER_SIZE}
    >
      <circle
        cx="16"
        cy="16"
        fill="none"
        opacity="0.2"
        r={radius}
        stroke="currentColor"
        strokeWidth="4"
      />
      <circle
        cx="16"
        cy="16"
        fill="none"
        r={radius}
        stroke="currentColor"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * 0.75}
        strokeLinecap="round"
        strokeWidth="4"
      >
        <animateTransform
          attributeName="transform"
          dur="0.75s"
          from="0 16 16"
          repeatCount="indefinite"
          to="360 16 16"
          type="rotate"
        />
      </circle>
    </svg>
  );
}

function resolveLinkError(error: unknown, fallbackMessage: string) {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function isUnavailableLinkError(error: unknown) {
  return (
    error instanceof NotFoundError ||
    (error instanceof ApiError && (error.status === 404 || error.status === 410))
  );
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

function AppStoreAction({
  description,
  icon,
  label,
  primary = false,
  url,
}: {
  description: string;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
  url: string;
}) {
  return (
    <YStack gap="$3" width="100%">
      <XStack alignItems="flex-start" gap="$3">
        <XStack
          alignItems="center"
          backgroundColor="$primarySoft"
          borderRadius={14}
          height={44}
          justifyContent="center"
          width={44}
        >
          <Text color="$primary">{icon}</Text>
        </XStack>
        <Paragraph
          color="$textSecondary"
          flex={1}
          fontSize={15}
          lineHeight={21}
        >
          {description}
        </Paragraph>
      </XStack>
      <Button
        backgroundColor={primary ? "$primary" : "$cardBackground"}
        borderColor={primary ? "$primary" : "$separator"}
        borderRadius={14}
        borderWidth={primary ? 0 : 1}
        minHeight={52}
        onPress={() => window.location.assign(url)}
        paddingHorizontal="$4"
      >
        <XStack alignItems="center" gap="$2">
          <Text
            color={primary ? "white" : "$textPrimary"}
            fontSize={16}
            fontWeight="700"
          >
            {label}
          </Text>
          <Text color={primary ? "white" : "$textSecondary"}>
            <ArrowUpRight size={18} />
          </Text>
        </XStack>
      </Button>
    </YStack>
  );
}

function UnavailableLinkScreen() {
  const t = useTranslations("linkHandler.unavailable");
  const themeName = useThemeName();
  const isDarkTheme = themeName.includes("dark");

  return (
    <YStack
      alignItems="center"
      flex={1}
      justifyContent="center"
      minHeight="100dvh"
      paddingBottom="max(32px, env(safe-area-inset-bottom))"
      paddingHorizontal="$5"
      paddingTop="max(32px, env(safe-area-inset-top))"
      width="100%"
    >
      <YStack gap="$7" maxWidth={480} width="100%">
        <YStack alignItems="center" gap="$5">
          <Image
            alt="Maetry"
            height={22}
            priority
            src="/images/logo.svg"
            style={{
              display: "block",
              filter: isDarkTheme ? "invert(1)" : undefined,
              height: "auto",
              width: 112,
            }}
            width={112}
          />

          <YStack alignItems="center" gap="$3">
            <XStack
              alignItems="center"
              backgroundColor="$primarySoft"
              borderRadius={999}
              height={64}
              justifyContent="center"
              width={64}
            >
              <Text color="$primary">
                <MapPinOff size={29} strokeWidth={1.8} />
              </Text>
            </XStack>
            <YStack alignItems="center" gap="$2">
              <Text
                color="$textPrimary"
                fontSize={28}
                fontWeight="800"
                lineHeight={34}
                textAlign="center"
              >
                {t("title")}
              </Text>
              <Paragraph
                color="$textSecondary"
                fontSize={16}
                lineHeight={23}
                maxWidth={380}
                textAlign="center"
              >
                {t("description")}
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>

        <YStack
          gap="$5"
          width="100%"
        >
          <AppStoreAction
            description={t("consumerDescription")}
            icon={<Search size={21} />}
            label={t("consumerAction")}
            primary
            url={CONSUMER_APP_STORE_URL}
          />
          <YStack backgroundColor="$separator" height={1} width="100%" />
          <AppStoreAction
            description={t("businessDescription")}
            icon={<BriefcaseBusiness size={21} />}
            label={t("businessAction")}
            url={BUSINESS_APP_STORE_URL}
          />
        </YStack>
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

        if (isUnavailableLinkError(error)) {
          setState({ status: "unavailable" });
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
        icon={<ShortLinkSpinner />}
        plain
        title=""
        description=""
      />
    );
  }

  if (state.status === "unavailable") {
    return <UnavailableLinkScreen />;
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
