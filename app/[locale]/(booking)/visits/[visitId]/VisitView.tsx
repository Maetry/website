"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";
import {
  Avatar,
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

function getInitials(value?: string | null) {
  if (!value) {
    return "M";
  }

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) {
    return "M";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

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

export function VisitView({ visitId, locale }: VisitViewProps) {
  const t = useTranslations("booking");
  const router = useRouter();

  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salonIcon, setSalonIcon] = useState<string | null>(null);
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

        if (appointmentData.salonIcon) {
          setSalonIcon(appointmentData.salonIcon);
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
        backgroundColor="$background"
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
        backgroundColor="$background"
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
    <YStack backgroundColor="$background" flex={1}>
      <YStack alignSelf="center" gap="$4" maxWidth={560} padding="$4" width="100%">
        <YStack
          alignItems="center"
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$6"
          borderWidth={1}
          gap="$3"
          padding="$4"
        >
          <Avatar circular size="$6">
            <Avatar.Image src={salonIcon ?? undefined} />
            <Avatar.Fallback alignItems="center" justifyContent="center">
              <Text fontSize="$5" fontWeight="800">
                {getInitials(salonName ?? t("salonFallbackName"))}
              </Text>
            </Avatar.Fallback>
          </Avatar>
          <YStack gap="$1">
            <Text fontSize="$8" fontWeight="800" textAlign="center">
              {t("successTitle")}
            </Text>
            <Paragraph color="$color11" textAlign="center">
              {t("successSubtitle")}
            </Paragraph>
            <Text fontSize="$6" fontWeight="700" textAlign="center">
              {salonName ?? t("salonFallbackName")}
            </Text>
            {appointmentDate ? (
              <Paragraph color="$color11" size="$3" textAlign="center">
                {appointmentDate}
              </Paragraph>
            ) : null}
          </YStack>
        </YStack>

        <YStack
          backgroundColor="$background"
          borderColor="$borderColor"
          borderRadius="$6"
          borderWidth={1}
          overflow="hidden"
        >
          {procedure ? (
            <YStack padding="$3">
              <XStack justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color11" fontSize="$2" textTransform="uppercase">
                    {t("summaryService")}
                  </Text>
                  <Text fontSize="$5" fontWeight="600">
                    {procedure.serviceTitle ??
                      procedure.serviceDescription ??
                      t("headline")}
                  </Text>
                  <Paragraph color="$color11" size="$3">
                    {procedure.masterNickname ?? t("masterAny")}
                  </Paragraph>
                </YStack>
                {appointmentPrice ? (
                  <Text color="$color11" fontSize="$3">
                    {appointmentPrice}
                  </Text>
                ) : null}
              </XStack>
              <Separator marginTop="$3" />
            </YStack>
          ) : null}

          {appointmentDate ? (
            <YStack padding="$3">
              <XStack justifyContent="space-between">
                <YStack flex={1} gap="$1">
                  <Text color="$color11" fontSize="$2" textTransform="uppercase">
                    {t("summaryDate")}
                  </Text>
                  <Text fontSize="$5" fontWeight="600">
                    {appointmentDate}
                  </Text>
                  {appointmentTime ? (
                    <Paragraph color="$color11" size="$3">
                      {appointmentTime}
                    </Paragraph>
                  ) : null}
                </YStack>
              </XStack>
              <Separator marginTop="$3" />
            </YStack>
          ) : null}

          <YStack padding="$3">
            <XStack justifyContent="space-between">
              <YStack flex={1} gap="$1">
                <Text color="$color11" fontSize="$2" textTransform="uppercase">
                  {t("summarySalon")}
                </Text>
                <Text fontSize="$5" fontWeight="600">
                  {salonName ?? t("salonFallbackName")}
                </Text>
                {appointmentPrice ? (
                  <Paragraph color="$color11" size="$3">
                    {appointmentPrice}
                  </Paragraph>
                ) : null}
              </YStack>
            </XStack>
          </YStack>
        </YStack>

        <Button onPress={handleCreateAnother} width="100%">
          {t("successCreateAnother")}
        </Button>

        {appleWalletUrl || googleWalletUrl ? (
          <YStack gap="$3">
            {appleWalletUrl ? (
              <Button
                onPress={() => handleOpenWallet(appleWalletUrl)}
                variant="outlined"
                width="100%"
              >
                {t("walletApple")}
              </Button>
            ) : null}
            {googleWalletUrl ? (
              <Button
                onPress={() => handleOpenWallet(googleWalletUrl)}
                variant="outlined"
                width="100%"
              >
                {t("walletGoogle")}
              </Button>
            ) : null}
          </YStack>
        ) : null}
      </YStack>
    </YStack>
  );
}

export default VisitView;
