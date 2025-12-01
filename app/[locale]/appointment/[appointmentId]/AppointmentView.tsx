"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { useTranslations } from "next-intl";

import { AddToAppleWalletBadge, AddToGoogleWalletBadge } from "@/components/wallet";
import {
  BookingApiError,
  getAppointment,
  getSalonProcedures,
  type AppointmentResponse,
  type Procedure,
} from "@/lib/api/booking";

type AppointmentViewProps = {
  appointmentId: string;
  locale: string;
};

const formatCurrency = (
  amount?: number | null,
  currency?: string | null,
  locale?: string
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

const AppointmentView = ({ appointmentId, locale }: AppointmentViewProps) => {
  const t = useTranslations("booking");
  const router = useRouter();

  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salonIcon, setSalonIcon] = useState<string | null>(null);
  const [salonName, setSalonName] = useState<string | null>(null);
  const [salonId, setSalonId] = useState<string | null>(null);
  const [timeZoneId, setTimeZoneId] = useState<string>("UTC");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Получаем информацию о записи
        const appointmentData = await getAppointment({
          appointmentId,
        });
        setAppointment(appointmentData);

        // Если в ответе есть salonId, сохраняем его
        if (appointmentData.salonId) {
          setSalonId(appointmentData.salonId);
        }

        // Если в ответе есть информация о салоне, сохраняем её
        if (appointmentData.salonName) {
          setSalonName(appointmentData.salonName);
        }
        if (appointmentData.salonIcon) {
          setSalonIcon(appointmentData.salonIcon);
        }

        // Если есть procedureId и salonId, получаем информацию о процедуре
        if (appointmentData.procedureId && appointmentData.salonId) {
          try {
            const proceduresData = await getSalonProcedures({
              salonId: appointmentData.salonId,
              locale,
            });
            setProcedures(Array.isArray(proceduresData?.procedures) ? proceduresData.procedures : []);
          } catch {
            // Игнорируем ошибку получения процедур
          }
        }

        // TODO: получить timeZoneId из appointment или процедуры
        // Пока используем UTC
        setTimeZoneId("UTC");
      } catch (err) {
        console.error(err);
        const message =
          err instanceof BookingApiError ? err.message : undefined;
        setError(
          message
            ? t("errors.apiMessage", { message })
            : t("errors.createAppointment")
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [appointmentId, locale, t]);

  const procedure = useMemo(() => {
    if (!appointment?.procedureId) {
      return null;
    }
    return procedures.find((p) => p.id === appointment.procedureId) ?? null;
  }, [appointment?.procedureId, procedures]);

  const { apple: appleWalletUrl, google: googleWalletUrl } = getWalletUrl(appointment);

  const headline = salonName
    ? `${t("headline")} в ${salonName}`
    : t("headline");

  const handleCreateAnother = () => {
    if (salonId) {
      router.push(`/${locale}/booking/${salonId}`);
    } else {
      // Если salonId неизвестен, просто редиректим на главную booking
      router.push(`/${locale}/booking`);
    }
  };

  if (loading) {
    return (
      <div 
        className="fixed flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6b68e] via-[#cf9bff] to-[#6672ff]"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 'max(env(safe-area-inset-top), 2.5rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)',
          paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
          paddingRight: 'max(env(safe-area-inset-right), 1rem)',
        }}
      >
        <div className="absolute inset-0 -z-10 opacity-80" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), transparent 55%)" }} />
        <div className="absolute inset-0 -z-20 bg-[url('/images/featureBG.svg')] bg-cover bg-center opacity-10" />

        <div className="relative w-full min-w-[280px] max-w-[620px] rounded-[36px] border border-white/40 bg-white/80 p-6 text-slate-900 shadow-[0_55px_120px_rgba(49,45,105,0.35)] backdrop-blur-2xl sm:p-10">
          {/* Header skeleton */}
          <header className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-[20%] bg-slate-200 sm:h-10 sm:w-10" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 sm:h-5" />
              </div>
            </div>
          </header>

          <div className="mt-6 space-y-5">
            {/* Title and subtitle skeleton */}
            <div className="space-y-2">
              <div className="h-7 w-2/3 animate-pulse rounded bg-slate-200 sm:h-6" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 sm:h-3" />
            </div>

            {/* Appointment info card skeleton */}
            <div className="rounded-3xl border border-slate-100 bg-white p-4">
              <div className="space-y-3">
                <div className="h-6 w-1/2 animate-pulse rounded bg-slate-200 sm:h-5" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-1/4 animate-pulse rounded bg-slate-200 sm:h-4" />
              </div>
            </div>

            {/* Button skeleton */}
            <div className="h-14 w-full animate-pulse rounded-full bg-slate-200 sm:min-h-[52px]" />

            {/* Wallet badges skeleton */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <div className="h-12 w-32 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-12 w-32 animate-pulse rounded-lg bg-slate-200" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div 
        className="fixed flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6b68e] via-[#cf9bff] to-[#6672ff]"
        style={{
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          paddingTop: 'max(env(safe-area-inset-top), 2.5rem)',
          paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)',
          paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
          paddingRight: 'max(env(safe-area-inset-right), 1rem)',
        }}
      >
        <div className="relative w-full min-w-[280px] max-w-[620px] rounded-[36px] border border-white/40 bg-white/80 p-6 text-slate-900 shadow-[0_55px_120px_rgba(49,45,105,0.35)] backdrop-blur-2xl sm:p-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-600 sm:text-sm">
            {error ?? t("errors.createAppointment")}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6b68e] via-[#cf9bff] to-[#6672ff]"
      style={{
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: 'max(env(safe-area-inset-top), 2.5rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 2.5rem)',
        paddingLeft: 'max(env(safe-area-inset-left), 1rem)',
        paddingRight: 'max(env(safe-area-inset-right), 1rem)',
      }}
    >
      <div className="absolute inset-0 -z-10 opacity-80" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), transparent 55%)" }} />
      <div className="absolute inset-0 -z-20 bg-[url('/images/featureBG.svg')] bg-cover bg-center opacity-10" />

      <div className="relative w-full min-w-[280px] max-w-[620px] rounded-[36px] border border-white/40 bg-white/80 p-6 text-slate-900 shadow-[0_55px_120px_rgba(49,45,105,0.35)] backdrop-blur-2xl sm:p-10">
        <header className="flex flex-col gap-5 text-slate-900">
          <div className="flex items-center gap-3">
            {salonIcon ? (
              <div className="relative h-12 w-12 flex-shrink-0 aspect-square sm:h-10 sm:w-10">
                <Image
                  src={salonIcon}
                  alt=""
                  fill
                  className="rounded-[20%] object-cover"
                  sizes="48px"
                  onError={() => setSalonIcon(null)}
                />
              </div>
            ) : (
              <div className="h-12 w-12 flex-shrink-0 aspect-square rounded-[20%] border border-slate-200 bg-slate-50 sm:h-10 sm:w-10" />
            )}
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-xl">
                {headline}
              </h1>
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-5 text-slate-900">
          <div>
            <h2 className="text-xl font-semibold sm:text-lg">
              {t("successTitle")}
            </h2>
            <p className="mt-1 text-base text-slate-500 sm:text-sm">{t("successSubtitle")}</p>
          </div>

          {appointment.time && (
            <div className="rounded-3xl border border-slate-100 bg-white p-4 text-base text-slate-600 sm:text-sm">
              {procedure && (
                <>
                  <p className="text-lg font-semibold text-slate-900 sm:text-base">
                    {procedure.serviceTitle ?? procedure.serviceDescription ?? "Запись"}
                  </p>
                  {procedure.masterNickname && (
                    <p className="mt-1 text-slate-500">
                      {procedure.masterNickname}
                    </p>
                  )}
                </>
              )}
              <p className="mt-2 text-slate-500">
                {new Intl.DateTimeFormat(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: timeZoneId,
                }).format(new Date(appointment.time.start))}
              </p>
              {appointment.price?.amount && (
                <p className="mt-2 text-base text-slate-900 sm:text-sm">
                  {formatCurrency(
                    appointment.price.amount,
                    appointment.price.currency,
                    locale
                  )}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleCreateAnother}
            className="w-full rounded-full bg-slate-900 px-4 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 sm:min-h-[52px] sm:text-base"
          >
            {t("successCreateAnother")}
          </button>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <AddToAppleWalletBadge
              passId={appointmentId}
              shareUrl={appleWalletUrl}
            />
            <AddToGoogleWalletBadge
              passId={appointmentId}
              shareUrl={googleWalletUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentView;
