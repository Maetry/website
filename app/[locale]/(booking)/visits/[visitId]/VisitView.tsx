"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import {
  AppRoot,
  Avatar,
  Button,
  Cell,
  List,
  Placeholder,
  Section,
  Spinner,
} from "@telegram-apps/telegram-ui";
import { useTranslations } from "next-intl";

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
      <AppRoot>
        <Placeholder
          header={t("loading.confirmation")}
          description={t("successBookingHint")}
        >
          <Spinner size="m" />
        </Placeholder>
      </AppRoot>
    );
  }

  if (error || !appointment) {
    return (
      <AppRoot>
        <Placeholder
          header={t("errors.createAppointment")}
          description={error ?? t("errors.createAppointment")}
          action={
            <Button size="l" onClick={() => window.location.reload()}>
              {t("backLabel")}
            </Button>
          }
        />
      </AppRoot>
    );
  }

  return (
    <AppRoot>
      <List>
        <Section>
          <Cell
            before={
              <Avatar
                size={48}
                src={salonIcon ?? undefined}
                acronym={getInitials(salonName ?? t("salonFallbackName"))}
              />
            }
            subtitle={appointmentDate ?? undefined}
          >
            {salonName ?? t("salonFallbackName")}
          </Cell>
        </Section>

        <Section header={t("successTitle")} footer={t("successSubtitle")}>
          {procedure ? (
            <Cell
              multiline
              subhead={t("summaryService")}
              subtitle={procedure.masterNickname ?? t("masterAny")}
              after={appointmentPrice ?? undefined}
            >
              {procedure.serviceTitle ?? procedure.serviceDescription ?? t("headline")}
            </Cell>
          ) : null}

          {appointmentDate ? (
            <Cell
              multiline
              subhead={t("summaryDate")}
              subtitle={appointmentTime ?? undefined}
            >
              {appointmentDate}
            </Cell>
          ) : null}

          <Cell
            multiline
            subhead={t("summarySalon")}
            subtitle={appointmentPrice ?? undefined}
          >
            {salonName ?? t("salonFallbackName")}
          </Cell>
        </Section>

        <Section>
          <Button size="l" stretched onClick={handleCreateAnother}>
            {t("successCreateAnother")}
          </Button>
        </Section>

        {appleWalletUrl || googleWalletUrl ? (
          <Section>
            {appleWalletUrl ? (
              <Button
                size="l"
                stretched
                mode="outline"
                onClick={() => handleOpenWallet(appleWalletUrl)}
              >
                {t("walletApple")}
              </Button>
            ) : null}
            {googleWalletUrl ? (
              <Button
                size="l"
                stretched
                mode="outline"
                onClick={() => handleOpenWallet(googleWalletUrl)}
              >
                {t("walletGoogle")}
              </Button>
            ) : null}
          </Section>
        ) : null}
      </List>
    </AppRoot>
  );
}

export default VisitView;
