"use client";

import { useEffect, useState } from "react";

import Image from "next/image";

import {
  ArrowUpRight,
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  MapPin,
  WalletCards,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Button,
  Paragraph,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
} from "tamagui";

import { AddToAppleWalletBadge } from "@/components/wallet";
import {
  ApiError,
} from "@/lib/api/error-handler";
import {
  waitForPublicBooking,
  type PublicBookingVisit,
} from "@/lib/api/public-booking";
import { isAbortError } from "@/lib/api/utils";
import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import appStoreBadge from "@/public/images/appstore.svg";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";

import { formatCurrency } from "../../_shared/formatting";

const APP_STORE_URL = "https://apps.apple.com/app/id6746678571";

type VisitViewProps = {
  /** Идентификатор public visit в URL; используется как booking/visit id. */
  visitId: string;
  locale: string;
};

function VisitInfoRow({
  icon,
  label,
  platform,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  platform: "android" | "ios";
  value?: string | null;
}) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <XStack alignItems="center" gap="$2">
      {icon ? (
        <XStack
          alignItems="center"
          backgroundColor="$primarySoft"
          borderRadius={surface.visit.iconBadgeRadius}
          flexShrink={0}
          height={surface.visit.iconBadgeSize}
          justifyContent="center"
          width={surface.visit.iconBadgeSize}
        >
          <Text color="$primary">{icon}</Text>
        </XStack>
      ) : null}
      <YStack flex={1} gap={0}>
        <Paragraph color="$textSecondary" marginBottom={0} marginTop={0}>
          {label}
        </Paragraph>
        <Paragraph color="$textPrimary" flex={1} marginBottom={0} marginTop={0}>
          {value || "—"}
        </Paragraph>
      </YStack>
    </XStack>
  );
}

function SecondaryActionButton({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Button
      alignItems="center"
      backgroundColor="$chromeBackground"
      borderRadius={16}
      chromeless
      justifyContent="flex-start"
      onPress={onPress}
      paddingHorizontal="$4"
      paddingVertical="$3.5"
      pressStyle={{ opacity: 0.82 }}
      width="100%"
    >
      <XStack alignItems="center" gap="$3">
        <Text color="$primary">{icon}</Text>
        <Text color="$textPrimary" fontSize="$5" fontWeight="600">
          {label}
        </Text>
      </XStack>
    </Button>
  );
}

export function VisitView({ visitId, locale }: VisitViewProps) {
  const t = useTranslations("booking");
  const platformInfo = usePlatform();
  const platform = platformInfo.isAndroid ? "android" : "ios";
  const surface = getBookingSurfaceStyle(platform);

  const [appointment, setAppointment] = useState<PublicBookingVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salonName, setSalonName] = useState<string | null>(null);
  const [timeZoneId, setTimeZoneId] = useState<string>("UTC");

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointmentData = await waitForPublicBooking(visitId, {
          retryDelaysMs: [200, 400, 800, 1_200],
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setAppointment(appointmentData);
        setTimeZoneId(appointmentData.timezoneId || "UTC");

        if (appointmentData.salonName) {
          setSalonName(appointmentData.salonName);
        }
      } catch (err) {
        if (controller.signal.aborted || isAbortError(err)) {
          return;
        }

        const message =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
              ? err.message
              : undefined;
        setError(
          message
            ? t("errors.apiMessage", { message })
            : t("errors.createAppointment"),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      controller.abort();
    };
  }, [visitId, t]);

  const appointmentDate = appointment?.time?.start
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "long",
        timeZone: timeZoneId,
        weekday: "long",
      }).format(new Date(appointment.time.start))
    : null;

  const appointmentTime = appointment?.time?.start
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        timeZone: timeZoneId,
      }).format(new Date(appointment.time.start))
    : null;

  const appointmentPrice = formatCurrency(
    appointment?.price?.amount,
    appointment?.price?.currency,
    locale,
  );
  const appointmentTitle = appointment?.procedureName ?? t("headline");
  const appointmentSalonName = salonName ?? t("salonFallbackName");
  const appointmentDateTime =
    appointmentDate && appointmentTime
      ? `${appointmentDate} • ${appointmentTime}`
      : appointmentDate ?? appointmentTime;
  const preferredWalletType =
    platformInfo.isAndroid || platformInfo.isDesktop ? "google" : "apple";
  const walletLabel =
    preferredWalletType === "google" ? t("walletGoogle") : t("walletApple");
  const isApplePlatform = platformInfo.isIOS || platformInfo.isMacOS;
  const mapsUrl = appointment?.salonAddress
    ? platformInfo.isIOS || platformInfo.isMacOS
      ? `https://maps.apple.com/?q=${encodeURIComponent(appointmentSalonName)}&address=${encodeURIComponent(appointment.salonAddress)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${appointmentSalonName} ${appointment.salonAddress}`)}`
    : null;
  const calendarUrl =
    appointment?.time?.start
      ? (() => {
          const startDate = new Date(appointment.time.start);
          const endDate = appointment.time.end
            ? new Date(appointment.time.end)
            : new Date(startDate.getTime() + 60 * 60 * 1000);
          const formatCalendarDate = (value: Date) =>
            value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

          const description = t("successProcedureAt", {
            procedure: appointmentTitle,
            salon: appointmentSalonName,
          });

          return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(appointmentTitle)}&dates=${formatCalendarDate(startDate)}/${formatCalendarDate(endDate)}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(appointment.salonAddress ?? appointmentSalonName)}`;
        })()
      : null;

  const openExternal = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownloadApp = () => {
    openExternal(APP_STORE_URL);
  };

  const handleAddToWallet = () => {
    if (!appointment?.appointmentId) {
      return;
    }

    window.location.href = `/api/wallet/${preferredWalletType}?id=${encodeURIComponent(appointment.appointmentId)}`;
  };

  if (loading) {
    return (
      <YStack
        alignItems="center"
        backgroundColor="$appBackground"
        flex={1}
        justifyContent="center"
        padding="$6"
        style={{
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <YStack alignItems="center" gap="$3" maxWidth={420}>
          <Spinner />
          <Text fontSize="$7" fontWeight="700" textAlign="center">
            {t("loading.confirmation")}
          </Text>
          <Paragraph color="$color11" textAlign="center">
            {t("successBookingHint")}
          </Paragraph>
        </YStack>
      </YStack>
    );
  }

  if (error || !appointment) {
    return (
      <YStack
        alignItems="center"
        backgroundColor="$appBackground"
        flex={1}
        justifyContent="center"
        padding="$6"
        style={{
          paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <YStack alignItems="center" gap="$3" maxWidth={420}>
          <Text fontSize="$7" fontWeight="700" textAlign="center">
            {t("errors.createAppointment")}
          </Text>
          <Paragraph color="$color11" textAlign="center">
            {error ?? t("errors.createAppointment")}
          </Paragraph>
          <Button onPress={() => window.location.reload()}>{t("backLabel")}</Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack backgroundColor="$appBackground" flex={1}>
      <YStack
        alignSelf="center"
        gap="$4"
        maxWidth={560}
        padding="$4"
        style={{
          paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
        width="100%"
      >
        <YStack alignItems="center" gap="$2" paddingHorizontal="$3" paddingTop="$2">
          <XStack
            alignItems="center"
            backgroundColor="$primarySoft"
            borderRadius={999}
            height={64}
            justifyContent="center"
            width={64}
          >
            <Text color="$primary">
              <CheckCircle2 size={30} />
            </Text>
          </XStack>
          <Text color="$textPrimary" fontSize="$8" fontWeight="800" textAlign="center">
            {t("successTitle")}
          </Text>
          {appointmentDateTime ? (
            <Text color="$textPrimary" fontSize="$5" fontWeight="700" textAlign="center">
              {appointmentDateTime}
            </Text>
          ) : null}
          <Paragraph color="$textSecondary" fontSize="$4" textAlign="center">
            {t("successProcedureAt", {
              procedure: appointmentTitle,
              salon: appointmentSalonName,
            })}
          </Paragraph>
        </YStack>

        <YStack
          backgroundColor="$cardBackground"
          borderRadius={surface.visit.cardRadius}
          gap="$3"
          padding="$4"
        >
          <YStack gap="$1.5">
            <Text color="$textPrimary" fontSize="$6" fontWeight="800">
              {t("successManageTitle")}
            </Text>
            <Paragraph color="$textSecondary">
              {t("successManageSubtitle")}
            </Paragraph>
          </YStack>

          <YStack gap="$2">
            <XStack alignItems="flex-start" gap="$2.5">
              <Text color="$primary" fontSize="$5" lineHeight={20}>
                •
              </Text>
              <Paragraph color="$textPrimary" flex={1}>
                {t("successManageBulletReminders")}
              </Paragraph>
            </XStack>
            <XStack alignItems="flex-start" gap="$2.5">
              <Text color="$primary" fontSize="$5" lineHeight={20}>
                •
              </Text>
              <Paragraph color="$textPrimary" flex={1}>
                {t("successManageBulletReschedule")}
              </Paragraph>
            </XStack>
            <XStack alignItems="flex-start" gap="$2.5">
              <Text color="$primary" fontSize="$5" lineHeight={20}>
                •
              </Text>
              <Paragraph color="$textPrimary" flex={1}>
                {t("successManageBulletBookings")}
              </Paragraph>
            </XStack>
          </YStack>

          <a
            href={APP_STORE_URL}
            rel="noopener noreferrer"
            target="_blank"
            aria-label={t("successDownloadApp")}
            onClick={(event) => {
              event.preventDefault();
              handleDownloadApp();
            }}
            style={{
              backgroundColor: "#13131A",
              borderRadius: 16,
              display: "block",
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                alignItems: "center",
                display: "flex",
                height: 52,
                justifyContent: "center",
                width: "100%",
              }}
            >
              <Image
                alt={t("successDownloadApp")}
                height={41}
                priority={false}
                src={appStoreBadge}
                style={{
                  display: "block",
                  height: "auto",
                  maxHeight: 52,
                  maxWidth: "100%",
                  objectFit: "contain",
                  width: "auto",
                }}
                width={140}
              />
            </div>
          </a>
        </YStack>

        <YStack
          backgroundColor="$cardBackground"
          borderRadius={surface.visit.cardRadius}
          overflow="hidden"
          padding="$4"
        >
          <YStack gap="$4">
            <Text color="$textPrimary" fontSize="$6" fontWeight="800">
              {t("successDetailsTitle")}
            </Text>
            {appointment.procedureName ? (
              <YStack gap="$3">
                <VisitInfoRow
                  icon={<WalletCards size={18} />}
                  label={t("summaryService")}
                  platform={platform}
                  value={appointment.procedureName}
                />
                <VisitInfoRow
                  icon={<CheckCircle2 size={18} />}
                  label={t("summarySpecialist")}
                  platform={platform}
                  value={appointment.masterNickname ?? t("masterAny")}
                />
                {appointmentPrice ? (
                  <VisitInfoRow
                    icon={<WalletCards size={18} />}
                    label={t("summaryPrice")}
                    platform={platform}
                    value={appointmentPrice}
                  />
                ) : null}
              </YStack>
            ) : null}

            {appointment.procedureName ? <Separator /> : null}

            {appointmentDate ? (
              <YStack gap="$3">
                <VisitInfoRow
                  icon={<CalendarDays size={18} />}
                  label={t("summaryDate")}
                  platform={platform}
                  value={appointmentDate}
                />
                {appointmentTime ? (
                  <VisitInfoRow
                    icon={<Clock3 size={18} />}
                    label={t("summaryTime")}
                    platform={platform}
                    value={appointmentTime}
                  />
                ) : null}
              </YStack>
            ) : null}

            {appointmentDate ? <Separator /> : null}

            <VisitInfoRow
              icon={<MapPin size={18} />}
              label={t("summarySalon")}
              platform={platform}
              value={salonName ?? t("salonFallbackName")}
            />
          </YStack>
        </YStack>

        <YStack gap="$2.5">
          {appointment.appointmentId && isApplePlatform ? (
            <XStack justifyContent="center">
              <AddToAppleWalletBadge passId={appointment.appointmentId} />
            </XStack>
          ) : null}
          {appointment.appointmentId && !isApplePlatform ? (
            <SecondaryActionButton
              icon={<WalletCards size={18} />}
              label={walletLabel}
              onPress={handleAddToWallet}
            />
          ) : null}
          {calendarUrl ? (
            <SecondaryActionButton
              icon={<CalendarPlus size={18} />}
              label={t("successAddToCalendar")}
              onPress={() => openExternal(calendarUrl)}
            />
          ) : null}
          {mapsUrl ? (
            <SecondaryActionButton
              icon={<MapPin size={18} />}
              label={t("successOpenInMaps")}
              onPress={() => openExternal(mapsUrl)}
            />
          ) : null}
        </YStack>

        <Button
          alignItems="center"
          backgroundColor="transparent"
          chromeless
          justifyContent="center"
          onPress={() => openExternal(`mailto:support@maetry.com?subject=${encodeURIComponent(`${appointmentSalonName} booking help`)}`)}
          paddingVertical="$2"
        >
          <XStack alignItems="center" gap="$2">
            <Text color="$textSecondary" fontSize="$3" fontWeight="600">
              {t("successHelpAction")}
            </Text>
            <Text color="$textSecondary">
              <ArrowUpRight size={14} />
            </Text>
          </XStack>
        </Button>
      </YStack>
    </YStack>
  );
}

export default VisitView;
