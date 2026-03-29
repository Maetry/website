"use client";

import { useEffect, useMemo, useState } from "react";

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
  BookingApiError,
  getAppointment,
  getSalonProcedures,
  type AppointmentResponse,
  type Procedure,
} from "@/lib/api/booking";

type VisitViewProps = {
  /** Идентификатор визита в URL; для API совпадает с appointmentId. */
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

const getWalletUrl = (response: AppointmentResponse | null) => {
  if (!response) {
    return { apple: undefined, google: undefined };
  }

  const apple =
    response.appleWalletUrl ??
    response.wallet?.apple ??
    response.walletLinks?.apple;
  const google =
    response.googleWalletUrl ??
    response.wallet?.google ??
    response.walletLinks?.google;

  return { apple, google };
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

  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salonName, setSalonName] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [timeZoneId] = useState<string>("UTC");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const appointmentData = await getAppointment({
          appointmentId: visitId,
        });
        setAppointment(appointmentData);

        if (appointmentData.salonId) {
          setSalonId(appointmentData.salonId);
        }

        if (appointmentData.salonName) {
          setSalonName(appointmentData.salonName);
        }
        if (appointmentData.procedureId && appointmentData.salonId) {
          try {
            const proceduresData = await getSalonProcedures({
              salonId: appointmentData.salonId,
              locale,
            });
            setProcedures(
              Array.isArray(proceduresData?.procedures)
                ? proceduresData.procedures
                : [],
            );
          } catch {
            setProcedures([]);
          }
        }
      } catch (err) {
        const message = err instanceof BookingApiError ? err.message : undefined;
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
  }, [visitId, locale, t]);

  const procedure = useMemo(() => {
    if (!appointment?.procedureId) {
      return null;
    }

    return procedures.find((item) => item.id === appointment.procedureId) ?? null;
  }, [appointment?.procedureId, procedures]);

  const { apple: appleWalletUrl, google: googleWalletUrl } = getWalletUrl(appointment);

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

  const handleOpenWallet = (url?: string) => {
    if (!url || typeof window === "undefined") {
      return;
    }

    window.location.assign(url);
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
              {procedure?.serviceTitle ?? procedure?.serviceDescription ?? t("headline")}
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
            {procedure ? (
              <YStack gap="$3">
                <VisitInfoRow
                  icon={<WalletCards size={18} />}
                  label={t("summaryService")}
                  value={
                    procedure.serviceTitle ??
                    procedure.serviceDescription ??
                    t("headline")
                  }
                />
                <VisitInfoRow
                  icon={<CheckCircle2 size={18} />}
                  label={t("summarySpecialist")}
                  value={procedure.masterNickname ?? t("masterAny")}
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

            {procedure ? <Separator /> : null}

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

        {appleWalletUrl || googleWalletUrl ? (
          <YStack
            backgroundColor="$cardBackground"
            borderRadius="$8"
            gap="$3"
            padding="$4"
          >
            <Text color="$textPrimary" fontSize="$6" fontWeight="700">
              Wallet
            </Text>
            <Paragraph color="$textSecondary" size="$3">
              {t("successBookingHint")}
            </Paragraph>
            {appleWalletUrl ? (
              <Button
                backgroundColor="$primary"
                borderRadius={999}
                onPress={() => handleOpenWallet(appleWalletUrl)}
                width="100%"
              >
                <Text color="white" fontSize="$4" fontWeight="600">
                  {t("walletApple")}
                </Text>
              </Button>
            ) : null}
            {googleWalletUrl ? (
              <Button
                backgroundColor="$cardBackground"
                borderColor="$separator"
                borderRadius={999}
                borderWidth={1}
                onPress={() => handleOpenWallet(googleWalletUrl)}
                width="100%"
              >
                <Text color="$textPrimary" fontSize="$4" fontWeight="600">
                  {t("walletGoogle")}
                </Text>
              </Button>
            ) : null}
          </YStack>
        ) : null}

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
