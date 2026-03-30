"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
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

import {
  ApiError,
} from "@/lib/api/error-handler";
import {
  getPublicBooking,
  type PublicBookingVisit,
} from "@/lib/api/public-booking";

type VisitViewProps = {
  /** Идентификатор public visit в URL; используется как booking/visit id. */
  visitId: string;
  locale: string;
};

const formatCurrency = (
  amount?: number | null,
  currency?: string | null,
  locale?: string,
) => {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  try {
    return new Intl.NumberFormat(locale ?? "en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
};

function VisitInfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <XStack alignItems="flex-start" gap="$3">
      {icon ? (
        <XStack
          alignItems="center"
          backgroundColor="rgba(0,122,255,0.08)"
          borderRadius="$4"
          height={36}
          justifyContent="center"
          width={36}
        >
          <Text color="$primary">{icon}</Text>
        </XStack>
      ) : null}
      <YStack flex={1} gap="$1">
        <Text color="$textSecondary" fontSize="$2" fontWeight="600" textTransform="uppercase">
          {label}
        </Text>
        <Text color="$textPrimary" fontSize="$5" fontWeight="600" lineHeight={22}>
          {value || "—"}
        </Text>
      </YStack>
    </XStack>
  );
}

function HeaderCircleButton({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <Button
      alignItems="center"
      backgroundColor="rgba(255,255,255,0.92)"
      borderRadius={999}
      chromeless
      height={44}
      justifyContent="center"
      onPress={onPress}
      pressStyle={{ opacity: 0.78 }}
      width={44}
    >
      {children}
    </Button>
  );
}

export function VisitView({ visitId, locale }: VisitViewProps) {
  const t = useTranslations("booking");
  const router = useRouter();

  const [appointment, setAppointment] = useState<PublicBookingVisit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salonName, setSalonName] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [timeZoneId, setTimeZoneId] = useState<string>("UTC");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointmentData = await getPublicBooking(visitId);
        setAppointment(appointmentData);
        setTimeZoneId(appointmentData.timezoneId || "UTC");

        if (appointmentData.salonId) {
          setSalonId(appointmentData.salonId);
        }

        if (appointmentData.salonName) {
          setSalonName(appointmentData.salonName);
        }
      } catch (err) {
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
        setLoading(false);
      }
    };

    void fetchData();
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

  const handleCreateAnother = () => {
    if (salonId) {
      router.push(`/${locale}/booking/${salonId}`);
      return;
    }

    router.push(`/${locale}/booking`);
  };

  if (loading) {
    return (
      <YStack
        alignItems="center"
        backgroundColor="$appBackground"
        flex={1}
        justifyContent="center"
        padding="$6"
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
    <YStack
      backgroundColor="$appBackground"
      flex={1}
      style={{
        background:
          "linear-gradient(180deg, rgba(242,242,247,0.96) 0%, rgba(233,233,238,1) 100%)",
      }}
    >
      <YStack alignSelf="center" gap="$4" maxWidth={560} padding="$4" width="100%">
        <YStack gap="$3">
          <XStack alignSelf="center" backgroundColor="rgba(60,60,67,0.18)" borderRadius={999} height={5} width={46} />
          <XStack alignItems="center" justifyContent="space-between">
            <HeaderCircleButton onPress={() => (salonId ? router.push(`/${locale}/booking/${salonId}`) : router.push(`/${locale}/booking`))}>
              <Text color="$textPrimary">
                <ChevronLeft size={20} />
              </Text>
            </HeaderCircleButton>
            <Text color="$textPrimary" fontSize="$5" fontWeight="700">
              {t("summaryTitle")}
            </Text>
            <HeaderCircleButton>
              <Text color="$primary">
                <Check size={20} />
              </Text>
            </HeaderCircleButton>
          </XStack>

          <YStack alignItems="center" gap="$1.5" paddingHorizontal="$3">
            <Text color="$textPrimary" fontSize="$9" fontWeight="800" textAlign="center">
              {appointment.procedureName ?? t("headline")}
            </Text>
            <Paragraph color="#ff5a5f" fontSize="$4" fontWeight="500" textAlign="center">
              {salonName ?? t("salonFallbackName")}
            </Paragraph>
            {appointmentDate ? (
              <Text color="$textPrimary" fontSize="$5" fontWeight="600" textAlign="center">
                {appointmentDate}
              </Text>
            ) : null}
            {appointmentTime ? (
              <Paragraph color="$textSecondary" textAlign="center">
                {appointmentTime}
              </Paragraph>
            ) : null}
          </YStack>
        </YStack>

        <YStack
          backgroundColor="$cardBackground"
          borderRadius="$8"
          overflow="hidden"
          padding="$4"
        >
          <YStack gap="$4">
            {appointment.procedureName ? (
              <YStack gap="$3">
                <VisitInfoRow
                  icon={<WalletCards size={18} />}
                  label={t("summaryService")}
                  value={appointment.procedureName}
                />
                <VisitInfoRow
                  icon={<CheckCircle2 size={18} />}
                  label={t("summarySpecialist")}
                  value={appointment.masterNickname ?? t("masterAny")}
                />
                {appointmentPrice ? (
                  <VisitInfoRow
                    icon={<WalletCards size={18} />}
                    label={t("summaryPrice")}
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
                  value={appointmentDate}
                />
                {appointmentTime ? (
                  <VisitInfoRow
                    icon={<Clock3 size={18} />}
                    label={t("summaryTime")}
                    value={appointmentTime}
                  />
                ) : null}
              </YStack>
            ) : null}

            {appointmentDate ? <Separator /> : null}

            <VisitInfoRow
              icon={<MapPin size={18} />}
              label={t("summarySalon")}
              value={salonName ?? t("salonFallbackName")}
            />
          </YStack>
        </YStack>

        <Button
          backgroundColor="rgba(255,255,255,0.92)"
          borderRadius={999}
          onPress={handleCreateAnother}
          width={170}
          alignSelf="center"
        >
          <Text color="#ff4d4f" fontSize="$4" fontWeight="500">
            {t("successCreateAnother")}
          </Text>
        </Button>
      </YStack>
    </YStack>
  );
}

export default VisitView;
