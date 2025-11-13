"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";

import { useTranslations } from "next-intl";

import {
  BookingApiError,
  createSalonAppointment,
  getSalonProcedures,
  searchSalonSlots,
  type AppointmentResponse,
  type CreateAppointmentPayload,
  type Procedure,
  type ProcedureGroup,
  type SlotInterval,
  type Step,
} from "@/lib/api/booking";
import { useTracking } from "@/lib/tracking/useTracking";

type BookingClientProps = {
  salonId: string;
  locale: string;
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

const BookingClient = ({ salonId, locale }: BookingClientProps) => {
  const t = useTranslations("booking");
  const tracking = useTracking();

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

  const [appointment, setAppointment] = useState<AppointmentResponse | null>(
    null
  );

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
      { id: "success", label: t("steps.success") },
    ],
    [t]
  ) as Array<{ id: Step; label: string }>;

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const isBackVisible =
    currentStep !== "service" && currentStep !== "success" && currentStepIndex > 0;

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
    };

    if (tracking?.firstTouch || tracking?.lastTouch) {
      payload.tracking = {
        ...(tracking.firstTouch ? { firstTouch: tracking.firstTouch } : {}),
        ...(tracking.lastTouch ? { lastTouch: tracking.lastTouch } : {}),
      };
    }

    try {
      const data = await createSalonAppointment({
        salonId,
        payload,
      });
      setAppointment(data);
      setCurrentStep("success");
    } catch (error) {
      console.error(error);
      const message =
        error instanceof BookingApiError ? error.message : undefined;
      setGlobalError(
        message
          ? t("errors.apiMessage", { message })
          : t("errors.createAppointment")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setGlobalError(null);

    if (currentStep === "details") {
      setCurrentStep("time");
      return;
    }

    if (currentStep === "time") {
      if (selectedGroup && selectedGroup.procedures.length > 1) {
        setCurrentStep("master");
      } else {
        setCurrentStep("service");
      }
      return;
    }

    if (currentStep === "master") {
      setCurrentStep("service");
    }
  };

  const handleCreateAnother = () => {
    setCurrentStep("service");
    setSelectedGroupId(null);
    setSelectedProcedureId(null);
    resetSlotsState();
    setClientName("");
    setClientPhone("");
    setAppointment(null);
    setGlobalError(null);
    setFormErrors({});
  };

  const { apple: appleWalletUrl, google: googleWalletUrl } =
    getWalletUrl(appointment);

  const renderHeader = () => (
    <header className="flex flex-col gap-3 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {t("headline")}
          </h1>
          <p className="mt-1 text-sm text-white/70 sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        {isBackVisible && (
          <button
            type="button"
            onClick={handleBack}
            className="rounded-full border border-white/20 px-3 py-1 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
          >
            {t("backLabel")}
          </button>
        )}
      </div>

      <ol className="flex flex-wrap gap-2 text-xs uppercase tracking-wide text-white/60">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = index < currentStepIndex;

          return (
            <li
              key={step.id}
              className={`flex items-center gap-2 rounded-full border px-3 py-1 transition ${
                isActive
                  ? "border-white/80 bg-white/10 text-white"
                  : isCompleted
                  ? "border-white/30 bg-white/5 text-white/80"
                  : "border-white/10 bg-white/0"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-white/70" />
              {step.label}
            </li>
          );
        })}
      </ol>
    </header>
  );

  const renderProceduresStep = () => (
    <div className="mt-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-white sm:text-xl">
          {t("serviceTitle")}
        </h2>
        <p className="mt-1 text-sm text-white/60">{t("serviceHint")}</p>
      </div>

      {proceduresLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          {t("loading.procedures")}
        </div>
      )}

      {proceduresError && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-50">
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
                className={`flex h-full flex-col rounded-3xl border p-4 text-left transition hover:border-white/50 hover:bg-white/10 ${
                  isSelected
                    ? "border-white/70 bg-white/15 shadow-[0_0_25px_rgba(255,255,255,0.08)]"
                    : "border-white/20 bg-white/5"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-base font-semibold text-white">
                      {group.title}
                    </h3>
                    {priceMinFormatted && (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white">
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
                    <p className="mt-2 text-sm text-white/70">
                      {group.description}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wide text-white/60">
                  {durationLabel && (
                    <span className="rounded-full border border-white/20 px-3 py-1">
                      {durationLabel}
                    </span>
                  )}
                  <span className="rounded-full border border-white/10 px-3 py-1">
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
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {t("masterTitle")}
          </h2>
          <p className="mt-1 text-sm text-white/60">{t("masterHint")}</p>
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
                className={`flex h-full items-center gap-4 rounded-3xl border p-4 text-left transition hover:border-white/50 hover:bg-white/10 ${
                  isSelected
                    ? "border-white/70 bg-white/15 shadow-[0_0_25px_rgba(255,255,255,0.08)]"
                    : "border-white/20 bg-white/5"
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
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-lg font-semibold text-white">
                    {(procedure.masterNickname ?? procedure.alias ?? "M")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-base font-semibold text-white">
                    {procedure.masterNickname ??
                      procedure.alias ??
                      t("steps.master")}
                  </h3>
                  {priceLabel && (
                    <p className="mt-1 text-sm text-white/70">{priceLabel}</p>
                  )}
                  {durationLabel && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-white/60">
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
          <h2 className="text-lg font-semibold text-white sm:text-xl">
            {t("timeTitle")}
          </h2>
          <p className="text-sm text-white/60">{t("timeHint")}</p>
        </div>
        <button
          type="button"
          onClick={() => selectedProcedure && fetchSlotsForProcedure(selectedProcedure.id)}
          className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-white/40 hover:text-white"
        >
          {t("timeReload")}
        </button>
      </div>

      {slotsLoading && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          {t("loading.slots")}
        </div>
      )}

      {slotsError && (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-50">
          {slotsError}
        </div>
      )}

      {!slotsLoading && !slots.length && !slotsError && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
          <p className="text-base font-semibold text-white">
            {t("timeEmptyTitle")}
          </p>
          <p className="mt-1 text-sm text-white/60">{t("timeEmptyHint")}</p>
        </div>
      )}

      <div className="space-y-3">
        {slotGroups.map((group) => (
          <div
            key={group.key}
            className="rounded-3xl border border-white/15 bg-white/5 p-4"
          >
            <p className="text-sm font-semibold uppercase tracking-wide text-white/70">
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
                    className={`min-w-[88px] rounded-full px-4 py-2 text-sm font-medium transition ${
                      isSelected
                        ? "bg-white text-slate-900"
                        : "border border-white/30 bg-white/10 text-white/80 hover:border-white/50 hover:text-white"
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
        <h2 className="text-lg font-semibold text-white sm:text-xl">
          {t("detailsTitle")}
        </h2>
        <p className="mt-1 text-sm text-white/60">{t("detailsHint")}</p>
      </div>

      {selectedGroup && selectedProcedure && selectedSlot && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="font-semibold text-white">{selectedGroup.title}</p>
          {selectedProcedure.masterNickname && (
            <p className="mt-1">
              {t("serviceSingleMaster", {
                name: selectedProcedure.masterNickname,
              })}
            </p>
          )}
          <p className="mt-1">
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
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm text-red-50">
          {globalError}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-white">
            {t("fieldNameLabel")}
          </span>
          <input
            value={clientName}
            onChange={(event) => setClientName(event.target.value)}
            type="text"
            name="clientName"
            autoComplete="name"
            placeholder={t("fieldNamePlaceholder")}
            className={`mt-2 w-full rounded-2xl border bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/60 ${
              formErrors.name
                ? "border-red-400/70 focus:ring-red-400/70"
                : "border-white/20"
            }`}
          />
          {formErrors.name && (
            <span className="mt-1 block text-sm text-red-200">
              {formErrors.name}
            </span>
          )}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-white">
            {t("fieldPhoneLabel")}
          </span>
          <input
            value={clientPhone}
            onChange={(event) => setClientPhone(event.target.value)}
            type="tel"
            name="clientPhone"
            autoComplete="tel"
            placeholder={t("fieldPhonePlaceholder")}
            className={`mt-2 w-full rounded-2xl border bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/60 ${
              formErrors.phone
                ? "border-red-400/70 focus:ring-red-400/70"
                : "border-white/20"
            }`}
          />
          <span className="mt-1 block text-xs text-white/60">
            {t("fieldPhoneHelper")}
          </span>
          {formErrors.phone && (
            <span className="mt-1 block text-sm text-red-200">
              {formErrors.phone}
            </span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-white text-base font-semibold text-slate-900 transition hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/50"
        >
          {isSubmitting ? t("loading.submit") : t("submitLabel")}
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep("time")}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/30 bg-transparent text-base font-semibold text-white/80 transition hover:border-white/50 hover:text-white sm:max-w-[180px]"
        >
          {t("backLabel")}
        </button>
      </div>
    </form>
  );

  const renderSuccessStep = () => (
    <div className="mt-6 space-y-5 text-white">
      <div>
        <h2 className="text-lg font-semibold sm:text-xl">
          {t("successTitle")}
        </h2>
        <p className="mt-1 text-sm text-white/70">{t("successSubtitle")}</p>
      </div>

      {selectedGroup && selectedProcedure && selectedSlot && (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <p className="text-base font-semibold text-white">
            {selectedGroup.title}
          </p>
          {selectedProcedure.masterNickname && (
            <p className="mt-1 text-white/70">
              {selectedProcedure.masterNickname}
            </p>
          )}
          <p className="mt-2 text-sm text-white/70">
            {new Intl.DateTimeFormat(locale, {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
              timeZone: timeZoneId,
            }).format(new Date(selectedSlot.start))}
          </p>
          {selectedProcedure.price?.amount && (
            <p className="mt-2 text-sm text-white">
              {formatCurrency(
                selectedProcedure.price.amount,
                selectedProcedure.price.currency,
                locale
              )}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            if (appleWalletUrl) {
              window.open(appleWalletUrl, "_blank", "noopener,noreferrer");
            }
          }}
          disabled={!appleWalletUrl}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/50 bg-white/10 text-base font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/40"
        >
          {t("walletApple")}
        </button>
        <button
          type="button"
          onClick={() => {
            if (googleWalletUrl) {
              window.open(googleWalletUrl, "_blank", "noopener,noreferrer");
            }
          }}
          disabled={!googleWalletUrl}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/50 bg-white/10 text-base font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:border-white/20 disabled:text-white/40"
        >
          {t("walletGoogle")}
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleCreateAnother}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-white text-base font-semibold text-slate-900 transition hover:bg-white/90"
        >
          {t("successCreateAnother")}
        </button>
        <button
          type="button"
          onClick={() => window.close()}
          className="inline-flex min-h-[52px] flex-1 items-center justify-center rounded-full border border-white/40 bg-transparent text-base font-semibold text-white/80 transition hover:border-white/60 hover:text-white"
        >
          {t("successClose")}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-20 bg-[#070815]" />
      <div
        className="absolute inset-0 -z-10 animate-gradient-slow rounded-none bg-gradient-to-br from-[#1F2A6B] via-[#412162] to-[#0A0C1F] opacity-90"
        style={{ backgroundSize: "220% 220%" }}
      />
      <div className="pointer-events-none absolute inset-0 -z-5 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.25)_0%,_transparent_60%)]" />

      <div className="relative w-full max-w-[520px] rounded-[32px] border border-white/20 bg-white/10 p-6 shadow-[0_40px_120px_rgba(15,23,42,0.35)] backdrop-blur-2xl sm:p-8">
        {renderHeader()}

        {currentStep === "service" && renderProceduresStep()}
        {currentStep === "master" && renderMastersStep()}
        {currentStep === "time" && renderSlotsStep()}
        {currentStep === "details" && renderDetailsStep()}
        {currentStep === "success" && renderSuccessStep()}
      </div>
    </div>
  );
};

export default BookingClient;

