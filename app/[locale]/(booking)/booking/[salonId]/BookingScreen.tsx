"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  AppRoot,
  Avatar,
  Button,
  Cell,
  Input,
  List,
  Placeholder,
  Section,
  Spinner,
} from "@telegram-apps/telegram-ui";
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
import {
  getPublicSalonProfile,
  type PublicSalonProfile,
} from "@/lib/api/public-booking";

type BookingScreenProps = {
  salonId: string;
  locale: string;
  trackingId?: string | null;
};

type SlotOption = {
  end: string;
  hour: number;
  label: string;
  start: string;
};

type SlotDateGroup = {
  key: string;
  label: string;
  slots: SlotOption[];
};

type TimePeriodKey = "morning" | "day" | "evening";

const DAYS_AHEAD = 21;

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

function formatAddress(address?: PublicSalonProfile["address"]) {
  if (!address) {
    return null;
  }

  return [address.address, address.city, address.country]
    .filter((part) => Boolean(part?.trim()))
    .join(", ");
}

function formatDuration(minutes?: number | null, locale?: string) {
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
}

function formatCurrency(
  amount?: number | null,
  currency?: string | null,
  locale?: string,
) {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  try {
    return new Intl.NumberFormat(locale ?? "en", {
      currency,
      maximumFractionDigits: 2,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }

      return acc;
    },
    {},
  );
}

function getDateKeyForTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function validatePhone(value: string) {
  const digits = value.replace(/[^\d+]/g, "");
  return /^\+?\d{10,15}$/.test(digits);
}

function getVisitOrigin() {
  if (typeof window === "undefined") {
    return "";
  }

  const configuredShortlinkHost =
    process.env.NEXT_PUBLIC_SHORTLINK_HOST || "link.maetry.com";
  const shortlinkHost = configuredShortlinkHost
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (
    window.location.hostname === shortlinkHost ||
    window.location.hostname.includes(shortlinkHost)
  ) {
    const mainHost = window.location.hostname.replace(/^link\./, "");
    return `${window.location.protocol}//${mainHost}`;
  }

  return window.location.origin;
}

function buildVisitUrl(locale: string, appointmentId: string) {
  return new URL(`/${locale}/visits/${appointmentId}`, getVisitOrigin()).toString();
}

const BookingScreen = ({
  salonId,
  locale,
  trackingId: trackingIdProp,
}: BookingScreenProps) => {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingId =
    trackingIdProp ??
    searchParams.get("nanoid") ??
    searchParams.get("trackingId");

  const [salonProfile, setSalonProfile] = useState<PublicSalonProfile | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [proceduresError, setProceduresError] = useState<string | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedProcedureId, setSelectedProcedureId] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SlotInterval | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [timeZoneId, setTimeZoneId] = useState("UTC");
  const [slots, setSlots] = useState<SlotInterval[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>("service");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setProceduresLoading(true);
        setProceduresError(null);

        const [proceduresResult, profileResult] = await Promise.allSettled([
          getSalonProcedures({
            locale,
            salonId,
            signal: controller.signal,
          }),
          getPublicSalonProfile(salonId, {
            signal: controller.signal,
          }),
        ]);

        if (proceduresResult.status === "fulfilled") {
          setProcedures(
            Array.isArray(proceduresResult.value?.procedures)
              ? proceduresResult.value.procedures
              : [],
          );
        } else {
          const reason = proceduresResult.reason;
          const message =
            reason instanceof BookingApiError ? reason.message : undefined;

          setProceduresError(
            message
              ? t("errors.apiMessage", { message })
              : t("errors.loadProcedures"),
          );
          setProcedures([]);
        }

        if (profileResult.status === "fulfilled") {
          setSalonProfile(profileResult.value);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message = error instanceof BookingApiError ? error.message : undefined;
        setProceduresError(
          message
            ? t("errors.apiMessage", { message })
            : t("errors.loadProcedures"),
        );
        setProcedures([]);
      } finally {
        setProceduresLoading(false);
      }
    };

    void fetchData();

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
      const priceCandidate = procedure.price?.amount ?? null;
      const currencyCandidate = procedure.price?.currency ?? null;

      if (existing) {
        existing.procedures.push(procedure);

        if (
          priceCandidate !== null &&
          priceCandidate !== undefined &&
          (existing.minPrice === null || priceCandidate < (existing.minPrice ?? Infinity))
        ) {
          existing.minPrice = priceCandidate;
        }

        if (
          priceCandidate !== null &&
          priceCandidate !== undefined &&
          (existing.maxPrice === null || priceCandidate > (existing.maxPrice ?? -Infinity))
        ) {
          existing.maxPrice = priceCandidate;
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
          currency: currencyCandidate ?? null,
          description: procedure.serviceDescription ?? undefined,
          duration: procedure.duration ?? null,
          id: key,
          maxPrice: priceCandidate ?? null,
          minPrice: priceCandidate ?? null,
          procedures: [procedure],
          title: baseTitle,
        });
      }
    });

    return Array.from(groupsMap.values());
  }, [procedures]);

  const selectedGroup = useMemo(
    () => procedureGroups.find((group) => group.id === selectedGroupId) ?? null,
    [procedureGroups, selectedGroupId],
  );

  const selectedProcedure = useMemo(() => {
    if (!selectedProcedureId) {
      return null;
    }

    return procedures.find((procedure) => procedure.id === selectedProcedureId) ?? null;
  }, [procedures, selectedProcedureId]);

  const resetTimingState = () => {
    setSelectedSlot(null);
    setSelectedDateKey(null);
    setSlots([]);
    setSlotsError(null);
  };

  const fetchSlotsForProcedure = async (
    procedureId: string,
    executorId?: string | null,
  ) => {
    try {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedDateKey(null);
      setSelectedSlot(null);

      const data = await searchSalonSlots({
        daysAhead: DAYS_AHEAD,
        executorId,
        procedureId,
        salonId,
      });

      setSlots(Array.isArray(data?.intervals) ? data.intervals : []);
      setTimeZoneId(data?.timeZoneId ?? "UTC");
    } catch (error) {
      const message = error instanceof BookingApiError ? error.message : undefined;

      setSlotsError(
        message ? t("errors.apiMessage", { message }) : t("errors.loadSlots"),
      );
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSelectGroup = (group: ProcedureGroup) => {
    setSelectedGroupId(group.id);
    setSelectedProcedureId(null);
    resetTimingState();
    setGlobalError(null);

    if (group.procedures.length === 1) {
      const [onlyProcedure] = group.procedures;
      setSelectedProcedureId(onlyProcedure.id);
      setCurrentStep("time");
      void fetchSlotsForProcedure(onlyProcedure.id, onlyProcedure.masterId);
      return;
    }

    setCurrentStep("master");
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    setSelectedProcedureId(procedure.id);
    resetTimingState();
    setGlobalError(null);
    setCurrentStep("time");
    void fetchSlotsForProcedure(procedure.id, procedure.masterId);
  };

  const slotDateGroups = useMemo<SlotDateGroup[]>(() => {
    if (!slots.length) {
      return [];
    }

    const dateLabelFormatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      weekday: "short",
      timeZone: timeZoneId,
    });

    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: timeZoneId,
    });

    const grouped = new Map<string, SlotDateGroup>();

    [...slots]
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .forEach((slot) => {
        const startDate = new Date(slot.start);
        const parts = getTimeZoneParts(startDate, timeZoneId);
        const dateKey = getDateKeyForTimeZone(startDate, timeZoneId);
        const hour = Number(parts.hour);

        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, {
            key: dateKey,
            label: dateLabelFormatter.format(startDate),
            slots: [],
          });
        }

        grouped.get(dateKey)?.slots.push({
          end: slot.end,
          hour,
          label: timeFormatter.format(startDate),
          start: slot.start,
        });
      });

    return Array.from(grouped.values());
  }, [locale, slots, timeZoneId]);

  useEffect(() => {
    if (!slotDateGroups.length) {
      setSelectedDateKey(null);
      return;
    }

    if (!selectedDateKey || !slotDateGroups.some((group) => group.key === selectedDateKey)) {
      setSelectedDateKey(slotDateGroups[0].key);
    }
  }, [selectedDateKey, slotDateGroups]);

  const slotPeriods = useMemo(() => {
    const selectedDateGroup =
      slotDateGroups.find((group) => group.key === selectedDateKey) ?? null;

    if (!selectedDateGroup) {
      return [];
    }

    const periodDefinitions: Array<{
      key: TimePeriodKey;
      label: string;
      maxHour: number;
      minHour: number;
    }> = [
      {
        key: "morning",
        label: t("timePeriods.morning"),
        maxHour: 11,
        minHour: 6,
      },
      {
        key: "day",
        label: t("timePeriods.day"),
        maxHour: 17,
        minHour: 12,
      },
      {
        key: "evening",
        label: t("timePeriods.evening"),
        maxHour: 23,
        minHour: 18,
      },
    ];

    return periodDefinitions
      .map((period) => ({
        key: period.key,
        label: period.label,
        slots: selectedDateGroup.slots.filter(
          (slot) => slot.hour >= period.minHour && slot.hour <= period.maxHour,
        ),
      }))
      .filter((period) => period.slots.length > 0);
  }, [selectedDateKey, slotDateGroups, t]);

  const handleSelectSlot = (slot: SlotInterval) => {
    setSelectedSlot(slot);
    setCurrentStep("details");
    setGlobalError(null);
    setFormErrors({});
  };

  const isFormValid = clientName.trim().length > 0 && validatePhone(clientPhone.trim());

  const handleSubmitAppointment = async (event: FormEvent<HTMLFormElement>) => {
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
      executorId: selectedProcedure.masterId,
      procedureId: selectedProcedure.id,
      time: {
        end: new Date(selectedSlot.end).toISOString(),
        start: new Date(selectedSlot.start).toISOString(),
      },
      trackingId: trackingId || null,
    };

    try {
      const data = await createSalonAppointment({
        payload,
        salonId,
      });

      const appointmentId =
        data.appointmentId ||
        (data as { id?: string }).id ||
        (data as { appointment?: { id?: string } }).appointment?.id;

      if (!appointmentId) {
        setGlobalError(t("errors.createAppointment"));
        setIsSubmitting(false);
        return;
      }

      const visitUrl = buildVisitUrl(locale, appointmentId);
      if (typeof window !== "undefined") {
        window.location.assign(visitUrl);
        return;
      }

      setIsSubmitting(false);
      router.push(`/${locale}/visits/${appointmentId}`);
    } catch (error) {
      const message = error instanceof BookingApiError ? error.message : undefined;
      setGlobalError(
        message
          ? t("errors.apiMessage", { message })
          : t("errors.createAppointment"),
      );
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
      if (selectedGroup?.procedures.length && selectedGroup.procedures.length > 1) {
        setCurrentStep("master");
        return;
      }

      setCurrentStep("service");
      return;
    }

    if (currentStep === "master") {
      setCurrentStep("service");
    }
  };

  const salonName = salonProfile?.name?.trim() || t("salonFallbackName");
  const salonAddress = formatAddress(salonProfile?.address) || undefined;

  const selectedProcedurePrice = formatCurrency(
    selectedProcedure?.price?.amount ?? selectedGroup?.minPrice ?? null,
    selectedProcedure?.price?.currency ?? selectedGroup?.currency ?? null,
    locale,
  );

  const selectedProcedureDuration = formatDuration(
    selectedProcedure?.duration ?? selectedGroup?.duration ?? null,
    locale,
  );

  const selectedDateText = selectedSlot
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        timeZone: timeZoneId,
      }).format(new Date(selectedSlot.start))
    : null;

  const selectedTimeText = selectedSlot
    ? new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        timeZone: timeZoneId,
      }).format(new Date(selectedSlot.start))
    : null;

  const renderServiceStep = () => {
    if (proceduresLoading) {
      return (
        <Placeholder
          header={t("loading.procedures")}
          description={t("subtitle")}
        >
          <Spinner size="m" />
        </Placeholder>
      );
    }

    if (proceduresError) {
      return (
        <Placeholder
          header={t("errors.loadProcedures")}
          description={proceduresError}
        />
      );
    }

    if (!procedureGroups.length) {
      return (
        <Placeholder
          header={t("serviceEmptyTitle")}
          description={t("serviceEmptyHint")}
        />
      );
    }

    return (
      <Section header={t("serviceTitle")}>
        {procedureGroups.map((group) => {
          const groupPrice = formatCurrency(group.minPrice, group.currency, locale);
          const groupDuration = formatDuration(group.duration, locale);
          const after =
            [groupPrice, groupDuration].filter(Boolean).join(" · ") || undefined;

          return (
            <Cell
              key={group.id}
              Component="button"
              multiline
              onClick={() => handleSelectGroup(group)}
              subhead={
                group.procedures.length > 1
                  ? `${group.procedures.length} ${t("steps.master").toLowerCase()}`
                  : t("masterAuto")
              }
              subtitle={group.description ?? undefined}
              after={after}
            >
              {group.title}
            </Cell>
          );
        })}
      </Section>
    );
  };

  const renderMastersStep = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <Section header={t("masterTitle")}>
        {selectedGroup.procedures.map((procedure) => {
          const priceLabel = formatCurrency(
            procedure.price?.amount ?? selectedGroup.minPrice,
            procedure.price?.currency ?? selectedGroup.currency,
            locale,
          );
          const durationLabel = formatDuration(procedure.duration, locale);
          const after =
            [priceLabel, durationLabel].filter(Boolean).join(" · ") || undefined;
          const subtitle =
            procedure.alias && procedure.alias !== procedure.masterNickname
              ? procedure.alias
              : t("steps.master");

          return (
            <Cell
              key={procedure.id}
              Component="button"
              multiline
              onClick={() => handleSelectProcedure(procedure)}
              before={
                <Avatar
                  size={40}
                  src={procedure.masterAvatar ?? undefined}
                  acronym={getInitials(
                    procedure.masterNickname ?? procedure.alias ?? t("steps.master"),
                  )}
                />
              }
              subtitle={subtitle}
              after={after}
            >
              {procedure.masterNickname ?? procedure.alias ?? t("masterAny")}
            </Cell>
          );
        })}
      </Section>
    );
  };

  const renderTimeStep = () => {
    if (slotsLoading) {
      return (
        <Placeholder
          header={t("loading.slots")}
          description={t("timeEmptyHint")}
        >
          <Spinner size="m" />
        </Placeholder>
      );
    }

    if (slotsError) {
      return (
        <Section header={t("timeSelectDate")}>
          <Cell multiline>{slotsError}</Cell>
        </Section>
      );
    }

    if (!slotDateGroups.length) {
      return (
        <Placeholder
          header={t("timeEmptyTitle")}
          description={t("timeEmptyHint")}
          action={
            <Button
              size="l"
              onClick={() =>
                selectedProcedure &&
                fetchSlotsForProcedure(selectedProcedure.id, selectedProcedure.masterId)
              }
            >
              {t("timeReload")}
            </Button>
          }
        />
      );
    }

    return (
      <>
        <Section header={t("timeSelectDate")}>
          {slotDateGroups.map((group) => (
            <Cell
              key={group.key}
              Component="button"
              onClick={() => setSelectedDateKey(group.key)}
              after={selectedDateKey === group.key ? "✓" : undefined}
            >
              {group.label}
            </Cell>
          ))}
        </Section>

        {slotPeriods.map((period) => (
          <Section key={period.key} header={period.label}>
            {period.slots.map((slot) => {
              const isSelected =
                selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

              return (
                <Cell
                  key={slot.start}
                  Component="button"
                  onClick={() => handleSelectSlot(slot)}
                  after={isSelected ? "✓" : undefined}
                >
                  {slot.label}
                </Cell>
              );
            })}
          </Section>
        ))}

        <Section>
          <Button
            size="l"
            stretched
            onClick={() =>
              selectedProcedure &&
              fetchSlotsForProcedure(selectedProcedure.id, selectedProcedure.masterId)
            }
          >
            {t("timeReload")}
          </Button>
        </Section>
      </>
    );
  };

  const renderSummarySection = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <Section header={t("summaryTitle")}>
        <Cell
          multiline
          subhead={t("summaryService")}
          subtitle={selectedProcedure?.masterNickname ?? t("masterAny")}
          after={selectedProcedurePrice ?? undefined}
        >
          {selectedGroup.title}
        </Cell>

        {selectedSlot ? (
          <Cell
            multiline
            subhead={t("summaryDate")}
            subtitle={selectedTimeText ?? undefined}
            after={selectedProcedureDuration ?? undefined}
          >
            {selectedDateText ?? "—"}
          </Cell>
        ) : null}

        <Cell
          multiline
          subhead={t("summarySalon")}
          subtitle={salonAddress}
        >
          {salonName}
        </Cell>
      </Section>
    );
  };

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmitAppointment}>
      <Section header={t("detailsTitle")} footer={t("fieldPhoneHelper")}>
        <Input
          value={clientName}
          onChange={(event) => {
            setClientName(event.target.value);
            if (formErrors.name) {
              setFormErrors((current) => ({ ...current, name: undefined }));
            }
          }}
          header={t("fieldNameLabel")}
          placeholder={t("fieldNamePlaceholder")}
          autoComplete="name"
          aria-label={t("fieldNameLabel")}
          status={formErrors.name ? "error" : "default"}
        />
        <Input
          value={clientPhone}
          onChange={(event) => {
            setClientPhone(event.target.value);
            if (formErrors.phone) {
              setFormErrors((current) => ({ ...current, phone: undefined }));
            }
          }}
          header={t("fieldPhoneLabel")}
          placeholder={t("fieldPhonePlaceholder")}
          autoComplete="tel"
          aria-label={t("fieldPhoneLabel")}
          inputMode="tel"
          status={formErrors.phone ? "error" : "default"}
        />
      </Section>

      {formErrors.name || formErrors.phone || globalError ? (
        <Section>
          <Cell multiline>{formErrors.name || formErrors.phone || globalError}</Cell>
        </Section>
      ) : null}

      {renderSummarySection()}

      <Section footer={t("detailsHint")}>
        <Button
          type="submit"
          size="l"
          stretched
          loading={isSubmitting}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? t("loading.submit") : t("submitLabel")}
        </Button>
      </Section>
    </form>
  );

  return (
    <AppRoot>
      <List>
        <Section>
          <Cell
            before={
              <Avatar
                size={48}
                src={salonProfile?.logo ?? undefined}
                acronym={getInitials(salonName)}
              />
            }
            subtitle={salonAddress ?? t("subtitle")}
          >
            {salonName}
          </Cell>
          {currentStep !== "service" ? (
            <Button size="s" mode="plain" onClick={handleBack}>
              {t("backLabel")}
            </Button>
          ) : null}
        </Section>

        {currentStep !== "details" ? renderSummarySection() : null}

        {currentStep === "service" ? renderServiceStep() : null}
        {currentStep === "master" ? renderMastersStep() : null}
        {currentStep === "time" ? renderTimeStep() : null}
        {currentStep === "details" ? renderDetailsStep() : null}
      </List>
    </AppRoot>
  );
};

export default BookingScreen;
