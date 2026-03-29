"use client";

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import {
  Accordion,
  AppRoot,
  Avatar,
  Button,
  Caption,
  Cell,
  Input,
  List,
  Placeholder,
  Section,
  Spinner,
  Subheadline,
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

const viewportStyle: CSSProperties = {
  minHeight: "100dvh",
  padding:
    "max(12px, env(safe-area-inset-top, 0px)) max(12px, env(safe-area-inset-right, 0px)) max(18px, env(safe-area-inset-bottom, 0px)) max(12px, env(safe-area-inset-left, 0px))",
};

const shellStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  width: "100%",
  maxWidth: 480,
  margin: "0 auto",
};

const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
};

const stackStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const chipRowStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  overflowX: "auto",
  paddingBottom: 2,
};

const chipWrapStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const statusStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: 16,
};

const footerTextStyle: CSSProperties = {
  paddingInline: 6,
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

function formatMeta(...parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" · ");
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

const BookingScreen = ({
  salonId,
  locale,
  trackingId: trackingIdProp,
}: BookingScreenProps) => {
  const t = useTranslations("booking");
  const router = useRouter();
  const searchParams = useSearchParams();
  const trackingId = trackingIdProp ?? searchParams.get("trackingId");

  const [salonProfile, setSalonProfile] = useState<PublicSalonProfile | null>(null);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [proceduresLoading, setProceduresLoading] = useState(true);
  const [proceduresError, setProceduresError] = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
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

  useEffect(() => {
    if (!procedureGroups.length) {
      setExpandedGroupId(null);
      return;
    }

    if (!expandedGroupId || !procedureGroups.some((group) => group.id === expandedGroupId)) {
      setExpandedGroupId(selectedGroupId ?? procedureGroups[0].id);
    }
  }, [expandedGroupId, procedureGroups, selectedGroupId]);

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

  const steps = useMemo(
    () => [
      { id: "service" as const, label: t("steps.service") },
      { id: "master" as const, label: t("steps.master") },
      { id: "time" as const, label: t("steps.time") },
      { id: "details" as const, label: t("steps.details") },
    ],
    [t],
  );

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

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
    setExpandedGroupId(group.id);
    setSelectedProcedureId(null);
    resetTimingState();
    setGlobalError(null);

    if (group.procedures.length === 1) {
      const [onlyProcedure] = group.procedures;
      setSelectedProcedureId(onlyProcedure.id);
      setCurrentStep("time");
      void fetchSlotsForProcedure(onlyProcedure.id, onlyProcedure.masterId);
    } else {
      setCurrentStep("master");
    }
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

  const validatePhone = (value: string) => {
    const digits = value.replace(/[^\d+]/g, "");
    return /^\+?\d{10,15}$/.test(digits);
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

      const shortlinkHost = process.env.NEXT_PUBLIC_SHORTLINK_HOST || "link.maetry.com";
      const isShortlinkHost =
        typeof window !== "undefined" &&
        (window.location.hostname === shortlinkHost ||
          window.location.hostname.includes(shortlinkHost));

      if (isShortlinkHost) {
        const currentHost = window.location.hostname;
        const mainHost = currentHost.replace(/^link\./, "");
        const mainDomain = `${window.location.protocol}//${mainHost}`;
        window.location.href = `${mainDomain}/${locale}/visits/${appointmentId}`;
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

  const handleStepClick = (stepId: Step, stepIndex: number) => {
    if (stepIndex >= currentStepIndex) {
      return;
    }

    setGlobalError(null);

    if (stepId === "service") {
      setCurrentStep("service");
      return;
    }

    if (stepId === "master" && selectedGroup?.procedures.length && selectedGroup.procedures.length > 1) {
      setCurrentStep("master");
      return;
    }

    if (stepId === "time" && selectedProcedure) {
      setCurrentStep("time");
      return;
    }

    if (stepId === "details" && selectedProcedure && selectedSlot) {
      setCurrentStep("details");
    }
  };

  const salonName = salonProfile?.name?.trim() || t("salonFallbackName");
  const salonAddress = formatAddress(salonProfile?.address) || t("subtitle");

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

  const renderStatus = (label: string) => (
    <Section>
      <div style={statusStyle}>
        <Spinner size="s" />
        <Subheadline level="2">{label}</Subheadline>
      </div>
    </Section>
  );

  const renderError = (message: string) => (
    <Section>
      <Cell multiline>{message}</Cell>
    </Section>
  );

  const renderServiceStep = () => {
    if (proceduresLoading) {
      return renderStatus(t("loading.procedures"));
    }

    if (proceduresError) {
      return renderError(proceduresError);
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
      <div style={stackStyle}>
        <Caption level="1">{t("serviceTitle")}</Caption>

        {procedureGroups.map((group) => {
          const groupPrice = formatCurrency(group.minPrice, group.currency, locale);
          const previewProcedures = group.procedures.slice(0, 3);

          return (
            <Section key={group.id}>
              <Accordion
                expanded={expandedGroupId === group.id}
                onChange={(expanded) => setExpandedGroupId(expanded ? group.id : null)}
              >
                <Accordion.Summary
                  subtitle={
                    group.procedures.length > 1
                      ? `${group.procedures.length} ${t("steps.master").toLowerCase()}`
                      : t("masterAuto")
                  }
                  after={
                    groupPrice
                      ? group.maxPrice !== null &&
                        group.minPrice !== null &&
                        group.maxPrice !== group.minPrice
                        ? t("servicePriceFrom", { value: groupPrice })
                        : t("servicePriceExact", { value: groupPrice })
                      : undefined
                  }
                >
                  {group.title}
                </Accordion.Summary>

                <Accordion.Content>
                  {previewProcedures.map((procedure) => {
                    const previewPrice = formatCurrency(
                      procedure.price?.amount ?? group.minPrice,
                      procedure.price?.currency ?? group.currency,
                      locale,
                    );
                    const previewDuration = formatDuration(
                      procedure.duration ?? group.duration,
                      locale,
                    );

                    return (
                      <Cell
                        key={procedure.id}
                        Component="button"
                        onClick={() => handleSelectGroup(group)}
                        subtitle={procedure.masterNickname ?? t("masterAny")}
                        after={formatMeta(previewPrice, previewDuration) || undefined}
                      >
                        {procedure.serviceTitle ?? group.title}
                      </Cell>
                    );
                  })}
                </Accordion.Content>
              </Accordion>
            </Section>
          );
        })}
      </div>
    );
  };

  const renderMastersStep = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <div style={stackStyle}>
        <Caption level="1">{t("masterTitle")}</Caption>

        <Section>
          {selectedGroup.procedures.map((procedure) => {
            const priceLabel = formatCurrency(
              procedure.price?.amount ?? selectedGroup.minPrice,
              procedure.price?.currency ?? selectedGroup.currency,
              locale,
            );
            const durationLabel = formatDuration(procedure.duration, locale);
            const subtitle =
              procedure.alias && procedure.alias !== procedure.masterNickname
                ? procedure.alias
                : t("steps.master");

            return (
              <Cell
                key={procedure.id}
                Component="button"
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
                after={formatMeta(priceLabel, durationLabel) || undefined}
              >
                {procedure.masterNickname ?? procedure.alias ?? t("masterAny")}
              </Cell>
            );
          })}
        </Section>
      </div>
    );
  };

  const renderTimeStep = () => {
    if (slotsLoading) {
      return renderStatus(t("loading.slots"));
    }

    return (
      <div style={stackStyle}>
        <div style={rowStyle}>
          <Caption level="1">{t("timeSelectDate")}</Caption>

          <Button
            size="s"
            mode="plain"
            disabled={slotsLoading || !selectedProcedure}
            onClick={() =>
              selectedProcedure &&
              fetchSlotsForProcedure(selectedProcedure.id, selectedProcedure.masterId)
            }
          >
            {t("timeReload")}
          </Button>
        </div>

        {slotsError ? renderError(slotsError) : null}

        {!slotsLoading && !slotDateGroups.length && !slotsError ? (
          <Placeholder
            header={t("timeEmptyTitle")}
            description={t("timeEmptyHint")}
          />
        ) : null}

        {slotDateGroups.length ? (
          <div style={chipRowStyle}>
            {slotDateGroups.map((group) => (
              <Button
                key={group.key}
                size="m"
                mode={selectedDateKey === group.key ? "filled" : "white"}
                onClick={() => setSelectedDateKey(group.key)}
              >
                {group.label}
              </Button>
            ))}
          </div>
        ) : null}

        {slotPeriods.map((period) => (
          <div key={period.key} style={stackStyle}>
            <Caption level="1">{period.label}</Caption>

            <div style={chipWrapStyle}>
              {period.slots.map((slot) => {
                const isSelected =
                  selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;

                return (
                  <Button
                    key={slot.start}
                    size="m"
                    mode={isSelected ? "filled" : "white"}
                    onClick={() => handleSelectSlot(slot)}
                  >
                    {slot.label}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmitAppointment} style={stackStyle}>
      <Caption level="1">{t("detailsTitle")}</Caption>

      <Section>
        <Input
          value={clientName}
          onChange={(event) => {
            setClientName(event.target.value);
            if (formErrors.name) {
              setFormErrors((current) => ({ ...current, name: undefined }));
            }
          }}
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
          placeholder={t("fieldPhonePlaceholder")}
          autoComplete="tel"
          aria-label={t("fieldPhoneLabel")}
          inputMode="tel"
          status={formErrors.phone ? "error" : "default"}
        />
      </Section>

      <Subheadline level="2" style={footerTextStyle}>
        {t("fieldPhoneHelper")}
      </Subheadline>

      {formErrors.name || formErrors.phone || globalError
        ? renderError(formErrors.name || formErrors.phone || globalError || "")
        : null}

      <Caption level="1">{t("summaryTitle")}</Caption>

      <Section>
        <Cell
          multiline
          subhead={t("summaryService")}
          subtitle={selectedProcedure?.masterNickname ?? t("masterAny")}
        >
          {selectedGroup?.title ?? "—"}
        </Cell>
        <Cell
          multiline
          subhead={t("summaryDate")}
          subtitle={selectedTimeText ?? undefined}
          after={selectedProcedureDuration ?? undefined}
        >
          {selectedDateText ?? "—"}
        </Cell>
        <Cell
          multiline
          subhead={t("summaryPrice")}
          subtitle={salonAddress}
          after={selectedProcedurePrice ?? undefined}
        >
          {salonName}
        </Cell>
      </Section>

      <Button
        type="submit"
        size="l"
        stretched
        loading={isSubmitting}
        disabled={!isFormValid || isSubmitting}
      >
        {isSubmitting ? t("loading.submit") : t("submitLabel")}
      </Button>
    </form>
  );

  return (
    <AppRoot appearance="light" platform="ios">
      <div style={viewportStyle}>
        <div style={shellStyle}>
          <Section>
            <Cell
              before={
                <Avatar
                  size={48}
                  src={salonProfile?.logo ?? undefined}
                  acronym={getInitials(salonName)}
                />
              }
              subtitle={salonAddress}
            >
              {salonName}
            </Cell>
          </Section>

          <div style={chipWrapStyle}>
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;

              return (
                <Button
                  key={step.id}
                  size="s"
                  mode={isActive ? "filled" : "plain"}
                  disabled={!isActive && !isCompleted}
                  onClick={() => handleStepClick(step.id, index)}
                >
                  {step.label}
                </Button>
              );
            })}
          </div>

          <List>
            {currentStep === "service" && renderServiceStep()}
            {currentStep === "master" && renderMastersStep()}
            {currentStep === "time" && renderTimeStep()}
            {currentStep === "details" && renderDetailsStep()}
          </List>

          {currentStep !== "details" && selectedGroup ? (
            <Subheadline level="2" style={footerTextStyle}>
              {formatMeta(
                selectedGroup.title,
                selectedProcedure?.masterNickname ?? selectedProcedureDuration,
                selectedProcedurePrice,
              )}
            </Subheadline>
          ) : null}

          {currentStep === "details" ? (
            <Subheadline level="2" style={footerTextStyle}>
              {t("detailsHint")}
            </Subheadline>
          ) : null}
        </div>
      </div>
    </AppRoot>
  );
};

export default BookingScreen;
