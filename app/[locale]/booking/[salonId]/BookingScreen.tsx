"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

import { useTranslations } from "next-intl";

import {
  BookingApiError,
  createSalonAppointment,
  getSalonProcedures,
  searchSalonSlots,
  type CreateAppointmentPayload,
  type Procedure,
  type ProcedureGroup,
  type SlotInterval,
  type Step,
} from "@/lib/api/booking";

type BookingScreenProps = {
  salonId: string;
  locale: string;
  trackingId?: string | null;
};

const DAYS_AHEAD = 21;

const formatDuration = (minutes?: number | null, locale?: string) => {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  const lowerLocale = locale?.toLowerCase() ?? "en";

  if (lowerLocale.startsWith("ru")) {
    if (hours && mins) {
      return `${hours} ч ${mins} мин`;
    }

    if (hours) {
      return `${hours} ч`;
    }

    return `${mins} мин`;
  }

  if (lowerLocale.startsWith("es")) {
    if (hours && mins) {
      return `${hours} h ${mins} min`;
    }

    if (hours) {
      return `${hours} h`;
    }

    return `${mins} min`;
  }

  if (hours && mins) {
    return `${hours}h ${mins}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${mins}m`;
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

const BookingScreen = ({ salonId, locale, trackingId: trackingIdProp }: BookingScreenProps) => {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Получаем trackingId из пропсов (если передан) или из query параметров (если был редирект с MagicLink)
  const trackingId = trackingIdProp ?? searchParams.get("trackingId");

  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [proceduresError, setProceduresError] = useState<string | null>(null);

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedProcedureId, setSelectedProcedureId] = useState<
    string | null
  >(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInterval | null>(null);
  const [timeZoneId, setTimeZoneId] = useState<string>("UTC");
  const [slots, setSlots] = useState<SlotInterval[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState<Step>("service");

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>(
    {}
  );
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [salonIcon, setSalonIcon] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProcedures = async () => {
      try {
        setProceduresLoading(true);
        setProceduresError(null);

        const data = await getSalonProcedures({
          salonId,
          locale,
          signal: controller.signal,
        });
        setProcedures(Array.isArray(data?.procedures) ? data.procedures : []);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        const message =
          error instanceof BookingApiError ? error.message : undefined;
        setProceduresError(
          message
            ? t("errors.apiMessage", { message })
            : t("errors.loadProcedures")
        );
        setProcedures([]);
      } finally {
        setProceduresLoading(false);
      }
    };

    fetchProcedures();

    return () => {
      controller.abort();
    };
  }, [locale, salonId, t]);

  const procedureGroups: ProcedureGroup[] = useMemo(() => {
    if (!procedures.length) {
      return [];
    }

    const groupsMap = new Map<string, ProcedureGroup>();

    procedures.forEach((procedure) => {
      const baseTitle =
        procedure.serviceTitle?.trim() ??
        procedure.alias?.trim() ??
        procedure.id;

      const key = baseTitle.toLowerCase();
      const existing = groupsMap.get(key);

      const minPriceCandidate = procedure.price?.amount ?? null;
      const currencyCandidate = procedure.price?.currency ?? null;

      if (existing) {
        existing.procedures.push(procedure);

        if (
          minPriceCandidate !== null &&
          minPriceCandidate !== undefined &&
          (existing.minPrice === null ||
            minPriceCandidate < (existing.minPrice ?? Infinity))
        ) {
          existing.minPrice = minPriceCandidate;
        }

        if (
          minPriceCandidate !== null &&
          minPriceCandidate !== undefined &&
          (existing.maxPrice === null ||
            minPriceCandidate > (existing.maxPrice ?? -Infinity))
        ) {
          existing.maxPrice = minPriceCandidate;
        }

        if (!existing.currency && currencyCandidate) {
          existing.currency = currencyCandidate;
        }

        if (!existing.duration && procedure.duration) {
          existing.duration = procedure.duration;
        }

        if (!existing.description && procedure.serviceDescription) {
          existing.description = procedure.serviceDescription;
        }
      } else {
        groupsMap.set(key, {
          id: key,
          title: baseTitle,
          description: procedure.serviceDescription ?? undefined,
          currency: currencyCandidate ?? null,
          minPrice: minPriceCandidate ?? null,
          maxPrice: minPriceCandidate ?? null,
          duration: procedure.duration ?? null,
          procedures: [procedure],
        });
      }
    });

    return Array.from(groupsMap.values());
  }, [procedures]);

  const selectedGroup = useMemo(
    () => procedureGroups.find((group) => group.id === selectedGroupId) ?? null,
    [procedureGroups, selectedGroupId]
  );

  const selectedProcedure = useMemo(() => {
    if (!selectedProcedureId) {
      return null;
    }

    return procedures.find((proc) => proc.id === selectedProcedureId) ?? null;
  }, [procedures, selectedProcedureId]);

  const steps = useMemo(
    () => [
      { id: "service", label: t("steps.service") },
      { id: "master", label: t("steps.master") },
      { id: "time", label: t("steps.time") },
      { id: "details", label: t("steps.details") },
    ],
    [t]
  ) as Array<{ id: Step; label: string }>;

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const resetSlotsState = () => {
    setSlots([]);
    setSelectedSlot(null);
    setSlotsError(null);
  };

  const handleSelectGroup = (group: ProcedureGroup) => {
    setSelectedGroupId(group.id);
    setSelectedProcedureId(null);
    resetSlotsState();
    setGlobalError(null);

    if (group.procedures.length === 1) {
      const [onlyProcedure] = group.procedures;
      setSelectedProcedureId(onlyProcedure.id);
      setCurrentStep("time");
      void fetchSlotsForProcedure(onlyProcedure.id);
    } else {
      setCurrentStep("master");
    }
  };

  const fetchSlotsForProcedure = async (procedureId: string) => {
    try {
      setSlotsLoading(true);
      setSlotsError(null);

      const data = await searchSalonSlots({
        salonId,
        procedureId,
        daysAhead: DAYS_AHEAD,
      });
      setSlots(Array.isArray(data?.intervals) ? data.intervals : []);
      setTimeZoneId(data?.timeZoneId ?? "UTC");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof BookingApiError ? error.message : undefined;
      setSlotsError(
        message ? t("errors.apiMessage", { message }) : t("errors.loadSlots")
      );
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    setSelectedProcedureId(procedure.id);
    resetSlotsState();
    setGlobalError(null);
    setCurrentStep("time");
    void fetchSlotsForProcedure(procedure.id);
  };

  const slotGroups = useMemo(() => {
    if (!slots.length) {
      return [];
    }

    const formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      weekday: "short",
      timeZone: timeZoneId,
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: timeZoneId,
    });

    const groups = new Map<
      string,
      { label: string; slots: Array<{ start: string; end: string; label: string }> }
    >();

    const sortedSlots = [...slots].sort(
      (a, b) =>
        new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    sortedSlots.forEach((slot) => {
      const startDate = new Date(slot.start);
      const groupKey = startDate.toISOString().split("T")[0];
      const groupLabel = formatter.format(startDate);
      const timeLabel = timeFormatter.format(startDate);

      if (!groups.has(groupKey)) {
        groups.set(groupKey, { label: groupLabel, slots: [] });
      }

      groups.get(groupKey)?.slots.push({
        start: slot.start,
        end: slot.end,
        label: timeLabel,
      });
    });

    return Array.from(groups.entries()).map(([key, value]) => ({
      key,
      label: value.label,
      slots: value.slots,
    }));
  }, [locale, slots, timeZoneId]);

  const handleSelectSlot = (slot: SlotInterval) => {
    setSelectedSlot(slot);
    setCurrentStep("details");
    setGlobalError(null);
    setFormErrors({});
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/[^\d+]/g, "");
    return /^\+?\d{10,15}$/.test(digits);
  };

  const handleSubmitAppointment = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedName = clientName.trim();
    const trimmedPhone = clientPhone.trim();

    const nextErrors: { name?: string; phone?: string } = {};

    if (!trimmedName) {
      nextErrors.name = t("errors.validationName");
    }

    if (!trimmedPhone || !validatePhone(trimmedPhone)) {
      nextErrors.phone = t("errors.validationPhone");
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors(nextErrors);
      return;
    }

    if (!selectedProcedure || !selectedSlot) {
      setGlobalError(t("errors.createAppointment"));
      return;
    }

    setFormErrors({});
    setGlobalError(null);
    setIsSubmitting(true);

    const payload: CreateAppointmentPayload = {
      clientName: trimmedName,
      clientPhone: trimmedPhone,
      procedureId: selectedProcedure.id,
      time: {
        start: new Date(selectedSlot.start).toISOString(),
        end: new Date(selectedSlot.end).toISOString(),
      },
      trackingId: trackingId || null,
    };

    try {
      const data = await createSalonAppointment({
        salonId,
        payload,
      });
      
      if (process.env.NODE_ENV !== "production") {
        console.log("[BookingScreen] Appointment created, response:", data);
      }
      
      // Перенаправляем на страницу созданной записи
      // Проверяем разные возможные варианты названия поля
      const appointmentId = 
        data.appointmentId || 
        (data as unknown as { id?: string }).id ||
        (data as unknown as { appointment?: { id?: string } }).appointment?.id;
      
      if (appointmentId) {
        // Определяем, находимся ли мы на shortlink домене
        const shortlinkHost = process.env.NEXT_PUBLIC_SHORTLINK_HOST || 'link.maetry.com';
        const isShortlinkHost = typeof window !== 'undefined' && 
                                (window.location.hostname === shortlinkHost || 
                                 window.location.hostname.includes(shortlinkHost));
        
        let appointmentUrl: string;
        
        if (isShortlinkHost) {
          // Если на shortlink домене, редиректим на основной домен
          const currentHost = window.location.hostname;
          const mainHost = currentHost.replace(/^link\./, ''); // убираем префикс link.
          const mainDomain = `${window.location.protocol}//${mainHost}`;
          appointmentUrl = `${mainDomain}/${locale}/appointment/${appointmentId}`;
          
          // Используем window.location.href для полного редиректа на другой домен
          window.location.href = appointmentUrl;
          return;
        } else {
          // Если на основном домене, используем router.push
          appointmentUrl = `/${locale}/appointment/${appointmentId}`;
        }
        
        if (process.env.NODE_ENV !== "production") {
          console.log("[BookingScreen] Redirecting to appointment:", appointmentUrl);
        }
        
        // Сбрасываем состояние перед перенаправлением
        setIsSubmitting(false);
        
        // Используем router.push для клиентской навигации (без перезагрузки страницы)
        // Это быстрее и сохраняет состояние приложения
        router.push(appointmentUrl);
        return;
      }
      
      // Если appointmentId нет, показываем ошибку (это не должно происходить)
      if (process.env.NODE_ENV !== "production") {
        console.error("[BookingScreen] No appointmentId in response:", {
          data,
          keys: Object.keys(data),
          appointmentId: data.appointmentId,
          id: (data as unknown as { id?: string }).id,
          fullResponse: JSON.stringify(data, null, 2),
        });
      }
      setGlobalError(t("errors.createAppointment"));
      setIsSubmitting(false);
    } catch (error) {
      console.error("[BookingScreen] Error creating appointment:", error);
      const message =
        error instanceof BookingApiError ? error.message : undefined;
      setGlobalError(
        message
          ? t("errors.apiMessage", { message })
          : t("errors.createAppointment")
      );
      setIsSubmitting(false);
    }
  };

  const handleStepClick = (stepId: Step, stepIndex: number) => {
    if (stepIndex >= currentStepIndex) {
      return;
    }

    setGlobalError(null);

    if (stepId === "service") {
      setCurrentStep("service");
      setSelectedGroupId(null);
      setSelectedProcedureId(null);
      setSelectedSlot(null);
      resetSlotsState();
    } else if (stepId === "master") {
      if (selectedGroup && selectedGroup.procedures.length > 1) {
        setCurrentStep("master");
      } else {
        setCurrentStep("service");
      }
    } else if (stepId === "time") {
      setCurrentStep("time");
      setSelectedSlot(null);
    } else if (stepId === "details") {
      setCurrentStep("details");
    }
  };

  const renderHeader = () => {
    const headline = t("headline");

    return (
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
            <p className="text-sm text-slate-500 sm:text-xs">{t("subtitle")}</p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-5">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = index < currentStepIndex;
            const isClickable = index < currentStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => handleStepClick(step.id, index)}
                disabled={!isClickable}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold uppercase tracking-wide transition sm:px-2 sm:py-1.5 ${
                  isActive
                    ? "bg-white/80 text-slate-900 shadow-sm"
                    : isCompleted
                    ? isClickable
                      ? "bg-white/60 text-slate-600 cursor-pointer hover:bg-white/70"
                      : "bg-white/60 text-slate-600"
                    : "bg-white/40 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive || isCompleted ? "bg-slate-900" : "bg-slate-300"
                  }`}
                />
                {step.label}
              </button>
            );
          })}
        </div>
      </header>
    );
  };

  const renderProceduresStep = () => (
    <div className="mt-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 sm:text-lg">
          {t("serviceTitle")}
        </h2>
        <p className="mt-1 text-base text-slate-500 sm:text-sm">{t("serviceHint")}</p>
      </div>

      {proceduresLoading && (
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-slate-500">
          {t("loading.procedures")}
        </div>
      )}

      {proceduresError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-600 sm:text-sm">
          {proceduresError}
        </div>
      )}

      {!proceduresLoading && !proceduresError && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {procedureGroups.map((group) => {
            const priceMinFormatted = formatCurrency(
              group.minPrice,
              group.currency,
              locale
            );
            const durationLabel = formatDuration(group.duration, locale);
            const isSelected = selectedGroupId === group.id;

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => handleSelectGroup(group)}
                className={`flex h-full flex-col rounded-3xl border border-slate-100 p-5 text-left transition hover:border-slate-300 hover:bg-white ${
                  isSelected
                    ? "bg-white shadow-xl"
                    : "bg-white/80"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-slate-900 sm:text-base">
                      {group.title}
                    </h3>
                    {priceMinFormatted && (
                      <span className="rounded-full bg-slate-900/5 px-3 py-1 text-xs font-medium text-slate-700">
                        {group.maxPrice !== null &&
                        group.minPrice !== null &&
                        group.maxPrice !== group.minPrice
                          ? t("servicePriceFrom", {
                              value: priceMinFormatted,
                            })
                          : t("servicePriceExact", {
                              value: priceMinFormatted,
                            })}
                      </span>
                    )}
                  </div>

                  {group.description && (
                    <p className="mt-2 text-base text-slate-500 sm:text-sm">
                      {group.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
                  {durationLabel && (
                    <span className="rounded-full border border-slate-200 px-3 py-1">
                      {durationLabel}
                    </span>
                  )}
                  <span className="rounded-full border border-slate-200 px-3 py-1">
                    {group.procedures.length > 1
                      ? `${group.procedures.length} ${t("steps.master").toLowerCase()}`
                      : t("masterAuto")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderMastersStep = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <div className="mt-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-lg">
            {t("masterTitle")}
          </h2>
          <p className="mt-1 text-base text-slate-500 sm:text-sm">{t("masterHint")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {selectedGroup.procedures.map((procedure) => {
            const isSelected = selectedProcedureId === procedure.id;
            const durationLabel = formatDuration(procedure.duration, locale);
            const priceLabel = formatCurrency(
              procedure.price?.amount ?? selectedGroup.minPrice,
              procedure.price?.currency ?? selectedGroup.currency,
              locale
            );

            return (
              <button
                key={procedure.id}
                type="button"
                onClick={() => handleSelectProcedure(procedure)}
                className={`flex h-full items-center gap-4 rounded-3xl border border-slate-100 p-4 text-left transition hover:border-slate-300 hover:bg-white ${
                  isSelected
                    ? "bg-white shadow-xl"
                    : "bg-white/80"
                }`}
              >
                {procedure.masterAvatar ? (
                  <Image
                    src={procedure.masterAvatar}
                    alt={procedure.masterNickname ?? procedure.alias ?? "Master"}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-lg font-semibold text-white">
                    {(procedure.masterNickname ?? procedure.alias ?? "M")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 sm:text-base">
                    {procedure.masterNickname ??
                      procedure.alias ??
                      t("steps.master")}
                  </h3>
                  {priceLabel && (
                    <p className="mt-1 text-base text-slate-500 sm:text-sm">{priceLabel}</p>
                  )}
                  {durationLabel && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                      {durationLabel}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSlotsStep = () => (
    <div className="mt-6 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 sm:text-lg">
            {t("timeTitle")}
          </h2>
          <p className="text-base text-slate-500 sm:text-sm">{t("timeHint")}</p>
        </div>
        <button
          type="button"
          onClick={() => selectedProcedure && fetchSlotsForProcedure(selectedProcedure.id)}
          disabled={slotsLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {slotsLoading && (
            <svg
              className="h-4 w-4 animate-spin text-slate-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {t("timeReload")}
        </button>
      </div>

      {slotsLoading && (
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-slate-500">
          {t("loading.slots")}
        </div>
      )}

      {slotsError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-600 sm:text-sm">
          {slotsError}
        </div>
      )}

      {!slotsLoading && !slots.length && !slotsError && (
        <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 text-slate-500">
          <p className="text-lg font-semibold text-slate-900">
            {t("timeEmptyTitle")}
          </p>
          <p className="mt-1 text-base text-slate-500 sm:text-sm">{t("timeEmptyHint")}</p>
        </div>
      )}

      <div className="space-y-3">
        {slotGroups.map((group) => (
          <div
            key={group.key}
            className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {group.label}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {group.slots.map((slot) => {
                const isSelected =
                  selectedSlot?.start === slot.start &&
                  selectedSlot?.end === slot.end;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    onClick={() => handleSelectSlot(slot)}
                    className={`min-w-[88px] rounded-full px-4 py-3 text-base font-semibold transition sm:text-sm sm:py-2.5 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow"
                        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
                    }`}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmitAppointment} className="mt-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-slate-900 sm:text-lg">
          {t("detailsTitle")}
        </h2>
        <p className="mt-1 text-base text-slate-500 sm:text-sm">{t("detailsHint")}</p>
      </div>

      {selectedGroup && selectedProcedure && selectedSlot && (
        <div className="rounded-3xl border border-slate-100 bg-white p-4 text-base text-slate-600 sm:text-sm">
          <p className="text-lg font-semibold text-slate-900 sm:text-base">{selectedGroup.title}</p>
          {selectedProcedure.masterNickname && (
            <p className="mt-1">
              {t("serviceSingleMaster", {
                name: selectedProcedure.masterNickname,
              })}
            </p>
          )}
          <p className="mt-1 text-slate-500">
            {new Intl.DateTimeFormat(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: timeZoneId,
            }).format(new Date(selectedSlot.start))}
          </p>
        </div>
      )}

      {globalError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-base text-red-600 sm:text-sm">
          {globalError}
        </div>
      )}

      <div className="space-y-4">
        <label htmlFor="clientName" className="block">
          <span className="text-base font-medium text-slate-700 sm:text-sm">
            {t("fieldNameLabel")}
          </span>
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            type="text"
            name="clientName"
            autoComplete="name"
            id="clientName"
            placeholder={t("fieldNamePlaceholder")}
            className={`mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:py-3 sm:text-base ${
              formErrors.name
                ? "border-red-300 focus:ring-red-200"
                : "border-slate-200"
            }`}
          />
          {formErrors.name && (
            <span className="mt-1 block text-sm text-red-500">
              {formErrors.name}
            </span>
          )}
        </label>

        <label htmlFor="clientPhone" className="block">
          <span className="text-base font-medium text-slate-700 sm:text-sm">
            {t("fieldPhoneLabel")}
          </span>
          <input
            value={clientPhone}
            onChange={(event) => setClientPhone(event.target.value)}
            type="tel"
            name="clientPhone"
            autoComplete="tel"
            id="clientPhone"
            inputMode="tel"
            placeholder={t("fieldPhonePlaceholder")}
            className={`mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 sm:py-3 sm:text-base ${
              formErrors.phone
                ? "border-red-300 focus:ring-red-200"
                : "border-slate-200"
            }`}
          />
          <span className="mt-1 block text-xs text-slate-500">
            {t("fieldPhoneHelper")}
          </span>
          {formErrors.phone && (
            <span className="mt-1 block text-sm text-red-500">
              {formErrors.phone}
            </span>
          )}
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 w-full min-h-[56px] inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:min-h-[52px] sm:text-base"
      >
        {isSubmitting && (
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {isSubmitting ? t("loading.submit") : t("submitLabel")}
      </button>
    </form>
  );


  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-[#f6b68e] via-[#cf9bff] to-[#6672ff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 opacity-80" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.25), transparent 55%)" }} />
      <div className="absolute inset-0 -z-20 bg-[url('/images/featureBG.svg')] bg-cover bg-center opacity-10" />

      <div className="relative w-full min-w-[280px] max-w-[620px] rounded-[36px] border border-white/40 bg-white/80 p-6 text-slate-900 shadow-[0_55px_120px_rgba(49,45,105,0.35)] backdrop-blur-2xl sm:p-10">
        {renderHeader()}

        {currentStep === "service" && renderProceduresStep()}
        {currentStep === "master" && renderMastersStep()}
        {currentStep === "time" && renderSlotsStep()}
        {currentStep === "details" && renderDetailsStep()}
      </div>
    </div>
  );
};

export default BookingScreen;

