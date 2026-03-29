"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { ReactNode } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Avatar,
  Button,
  Input,
  Paragraph,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
  styled,
} from "tamagui";

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
import {
  detectBookingAdaptivePlatform,
  getBookingPlatformVariant,
  type BookingPlatformVariant,
} from "@/src/features/booking/utils/platform";

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

type DateOption = {
  key: string;
  label: string;
};

type TimePeriodKey = "morning" | "day" | "evening";

const DAYS_AHEAD = 21;

type BookingSectionProps = {
  children: ReactNode;
  description?: string | null;
  platform: BookingPlatformVariant;
  title: string;
};

type BookingRowProps = {
  before?: ReactNode;
  indicator?: ReactNode;
  onPress?: () => void;
  overline?: string | null;
  platform: BookingPlatformVariant;
  selected?: boolean;
  subtitle?: string | null;
  title: string;
};

const SheetRoot = styled(YStack, {
  backgroundColor: "$sheetBackground",
  flex: 1,
  width: "100%",
  variants: {
    platform: {
      android: {
        gap: 12,
        padding: 14,
      },
      ios: {
        gap: 16,
        paddingBottom: 18,
        paddingHorizontal: 16,
        paddingTop: 12,
      },
    },
  } as const,
});

const HeroCard = styled(YStack, {
  backgroundColor: "$cardBackground",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        elevation: 3,
        gap: 10,
        padding: 14,
        shadowColor: "rgba(0,0,0,0.18)",
        shadowOffset: { height: 3, width: 0 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      ios: {
        borderRadius: 16,
        gap: 10,
        padding: 14,
        shadowColor: "rgba(60,60,67,0.12)",
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    },
  } as const,
});

const StepperItem = styled(Button, {
  backgroundColor: "transparent",
  chromeless: true,
  minWidth: 0,
  padding: 0,
  variants: {
    active: {
      true: {},
    },
    platform: {
      android: {
        pressStyle: {
          backgroundColor: "transparent",
        },
      },
      ios: {
        pressStyle: {
          opacity: 0.8,
        },
      },
    },
  } as const,
});

const SectionLabel = styled(Text, {
  color: "$textSecondary",
  fontWeight: "600",
  letterSpacing: 0.2,
  textTransform: "uppercase",
  variants: {
    platform: {
      android: {
        fontSize: 10,
        lineHeight: 12,
      },
      ios: {
        fontSize: 11,
        lineHeight: 13,
      },
    },
  } as const,
});

const SectionCard = styled(YStack, {
  backgroundColor: "$cardBackground",
  overflow: "hidden",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        elevation: 2,
        shadowColor: "rgba(0,0,0,0.16)",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      ios: {
        borderRadius: 14,
        shadowColor: "rgba(60,60,67,0.08)",
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    },
  } as const,
});

const RowButton = styled(Button, {
  alignItems: "stretch",
  backgroundColor: "$cardBackground",
  chromeless: true,
  justifyContent: "flex-start",
  width: "100%",
  variants: {
    platform: {
      android: {
        minHeight: 56,
        paddingHorizontal: 12,
        paddingVertical: 11,
        pressStyle: {
          backgroundColor: "$separator",
        },
      },
      ios: {
        minHeight: 54,
        paddingHorizontal: 16,
        paddingVertical: 10,
        pressStyle: {
          opacity: 0.72,
        },
      },
    },
    selected: {
      true: {
        backgroundColor: "$appBackground",
      },
    },
  } as const,
});

const TimeChip = styled(Button, {
  backgroundColor: "$cardBackground",
  borderColor: "$separator",
  borderWidth: 1,
  chromeless: true,
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        minHeight: 40,
        minWidth: 74,
        paddingHorizontal: 12,
        pressStyle: {
          backgroundColor: "$separator",
        },
      },
      ios: {
        borderRadius: 10,
        minHeight: 32,
        minWidth: 68,
        paddingHorizontal: 11,
        pressStyle: {
          opacity: 0.72,
        },
      },
    },
    selected: {
      true: {
        backgroundColor: "$primary",
        borderColor: "$primary",
      },
    },
  } as const,
});

const PrimaryAction = styled(Button, {
  backgroundColor: "$primary",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        minHeight: 50,
      },
      ios: {
        borderRadius: 12,
        minHeight: 48,
        pressStyle: {
          opacity: 0.82,
        },
      },
    },
  } as const,
});

function BookingSection({
  children,
  description,
  platform,
  title,
}: BookingSectionProps) {
  return (
    <YStack gap={platform === "ios" ? "$2.5" : "$2"}>
      <YStack gap="$1">
        <SectionLabel platform={platform}>{title}</SectionLabel>
        {description ? (
          <Paragraph color="$textSecondary" size="$3">
            {description}
          </Paragraph>
        ) : null}
      </YStack>
      <SectionCard platform={platform}>{children}</SectionCard>
    </YStack>
  );
}

function BookingRow({
  before,
  indicator,
  onPress,
  overline,
  platform,
  selected = false,
  subtitle,
  title,
}: BookingRowProps) {
  const isIos = platform === "ios";
  const content = (
    <XStack
      alignItems="center"
      gap="$3"
      justifyContent="space-between"
      width="100%"
    >
      <XStack alignItems="center" flex={1} gap="$3">
        {before}
        <YStack flex={1} gap="$1">
          {overline ? (
            <Text
              color="$textSecondary"
              fontSize={isIos ? 11 : 10}
              fontWeight="600"
              lineHeight={isIos ? 13 : 12}
              textTransform="uppercase"
            >
              {overline}
            </Text>
          ) : null}
          <Text
            color="$textPrimary"
            fontSize={isIos ? 17 : 16}
            fontWeight="600"
            lineHeight={isIos ? 22 : 20}
          >
            {title}
          </Text>
          {subtitle ? (
            <Paragraph
              color="$textSecondary"
              fontSize={isIos ? 13 : 12}
              lineHeight={isIos ? 18 : 16}
            >
              {subtitle}
            </Paragraph>
          ) : null}
        </YStack>
      </XStack>
      {indicator ? (
        <XStack alignItems="center" justifyContent="flex-end">
          {indicator}
        </XStack>
      ) : null}
    </XStack>
  );

  if (!onPress) {
    return (
      <YStack paddingHorizontal={platform === "ios" ? 16 : 12} paddingVertical={12}>
        {content}
      </YStack>
    );
  }

  return (
    <RowButton
      onPress={onPress}
      platform={platform}
      selected={selected}
    >
      {content}
    </RowButton>
  );
}

function BookingState({
  action,
  description,
  platform,
  title,
}: {
  action?: ReactNode;
  description?: string | null;
  platform: BookingPlatformVariant;
  title: string;
}) {
  const isIos = platform === "ios";
  return (
    <YStack
      alignItems="center"
      backgroundColor="$sheetBackground"
      gap="$3"
      justifyContent="center"
      paddingVertical={platform === "ios" ? 40 : 28}
    >
      <Text
        color="$textPrimary"
        fontSize={isIos ? 22 : 20}
        fontWeight="700"
        lineHeight={isIos ? 28 : 24}
        textAlign="center"
      >
        {title}
      </Text>
      {description ? (
        <Paragraph
          color="$textSecondary"
          fontSize={isIos ? 15 : 14}
          lineHeight={isIos ? 20 : 18}
          maxWidth={420}
          textAlign="center"
        >
          {description}
        </Paragraph>
      ) : null}
      {action}
    </YStack>
  );
}

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

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtc - date.getTime()) / 60_000;
}

function getDateKeyForTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days, 12));
  const nextYear = nextDate.getUTCFullYear();
  const nextMonth = `${nextDate.getUTCMonth() + 1}`.padStart(2, "0");
  const nextDay = `${nextDate.getUTCDate()}`.padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function toTimeZoneIsoDate(dateKey: string, timeZone: string, hour = 12) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const firstOffset = getTimeZoneOffsetMinutes(guessUtc, timeZone);
  const firstPass = new Date(guessUtc.getTime() - firstOffset * 60_000);
  const secondOffset = getTimeZoneOffsetMinutes(firstPass, timeZone);
  const resolvedDate =
    firstOffset === secondOffset
      ? firstPass
      : new Date(guessUtc.getTime() - secondOffset * 60_000);

  return resolvedDate.toISOString();
}

function formatDateLabel(dateKey: string, locale: string, timeZone: string) {
  const date = new Date(toTimeZoneIsoDate(dateKey, timeZone));

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(date);
}

function getProcedureSelectionKey(procedure: Procedure) {
  return `${procedure.id}:${procedure.masterId ?? "any"}`;
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
  const platform = useMemo(
    () => getBookingPlatformVariant(detectBookingAdaptivePlatform()),
    [],
  );
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
  const [selectedProcedureKey, setSelectedProcedureKey] = useState<string | null>(null);
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
  const slotsRequestIdRef = useRef(0);

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
          setTimeZoneId(profileResult.value.timeZoneId || "UTC");
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
    if (!selectedProcedureKey) {
      return null;
    }

    return (
      procedures.find(
        (procedure) => getProcedureSelectionKey(procedure) === selectedProcedureKey,
      ) ?? null
    );
  }, [procedures, selectedProcedureKey]);

  const resetTimingState = () => {
    slotsRequestIdRef.current += 1;
    setSelectedSlot(null);
    setSelectedDateKey(null);
    setSlots([]);
    setSlotsLoading(false);
    setSlotsError(null);
  };

  const fetchSlotsForProcedure = useCallback(async (procedure: Procedure, dateKey: string) => {
    const requestId = ++slotsRequestIdRef.current;

    try {
      setSlotsLoading(true);
      setSlotsError(null);
      setSelectedSlot(null);

      const data = await searchSalonSlots({
        date: toTimeZoneIsoDate(dateKey, timeZoneId),
        executorId: procedure.masterId,
        procedureId: procedure.id,
        salonId,
      });

      if (requestId !== slotsRequestIdRef.current) {
        return;
      }

      setSlots(Array.isArray(data?.intervals) ? data.intervals : []);
      setTimeZoneId(data?.timeZoneId || timeZoneId);
    } catch (error) {
      if (requestId !== slotsRequestIdRef.current) {
        return;
      }

      const message = error instanceof BookingApiError ? error.message : undefined;

      setSlotsError(
        message ? t("errors.apiMessage", { message }) : t("errors.loadSlots"),
      );
      setSlots([]);
    } finally {
      if (requestId === slotsRequestIdRef.current) {
        setSlotsLoading(false);
      }
    }
  }, [salonId, t, timeZoneId]);

  const handleSelectGroup = (group: ProcedureGroup) => {
    setSelectedGroupId(group.id);
    setSelectedProcedureKey(null);
    resetTimingState();
    setGlobalError(null);

    if (group.procedures.length === 1) {
      const [onlyProcedure] = group.procedures;
      setSelectedProcedureKey(getProcedureSelectionKey(onlyProcedure));
      setCurrentStep("time");
      return;
    }

    setCurrentStep("master");
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    setSelectedProcedureKey(getProcedureSelectionKey(procedure));
    resetTimingState();
    setGlobalError(null);
    setCurrentStep("time");
  };

  const dateOptions = useMemo<DateOption[]>(() => {
    const todayKey = getDateKeyForTimeZone(new Date(), timeZoneId);

    return Array.from({ length: DAYS_AHEAD }, (_, index) => {
      const key = addDaysToDateKey(todayKey, index);
      return {
        key,
        label: formatDateLabel(key, locale, timeZoneId),
      };
    });
  }, [locale, timeZoneId]);

  useEffect(() => {
    if (!dateOptions.length) {
      return;
    }

    if (!selectedDateKey || !dateOptions.some((option) => option.key === selectedDateKey)) {
      setSelectedDateKey(dateOptions[0]?.key ?? null);
    }
  }, [dateOptions, selectedDateKey]);

  useEffect(() => {
    if (!selectedProcedure || !selectedDateKey) {
      return;
    }

    void fetchSlotsForProcedure(selectedProcedure, selectedDateKey);
  }, [fetchSlotsForProcedure, selectedDateKey, selectedProcedure]);

  const slotOptions = useMemo<SlotOption[]>(() => {
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      hour12: false,
      minute: "2-digit",
      timeZone: timeZoneId,
    });

    return [...slots]
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .map((slot) => {
        const startDate = new Date(slot.start);
        const parts = getTimeZoneParts(startDate, timeZoneId);

        return {
          end: slot.end,
          hour: Number(parts.hour),
          label: timeFormatter.format(startDate),
          start: slot.start,
        };
      });
  }, [locale, slots, timeZoneId]);

  const slotPeriods = useMemo(() => {
    if (!slotOptions.length) {
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
        slots: slotOptions.filter(
          (slot) => slot.hour >= period.minHour && slot.hour <= period.maxHour,
        ),
      }))
      .filter((period) => period.slots.length > 0);
  }, [slotOptions, t]);

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
        <BookingState
          platform={platform}
          title={t("loading.procedures")}
          description={t("subtitle")}
          action={<Spinner />}
        />
      );
    }

    if (proceduresError) {
      return (
        <BookingState
          platform={platform}
          title={t("errors.loadProcedures")}
          description={proceduresError}
        />
      );
    }

    if (!procedureGroups.length) {
      return (
        <BookingState
          platform={platform}
          title={t("serviceEmptyTitle")}
          description={t("serviceEmptyHint")}
        />
      );
    }

    return (
      <BookingSection platform={platform} title={t("serviceTitle")}>
        {procedureGroups.map((group) => {
          const groupPrice = formatCurrency(group.minPrice, group.currency, locale);
          const groupDuration = formatDuration(group.duration, locale);
          const indicator =
            [groupPrice, groupDuration].filter(Boolean).join(" · ") || undefined;

          return (
            <YStack key={group.id}>
              <BookingRow
                indicator={
                  <YStack alignItems="flex-end" gap="$1">
                    {indicator ? (
                      <Text
                        color="$primary"
                        fontSize={platform === "ios" ? 15 : 14}
                        fontWeight="600"
                        lineHeight={platform === "ios" ? 18 : 16}
                      >
                        {indicator}
                      </Text>
                    ) : null}
                    <Text color="$textSecondary">
                      <ChevronRight color="currentColor" size={16} />
                    </Text>
                  </YStack>
                }
                onPress={() => handleSelectGroup(group)}
                overline={
                  group.procedures.length > 1
                    ? `${group.procedures.length} ${t("steps.master").toLowerCase()}`
                    : t("masterAuto")
                }
                platform={platform}
                subtitle={group.description ?? undefined}
                title={group.title}
              />
              <Separator />
            </YStack>
          );
        })}
      </BookingSection>
    );
  };

  const renderMastersStep = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <BookingSection platform={platform} title={t("masterTitle")}>
        {selectedGroup.procedures.map((procedure) => {
          const priceLabel = formatCurrency(
            procedure.price?.amount ?? selectedGroup.minPrice,
            procedure.price?.currency ?? selectedGroup.currency,
            locale,
          );
          const durationLabel = formatDuration(procedure.duration, locale);
          const indicator =
            [priceLabel, durationLabel].filter(Boolean).join(" · ") || undefined;
          const subtitle =
            procedure.alias && procedure.alias !== procedure.masterNickname
              ? procedure.alias
              : t("steps.master");

          return (
            <YStack key={getProcedureSelectionKey(procedure)}>
              <BookingRow
                before={
                  <Avatar circular size="$5">
                    <Avatar.Image src={procedure.masterAvatar ?? undefined} />
                    <Avatar.Fallback alignItems="center" justifyContent="center">
                      <Text fontSize={16} fontWeight="700" lineHeight={18}>
                        {getInitials(
                          procedure.masterNickname ??
                            procedure.alias ??
                            t("steps.master"),
                        )}
                      </Text>
                    </Avatar.Fallback>
                  </Avatar>
                }
                indicator={
                  <YStack alignItems="flex-end" gap="$1">
                    {indicator ? (
                      <Text
                        color="$primary"
                        fontSize={platform === "ios" ? 15 : 14}
                        fontWeight="600"
                        lineHeight={platform === "ios" ? 18 : 16}
                      >
                        {indicator}
                      </Text>
                    ) : null}
                    <Text color="$textSecondary">
                      <ChevronRight color="currentColor" size={16} />
                    </Text>
                  </YStack>
                }
                onPress={() => handleSelectProcedure(procedure)}
                platform={platform}
                subtitle={subtitle}
                title={procedure.masterNickname ?? procedure.alias ?? t("masterAny")}
              />
              <Separator />
            </YStack>
          );
        })}
      </BookingSection>
    );
  };

  const renderTimeStep = () => {
    return (
      <YStack gap="$4">
        <BookingSection
          description={t("timeHint")}
          platform={platform}
          title={t("timeSelectDate")}
        >
          <XStack flexWrap="wrap" gap="$2" padding={platform === "ios" ? 12 : 10}>
            {dateOptions.map((option) => {
              const isSelected = selectedDateKey === option.key;

              return (
                <TimeChip
                  key={option.key}
                  onPress={() => setSelectedDateKey(option.key)}
                  platform={platform}
                  selected={isSelected}
                >
                  <Text
                    color={isSelected ? "white" : "$textPrimary"}
                    fontSize={platform === "ios" ? 14 : 13}
                    fontWeight="600"
                    lineHeight={platform === "ios" ? 18 : 16}
                  >
                    {option.label}
                  </Text>
                </TimeChip>
              );
            })}
          </XStack>
        </BookingSection>

        {slotsLoading ? (
          <BookingState
            platform={platform}
            title={t("loading.slots")}
            description={t("timeHint")}
            action={<Spinner />}
          />
        ) : null}

        {!slotsLoading && slotsError ? (
          <BookingState
            platform={platform}
            title={t("timeEmptyTitle")}
            description={slotsError}
            action={
              <PrimaryAction
                onPress={() =>
                  selectedProcedure &&
                  selectedDateKey &&
                  fetchSlotsForProcedure(selectedProcedure, selectedDateKey)
                }
                platform={platform}
              >
                <Text color="white" fontSize={17} fontWeight="600" lineHeight={22}>
                  {t("timeReload")}
                </Text>
              </PrimaryAction>
            }
          />
        ) : null}

        {!slotsLoading && !slotsError && !slotOptions.length ? (
          <BookingState
            platform={platform}
            title={t("timeEmptyTitle")}
            description={t("timeEmptyHint")}
            action={
              <PrimaryAction
                onPress={() =>
                  selectedProcedure &&
                  selectedDateKey &&
                  fetchSlotsForProcedure(selectedProcedure, selectedDateKey)
                }
                platform={platform}
              >
                <Text color="white" fontSize={17} fontWeight="600" lineHeight={22}>
                  {t("timeReload")}
                </Text>
              </PrimaryAction>
            }
          />
        ) : null}

        {!slotsLoading && !slotsError
          ? slotPeriods.map((period) => (
              <YStack key={period.key} gap="$2">
                <SectionLabel platform={platform}>{period.label}</SectionLabel>
                <XStack flexWrap="wrap" gap="$2">
                  {period.slots.map((slot) => {
                    const isSelected =
                      selectedSlot?.start === slot.start &&
                      selectedSlot?.end === slot.end;

                    return (
                      <TimeChip
                        key={slot.start}
                        onPress={() => handleSelectSlot(slot)}
                        platform={platform}
                        selected={isSelected}
                      >
                        <Text
                          color={isSelected ? "white" : "$textPrimary"}
                          fontSize={platform === "ios" ? 15 : 14}
                          fontWeight="600"
                          lineHeight={platform === "ios" ? 20 : 18}
                        >
                          {slot.label}
                        </Text>
                      </TimeChip>
                    );
                  })}
                </XStack>
              </YStack>
            ))
          : null}

        <Button
          chromeless
          onPress={() =>
            selectedProcedure &&
            selectedDateKey &&
            fetchSlotsForProcedure(selectedProcedure, selectedDateKey)
          }
          padding={0}
          width={130}
        >
          <Text
            color="$primary"
            fontSize={platform === "ios" ? 15 : 14}
            fontWeight="600"
            lineHeight={platform === "ios" ? 20 : 18}
          >
            {t("timeReload")}
          </Text>
        </Button>
      </YStack>
    );
  };

  const renderSummarySection = () => {
    if (!selectedGroup) {
      return null;
    }

    return (
      <BookingSection platform={platform} title={t("summaryTitle")}>
        <YStack>
          <BookingRow
            indicator={
              selectedProcedurePrice ? (
                <Text
                  color="$primary"
                  fontSize={platform === "ios" ? 15 : 14}
                  fontWeight="600"
                  lineHeight={platform === "ios" ? 18 : 16}
                >
                  {selectedProcedurePrice}
                </Text>
              ) : null
            }
            overline={t("summaryService")}
            platform={platform}
            subtitle={selectedProcedure?.masterNickname ?? t("masterAny")}
            title={selectedGroup.title}
          />
          <Separator />
        </YStack>

        {selectedSlot ? (
          <YStack>
            <BookingRow
              indicator={
                selectedProcedureDuration ? (
                  <Text
                    color="$textSecondary"
                    fontSize={platform === "ios" ? 13 : 12}
                    lineHeight={platform === "ios" ? 18 : 16}
                  >
                    {selectedProcedureDuration}
                  </Text>
                ) : null
              }
              overline={t("summaryDate")}
              platform={platform}
              subtitle={selectedTimeText ?? undefined}
              title={selectedDateText ?? "—"}
            />
            <Separator />
          </YStack>
        ) : null}

        <BookingRow
          overline={t("summarySalon")}
          platform={platform}
          subtitle={salonAddress}
          title={salonName}
        />
      </BookingSection>
    );
  };

  const renderDetailsStep = () => (
    <form onSubmit={handleSubmitAppointment}>
      <YStack gap="$4">
        <BookingSection
          title={t("detailsTitle")}
          description={t("fieldPhoneHelper")}
          platform={platform}
        >
          <YStack gap={0}>
            <YStack gap="$2">
              <Input
                autoComplete="name"
                aria-label={t("fieldNameLabel")}
                backgroundColor="$cardBackground"
                borderColor="transparent"
                borderRadius={0}
                color="$textPrimary"
                fontSize={17}
                minHeight={platform === "ios" ? 48 : 44}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setClientName(event.target.value);
                  if (formErrors.name) {
                    setFormErrors((current) => ({ ...current, name: undefined }));
                  }
                }}
                placeholder={t("fieldNamePlaceholder")}
                placeholderTextColor="$textSecondary"
                value={clientName}
              />
            </YStack>

            <Separator backgroundColor="$separator" />

            <YStack gap="$2">
              <Input
                autoComplete="tel"
                aria-label={t("fieldPhoneLabel")}
                backgroundColor="$cardBackground"
                borderColor="transparent"
                borderRadius={0}
                color="$textPrimary"
                fontSize={17}
                inputMode="tel"
                minHeight={platform === "ios" ? 48 : 44}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  setClientPhone(event.target.value);
                  if (formErrors.phone) {
                    setFormErrors((current) => ({ ...current, phone: undefined }));
                  }
                }}
                placeholder={t("fieldPhonePlaceholder")}
                placeholderTextColor="$textSecondary"
                value={clientPhone}
              />
            </YStack>
          </YStack>
        </BookingSection>

        {formErrors.name || formErrors.phone || globalError ? (
          <BookingSection platform={platform} title={t("errors.createAppointment")}>
            <BookingRow
              platform={platform}
              title={formErrors.name || formErrors.phone || globalError || ""}
            />
          </BookingSection>
        ) : null}

        {renderSummarySection()}

        <YStack gap="$2">
          <PrimaryAction
            disabled={!isFormValid || isSubmitting}
            platform={platform}
            type="submit"
            width="100%"
          >
            <XStack alignItems="center" gap="$2">
              {isSubmitting ? <Spinner /> : null}
              <Text color="white" fontSize={17} fontWeight="600" lineHeight={22}>
                {isSubmitting ? t("loading.submit") : t("submitLabel")}
              </Text>
            </XStack>
          </PrimaryAction>
          <Paragraph color="$textSecondary" fontSize={13} lineHeight={18}>
            {t("detailsHint")}
          </Paragraph>
        </YStack>
      </YStack>
    </form>
  );

  const steps: Array<{ id: Step; label: string }> = [
    { id: "service", label: t("steps.service") },
    { id: "master", label: t("steps.master") },
    { id: "time", label: t("steps.time") },
    { id: "details", label: t("steps.details") },
  ];

  return (
    <SheetRoot platform={platform}>
      <YStack alignSelf="center" gap="$4" maxWidth={560} width="100%">
        <HeroCard platform={platform}>
          <XStack alignItems="center" gap="$3">
            <Avatar circular size="$5">
              <Avatar.Image src={salonProfile?.logo ?? undefined} />
              <Avatar.Fallback alignItems="center" justifyContent="center">
                <Text color="$textPrimary" fontSize={16} fontWeight="700" lineHeight={18}>
                  {getInitials(salonName)}
                </Text>
              </Avatar.Fallback>
            </Avatar>
            <YStack flex={1} gap="$0.5">
              <Text color="$textPrimary" fontSize={17} fontWeight="700" lineHeight={22}>
                {salonName}
              </Text>
              <Paragraph color="$textSecondary" fontSize={13} lineHeight={18}>
                {salonAddress ?? t("subtitle")}
              </Paragraph>
            </YStack>
          </XStack>

          <XStack alignItems="center" flexWrap="wrap" gap="$2">
            {steps.map((step, index) => {
              const isActive = currentStep === step.id;
              const isClickable =
                step.id !== currentStep &&
                ((step.id === "service") ||
                  (step.id === "master" && selectedGroup?.procedures.length) ||
                  (step.id === "time" && selectedProcedure) ||
                  (step.id === "details" && selectedSlot));

              return (
                <XStack key={step.id} alignItems="center" gap="$2">
                  <StepperItem
                    active={isActive}
                    onPress={
                      isClickable
                        ? () => {
                            setCurrentStep(step.id);
                          }
                        : undefined
                    }
                    platform={platform}
                  >
                    <Text
                      color={isActive ? "$primary" : "$textSecondary"}
                      fontSize={13}
                      fontWeight={isActive ? "600" : "600"}
                      lineHeight={18}
                    >
                      {step.label}
                    </Text>
                  </StepperItem>
                  {index < steps.length - 1 ? (
                    <Text color="$textSecondary" fontSize="$3">
                      •
                    </Text>
                  ) : null}
                </XStack>
              );
            })}
          </XStack>
        </HeroCard>

        {currentStep === "service" ? renderServiceStep() : null}
        {currentStep === "master" ? renderMastersStep() : null}
        {currentStep === "time" ? renderTimeStep() : null}
        {currentStep === "details" ? renderDetailsStep() : null}
      </YStack>
    </SheetRoot>
  );
};

export default BookingScreen;
