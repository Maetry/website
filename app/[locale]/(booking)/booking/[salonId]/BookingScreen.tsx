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

import { useTranslations } from "next-intl";
import {
  Anchor,
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
  ApiError,
} from "@/lib/api/error-handler";
import {
  createPublicBooking,
  getPublicSalonCatalog,
  getPublicSalonProfile,
  getPublicSalonMasters,
  searchPublicBookingSlots,
  type PublicSalonProfile,
} from "@/lib/api/public-booking";
import {
  adaptCatalogToProcedures,
  type Procedure,
  type ProcedureGroup,
  type SlotInterval,
  type Step,
} from "@/lib/public-booking-screen";
import { BOOKING_IOS_SHEET_HEADER } from "@/src/features/booking/iosSheetHeader";
import {
  BOOKING_SURFACE_RADIUS,
  bookingSurfaceRadius,
} from "@/src/features/booking/surfaceRadius";
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

type TimePeriodKey = "morning" | "day" | "evening" | "night";

const DAYS_AHEAD = 21;

/** Ниже этой ширины полоса шагов может переноситься на вторую строку. */
const STEPS_ROW_WRAP_BELOW_PX = 200;

/** Горизонтальный отступ заголовка/подписи секции — как у RowButton внутри карточки. */
function bookingSectionHeaderPaddingX(platform: BookingPlatformVariant): number {
  return platform === "ios" ? 18 : 14;
}

const BOOKING_MASTER_AVATAR_PX = 40;
/** Как gap между аватаром и текстом в RowButton (Tamagui `$3`). */
const BOOKING_ROW_LEADING_GAP_PX = 12;

function bookingSectionSeparatorInsetLeading(
  platform: BookingPlatformVariant,
  variant: "default" | "form" | "withAvatar",
): number {
  const pad = bookingSectionHeaderPaddingX(platform);
  if (variant === "form") {
    return pad;
  }
  if (variant === "withAvatar") {
    return pad + BOOKING_MASTER_AVATAR_PX + BOOKING_ROW_LEADING_GAP_PX;
  }
  return pad;
}

function SectionSeparator({
  marginTop,
  platform,
  variant = "default",
}: {
  marginTop?: number | string;
  platform: BookingPlatformVariant;
  variant?: "default" | "form" | "withAvatar";
}) {
  const inset = bookingSectionSeparatorInsetLeading(platform, variant);
  return (
    <YStack marginTop={marginTop} paddingLeft={inset} width="100%">
      <Separator backgroundColor={variant === "form" ? "$separator" : undefined} />
    </YStack>
  );
}

function SalonHeaderSkeleton({
  ariaLabel,
  platform,
}: {
  ariaLabel: string;
  platform: BookingPlatformVariant;
}) {
  const isIos = platform === "ios";
  const avatarSize = isIos ? BOOKING_IOS_SHEET_HEADER.avatarSize : 64;
  const rowGap = isIos ? BOOKING_IOS_SHEET_HEADER.avatarToTextGap : 12;
  const titleGap = isIos ? BOOKING_IOS_SHEET_HEADER.titleToSubtitleGap : 4;
  const titleH = isIos ? BOOKING_IOS_SHEET_HEADER.titleLineHeight : 34;
  const subH = isIos ? BOOKING_IOS_SHEET_HEADER.subtitleLineHeight : 20;
  const track = "rgba(60,60,67,0.14)";

  return (
    <XStack alignItems="center" aria-busy aria-label={ariaLabel} gap={rowGap} role="status" width="100%">
      <YStack
        backgroundColor={track}
        borderRadius={999}
        height={avatarSize}
        width={avatarSize}
      />
      <YStack flex={1} gap={titleGap}>
        <YStack
          backgroundColor={track}
          borderRadius={6}
          height={titleH}
          maxWidth="78%"
          width="100%"
        />
        <YStack
          backgroundColor={track}
          borderRadius={6}
          height={subH}
          maxWidth="100%"
          width="100%"
        />
      </YStack>
    </XStack>
  );
}

type BookingSectionProps = {
  children: ReactNode;
  description?: string | null;
  footer?: ReactNode;
  platform: BookingPlatformVariant;
  title: string;
};

type BookingRowProps = {
  before?: ReactNode;
  ctaLabel?: string | null;
  indicator?: ReactNode;
  onPress?: () => void;
  overline?: string | null;
  platform: BookingPlatformVariant;
  selected?: boolean;
  subtitle?: string | null;
  title: string;
};

type ProcedureCategoryGroup = {
  groups: ProcedureGroup[];
  id: string;
  title: string;
};

const SheetRoot = styled(YStack, {
  backgroundColor: "$appBackground",
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
        borderRadius: BOOKING_SURFACE_RADIUS.android,
        elevation: 2,
        shadowColor: "rgba(0,0,0,0.16)",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      ios: {
        borderRadius: BOOKING_SURFACE_RADIUS.ios,
      },
    },
  } as const,
});

const RowButton = styled(Button, {
  alignItems: "stretch",
  backgroundColor: "$cardBackground",
  borderRadius: 0,
  chromeless: true,
  justifyContent: "flex-start",
  width: "100%",
  variants: {
    platform: {
      android: {
        minHeight: 58,
        paddingHorizontal: 14,
        paddingVertical: 12,
        pressStyle: {
          backgroundColor: "$separator",
        },
      },
      ios: {
        minHeight: 64,
        paddingHorizontal: 18,
        paddingVertical: 16,
        pressStyle: {
          opacity: 0.74,
        },
      },
    },
    selected: {
      true: {
        backgroundColor: "rgba(0,122,255,0.1)",
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
        borderRadius: BOOKING_SURFACE_RADIUS.android,
        minHeight: 52,
      },
      ios: {
        borderRadius: 999,
        minHeight: 50,
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
  footer,
  platform,
  title,
}: BookingSectionProps) {
  const sectionGap = platform === "ios" ? "$2.5" : "$2";
  const cardBlock =
    footer != null ? (
      <YStack gap={0} width="100%">
        <SectionCard platform={platform}>{children}</SectionCard>
        {footer}
      </YStack>
    ) : (
      <SectionCard platform={platform}>{children}</SectionCard>
    );

  return (
    <YStack gap={sectionGap}>
      <YStack gap="$1" paddingHorizontal={bookingSectionHeaderPaddingX(platform)}>
        <SectionLabel platform={platform}>{title}</SectionLabel>
        {description ? (
          <Paragraph color="$textSecondary" fontSize={platform === "ios" ? 13 : undefined} size="$3">
            {description}
          </Paragraph>
        ) : null}
      </YStack>
      {cardBlock}
    </YStack>
  );
}

function BookingRow({
  before,
  ctaLabel,
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
      ) : ctaLabel ? (
        <Text color="$primary" fontSize={13} fontWeight="600">
          {ctaLabel}
        </Text>
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
      backgroundColor="$cardBackground"
      borderRadius={bookingSurfaceRadius(platform)}
      gap="$3"
      justifyContent="center"
      paddingHorizontal="$4"
      paddingVertical={isIos ? 36 : 28}
      width="100%"
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

function buildSlotsCacheKey(procedure: Procedure, dateKey: string) {
  return `${getProcedureSelectionKey(procedure)}|${dateKey}`;
}

function validatePhone(value: string) {
  return /^\+\d{10,15}$/.test(normalizePhone(value));
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  return digits ? `+${digits}` : "";
}

function resolveApiMessage(
  error: unknown,
  fallbackMessage: string,
  apiMessageTemplate: (message: string) => string,
) {
  if (error instanceof ApiError && error.message) {
    return apiMessageTemplate(error.message);
  }

  if (error instanceof Error && error.message) {
    return apiMessageTemplate(error.message);
  }

  return fallbackMessage;
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

function inferProcedureCategoryLabel(group: ProcedureGroup) {
  const title = group.title.trim();

  for (const separator of [":", " - ", " — ", " / "]) {
    if (title.includes(separator)) {
      const prefix = title.split(separator)[0]?.trim();
      if (prefix && prefix.length >= 3 && prefix.length <= 28) {
        return prefix;
      }
    }
  }

  return null;
}

function getNightPeriodLabel(locale: string) {
  const lowerLocale = locale.toLowerCase();

  if (lowerLocale.startsWith("ru")) {
    return "Ночь";
  }

  if (lowerLocale.startsWith("es")) {
    return "Noche";
  }

  return "Night";
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
  const apiMessageTemplate = useCallback(
    (message: string) => t("errors.apiMessage", { message }),
    [t],
  );

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
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{ name?: string; phone?: string }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const slotsRequestIdRef = useRef(0);
  const slotsCacheRef = useRef<Map<string, SlotInterval[]>>(new Map());
  const stepsRowMeasureRef = useRef<HTMLDivElement | null>(null);
  const [stepsRowNarrow, setStepsRowNarrow] = useState(false);

  useEffect(() => {
    const el = stepsRowMeasureRef.current;
    if (!el || typeof ResizeObserver === "undefined") {
      return;
    }
    const update = () => {
      const w = el.getBoundingClientRect().width;
      setStepsRowNarrow(w > 0 && w < STEPS_ROW_WRAP_BELOW_PX);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        setProceduresLoading(true);
        setProceduresError(null);

        const [catalogResult, profileResult, mastersResult] = await Promise.allSettled([
          getPublicSalonCatalog(salonId, {
            locale,
            signal: controller.signal,
          }),
          getPublicSalonProfile(salonId, {
            locale,
            signal: controller.signal,
          }),
          getPublicSalonMasters(salonId, {
            locale,
            signal: controller.signal,
          }),
        ]);

        if (catalogResult.status === "fulfilled") {
          const masters =
            mastersResult.status === "fulfilled" ? mastersResult.value : [];
          setProcedures(adaptCatalogToProcedures(catalogResult.value, masters));
        } else {
          setProceduresError(
            resolveApiMessage(
              catalogResult.reason,
              t("errors.loadProcedures"),
              apiMessageTemplate,
            ),
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

        setProceduresError(
          resolveApiMessage(error, t("errors.loadProcedures"), apiMessageTemplate),
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
  }, [apiMessageTemplate, locale, salonId, t]);

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

  const procedureCategories = useMemo<ProcedureCategoryGroup[]>(() => {
    const grouped = new Map<string, ProcedureCategoryGroup>();

    procedureGroups.forEach((group) => {
      const label = inferProcedureCategoryLabel(group) ?? "Services";
      const key = label.toLowerCase();
      const existing = grouped.get(key);

      if (existing) {
        existing.groups.push(group);
        return;
      }

      grouped.set(key, {
        groups: [group],
        id: key,
        title: label,
      });
    });

    return Array.from(grouped.values());
  }, [procedureGroups]);

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

  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    if (!procedureCategories.length) {
      setExpandedCategoryId(null);
      return;
    }

    if (
      !expandedCategoryId ||
      !procedureCategories.some((category) => category.id === expandedCategoryId)
    ) {
      setExpandedCategoryId(procedureCategories[0]?.id ?? null);
    }
  }, [expandedCategoryId, procedureCategories]);

  const resetTimingState = () => {
    slotsRequestIdRef.current += 1;
    slotsCacheRef.current.clear();
    setSelectedSlot(null);
    setSelectedDateKey(null);
    setSlots([]);
    setSlotsLoading(false);
    setSlotsError(null);
  };

  const fetchSlotsForProcedure = useCallback(
    async (procedure: Procedure, dateKey: string, options?: { force?: boolean }) => {
    const cacheKey = buildSlotsCacheKey(procedure, dateKey);
    if (options?.force) {
      slotsCacheRef.current.delete(cacheKey);
    }

    const requestId = ++slotsRequestIdRef.current;

    try {
      setSlotsLoading(true);
      setSlotsError(null);

      const data = await searchPublicBookingSlots({
        body:
          procedure.kind === "complex"
            ? {
                id: procedure.id,
                procedures: (procedure.complexProcedureIds ?? []).map((id) => ({
                  ...(procedure.masterId ? { executorId: procedure.masterId } : {}),
                  id,
                })),
              }
            : {
                ...(procedure.masterId ? { executorId: procedure.masterId } : {}),
                id: procedure.id,
              },
        date: toTimeZoneIsoDate(dateKey, timeZoneId),
        salonId,
      });

      if (requestId !== slotsRequestIdRef.current) {
        return;
      }

      const intervals =
        "intervals" in data
          ? data.intervals
          : data.slots.map((slot) => slot.total);
      slotsCacheRef.current.set(cacheKey, intervals);
      setSlots(intervals);
      setTimeZoneId(data?.timeZoneId || timeZoneId);
    } catch (error) {
      if (requestId !== slotsRequestIdRef.current) {
        return;
      }

      setSlotsError(
        resolveApiMessage(error, t("errors.loadSlots"), apiMessageTemplate),
      );
      setSlots([]);
    } finally {
      if (requestId === slotsRequestIdRef.current) {
        setSlotsLoading(false);
      }
    }
  },
  [apiMessageTemplate, salonId, t, timeZoneId],
);

  const handleSelectGroup = (group: ProcedureGroup) => {
    setSelectedGroupId(group.id);
    setSelectedProcedureKey(null);
    resetTimingState();
    setGlobalError(null);

    if (group.procedures.length === 1) {
      const [onlyProcedure] = group.procedures;
      setSelectedProcedureKey(getProcedureSelectionKey(onlyProcedure));
      return;
    }
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    setSelectedProcedureKey(getProcedureSelectionKey(procedure));
    resetTimingState();
    setGlobalError(null);
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
    setSelectedSlot(null);
  }, [selectedDateKey]);

  useEffect(() => {
    if (!selectedProcedure || !selectedDateKey) {
      return;
    }

    const cacheKey = buildSlotsCacheKey(selectedProcedure, selectedDateKey);
    const cached = slotsCacheRef.current.get(cacheKey);
    if (cached) {
      setSlots(cached);
      setSlotsError(null);
      setSlotsLoading(false);
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
        maxHour: 21,
        minHour: 18,
      },
      {
        key: "night",
        label: getNightPeriodLabel(locale),
        maxHour: 23,
        minHour: 22,
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
  }, [locale, slotOptions, t]);

  const handleSelectSlot = (slot: SlotInterval) => {
    setSelectedSlot(slot);
    setGlobalError(null);
    setFormErrors({});
  };

  const isFormValid =
    clientName.trim().length > 0 && validatePhone(normalizePhone(clientPhone));

  const handleSubmitAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = clientName.trim();
    const normalizedPhone = normalizePhone(clientPhone);
    const nextErrors: { name?: string; phone?: string } = {};

    if (!trimmedName) {
      nextErrors.name = t("errors.validationName");
    }

    if (!validatePhone(normalizedPhone)) {
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

    try {
      const data = await createPublicBooking(salonId, {
        clientName: trimmedName,
        clientPhone: normalizedPhone,
        ...(selectedProcedure.masterId ? { executorId: selectedProcedure.masterId } : {}),
        ...(selectedProcedure.kind === "complex"
          ? { complexId: selectedProcedure.id }
          : { procedureId: selectedProcedure.id }),
        time: {
          end: new Date(selectedSlot.end).toISOString(),
          start: new Date(selectedSlot.start).toISOString(),
        },
        ...(trackingId ? { trackingId } : {}),
      });

      const appointmentId = data.appointmentId;

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
      setGlobalError(
        resolveApiMessage(error, t("errors.createAppointment"), apiMessageTemplate),
      );
      setIsSubmitting(false);
    }
  };

  const salonName =
    salonProfile?.name?.trim() ||
    (proceduresLoading ? "" : t("salonFallbackName"));
  const salonAddress = formatAddress(salonProfile?.address) || undefined;

  const selectedProcedurePrice = formatCurrency(
    selectedProcedure?.price?.amount ?? selectedGroup?.minPrice ?? null,
    selectedProcedure?.price?.currency ?? selectedGroup?.currency ?? null,
    locale,
  );

  /** День недели, дата и время в одной строке для свёрнутой секции времени. */
  const selectedSlotSummaryTitle = selectedSlot
    ? new Intl.DateTimeFormat(locale, {
        day: "numeric",
        hour: "2-digit",
        hour12: false,
        minute: "2-digit",
        month: "short",
        timeZone: timeZoneId,
        weekday: "short",
      }).format(new Date(selectedSlot.start))
    : null;

  const selectedSlotDurationSubtitle =
    selectedSlot && selectedProcedure
      ? t("summaryDurationLine", {
          value:
            formatDuration(
              selectedProcedure.duration ?? selectedGroup?.duration ?? null,
              locale,
            ) ?? "—",
        })
      : null;

  const currentVisualStep: Step = selectedSlot
    ? "details"
    : selectedProcedure
      ? "time"
      : selectedGroup
        ? "master"
        : "service";

  const mapAddressUrl = salonAddress
    ? `https://maps.apple.com/?q=${encodeURIComponent(salonName)}&address=${encodeURIComponent(salonAddress)}`
    : null;

  const slotCalendarDays = useMemo(() => {
    return dateOptions.map((option) => {
      const date = new Date(toTimeZoneIsoDate(option.key, timeZoneId));

      return {
        dayLabel: new Intl.DateTimeFormat(locale, {
          day: "numeric",
          timeZone: timeZoneId,
        }).format(date),
        isToday:
          option.key ===
          getDateKeyForTimeZone(new Date(), timeZoneId),
        key: option.key,
        monthLabel: new Intl.DateTimeFormat(locale, {
          month: "long",
          timeZone: timeZoneId,
        }).format(date),
        weekdayLabel: new Intl.DateTimeFormat(locale, {
          timeZone: timeZoneId,
          weekday: "short",
        }).format(date),
      };
    });
  }, [dateOptions, locale, timeZoneId]);

  const slotMonthTitle =
    slotCalendarDays.find((day) => day.key === selectedDateKey)?.monthLabel ??
    slotCalendarDays[0]?.monthLabel ??
    "";

  const slotCalendarWeekChipWidth = platform === "ios" ? 42 : 40;

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

    const shouldUseCategories =
      procedureCategories.length > 1 &&
      procedureCategories.some((category) => category.title !== "Services");

    const renderServiceGroupRow = (
      group: ProcedureGroup,
      index: number,
      arrayLength: number,
    ) => {
      const firstProcedure = group.procedures[0];
      const groupPrice = formatCurrency(group.minPrice, group.currency, locale);
      const groupDuration = formatDuration(group.duration, locale);
      const indicator =
        [groupPrice, groupDuration].filter(Boolean).join(" · ") || undefined;
      const overline =
        firstProcedure?.kind === "complex"
          ? `${t("complexLabel")} · ${t("complexIncludes", {
              count: firstProcedure.bundleSize ?? 0,
            })}`
          : group.procedures.length > 1
            ? `${group.procedures.length} ${t("steps.master").toLowerCase()}`
            : t("masterAuto");

      return (
        <YStack key={group.id}>
          <BookingRow
            indicator={
              indicator ? (
                <Text
                  color="$primary"
                  fontSize={platform === "ios" ? 15 : 14}
                  fontWeight="600"
                  lineHeight={platform === "ios" ? 18 : 16}
                  textAlign="right"
                >
                  {indicator}
                </Text>
              ) : null
            }
            onPress={() => handleSelectGroup(group)}
            overline={overline}
            platform={platform}
            subtitle={group.description ?? undefined}
            title={group.title}
          />
          {index < arrayLength - 1 ? (
            <SectionSeparator platform={platform} />
          ) : null}
        </YStack>
      );
    };

    const selectedGroupCategoryTag = selectedGroup
      ? procedureCategories.find((category) =>
          category.groups.some((group) => group.id === selectedGroup.id),
        )?.title
      : null;

    if (selectedGroup && currentVisualStep !== "service") {
      return (
        <BookingSection platform={platform} title={t("serviceTitle")}>
          <BookingRow
            ctaLabel={t("changeSelectionShort")}
            onPress={() => {
              setSelectedGroupId(null);
              setSelectedProcedureKey(null);
              setSelectedSlot(null);
            }}
            platform={platform}
            subtitle={
              selectedGroupCategoryTag
                ? `#${selectedGroupCategoryTag}`
                : (selectedGroup.description ?? undefined)
            }
            title={selectedProcedure?.serviceTitle ?? selectedGroup.title}
          />
        </BookingSection>
      );
    }

    if (!shouldUseCategories) {
      return (
        <BookingSection platform={platform} title={t("serviceTitle")}>
          {procedureGroups.map((group, index) =>
            renderServiceGroupRow(group, index, procedureGroups.length),
          )}
        </BookingSection>
      );
    }

    return (
      <BookingSection platform={platform} title={t("serviceTitle")}>
        <YStack gap="$3" width="100%">
          {procedureCategories.map((category) => (
            <YStack
              key={category.id}
              backgroundColor="$appBackground"
              borderRadius={bookingSurfaceRadius(platform)}
              overflow="hidden"
            >
              <Button
                backgroundColor="$appBackground"
                borderRadius={bookingSurfaceRadius(platform)}
                chromeless
                onPress={() =>
                  setExpandedCategoryId((current) =>
                    current === category.id ? null : category.id,
                  )
                }
                paddingHorizontal="$4"
                paddingVertical="$3"
              >
                <XStack alignItems="center" justifyContent="space-between" width="100%">
                  <Text color="$textPrimary" fontSize="$5" fontWeight="600">
                    {category.title}
                  </Text>
                  <Text color="$textSecondary" fontSize="$4">
                    {expandedCategoryId === category.id ? "−" : "+"}
                  </Text>
                </XStack>
              </Button>

              {expandedCategoryId === category.id ? (
                <YStack backgroundColor="$cardBackground" overflow="hidden">
                  {category.groups.map((group, index) =>
                    renderServiceGroupRow(group, index, category.groups.length),
                  )}
                </YStack>
              ) : null}
            </YStack>
          ))}
        </YStack>
      </BookingSection>
    );
  };

  const renderMastersStep = () => {
    if (!selectedGroup) {
      return null;
    }

    if (selectedProcedure && currentVisualStep !== "master") {
      return (
        <BookingSection platform={platform} title={t("masterTitle")}>
          <BookingRow
            ctaLabel={t("changeSelectionShort")}
            onPress={() => {
              setSelectedProcedureKey(null);
              setSelectedSlot(null);
            }}
            platform={platform}
            subtitle={
              selectedProcedure.masterPosition?.trim()
                ? selectedProcedure.masterPosition.trim()
                : undefined
            }
            title={selectedProcedure.masterNickname ?? selectedProcedure.alias ?? t("masterAny")}
          />
        </BookingSection>
      );
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
                  <Avatar circular size={BOOKING_MASTER_AVATAR_PX}>
                    <Avatar.Image src={procedure.masterAvatar ?? undefined} />
                    <Avatar.Fallback alignItems="center" justifyContent="center">
                      <Text fontSize={14} fontWeight="700" lineHeight={16}>
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
                  indicator ? (
                    <Text
                      color="$primary"
                      fontSize={platform === "ios" ? 15 : 14}
                      fontWeight="600"
                      lineHeight={platform === "ios" ? 18 : 16}
                      textAlign="right"
                    >
                      {indicator}
                    </Text>
                  ) : null
                }
                onPress={() => handleSelectProcedure(procedure)}
                platform={platform}
                subtitle={subtitle}
                title={procedure.masterNickname ?? procedure.alias ?? t("masterAny")}
              />
              <SectionSeparator platform={platform} variant="withAvatar" />
            </YStack>
          );
        })}
      </BookingSection>
    );
  };

  const renderTimeStep = () => {
    if (!selectedProcedure) {
      return null;
    }

    if (selectedSlot && currentVisualStep !== "time") {
      return (
        <YStack gap={0}>
          <BookingSection platform={platform} title={t("timeTitle")}>
            <BookingRow
              ctaLabel={t("changeSelectionShort")}
              onPress={() => {
                setSelectedSlot(null);
              }}
              platform={platform}
              subtitle={selectedSlotDurationSubtitle ?? undefined}
              title={selectedSlotSummaryTitle ?? "—"}
            />
          </BookingSection>
          <Paragraph
            color="$textSecondary"
            fontSize={13}
            lineHeight={18}
            paddingHorizontal={bookingSectionHeaderPaddingX(platform)}
            paddingTop={0}
            size="$3"
          >
            {t("timeHint")}
          </Paragraph>
        </YStack>
      );
    }

    const sectionTitlePadding = bookingSectionHeaderPaddingX(platform);
    const isIosTime = platform === "ios";
    /** Совпадает с `padding="$4"` на теле карточки времени (Tamagui space). */
    const timeCardInnerPadX = 16;

    return (
      <YStack gap={platform === "ios" ? "$2.5" : "$2"}>
        <YStack gap="$1" paddingHorizontal={sectionTitlePadding}>
          <SectionLabel platform={platform}>{t("timeTitle")}</SectionLabel>
        </YStack>

        {slotsLoading ? (
          <BookingState
            platform={platform}
            title={t("loading.slots")}
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
                  fetchSlotsForProcedure(selectedProcedure, selectedDateKey, {
                    force: true,
                  })
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
                  fetchSlotsForProcedure(selectedProcedure, selectedDateKey, {
                    force: true,
                  })
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

        <YStack gap={0}>
          {!slotsLoading ? (
            <SectionCard platform={platform}>
              <YStack gap="$3" paddingHorizontal="$4">
                <YStack gap={0}>
                  <XStack alignItems="center" justifyContent="space-between" style={{ fontSize: 0 }}>
                    <Text
                      color="$textPrimary"
                      fontSize={isIosTime ? 17 : 16}
                      fontWeight="600"
                      lineHeight={isIosTime ? 22 : 20}
                    >
                      {slotMonthTitle}
                    </Text>
                    <Button
                      chromeless
                      onPress={() => {
                        const today = slotCalendarDays.find((day) => day.isToday);
                        if (today) {
                          setSelectedDateKey(today.key);
                        }
                      }}
                      padding={0}
                    >
                      <Text color="$primary" fontSize={13} fontWeight="600">
                        {t("timeToday")}
                      </Text>
                    </Button>
                  </XStack>

                  <div
                    className="booking-calendar-scroll"
                    style={{
                      marginLeft: -timeCardInnerPadX,
                      marginRight: -timeCardInnerPadX,
                      msOverflowStyle: "none",
                      overflowX: "auto",
                      paddingBottom: 0,
                      scrollSnapType: "x proximity",
                      scrollbarWidth: "none",
                    }}
                  >
                    <XStack gap="$1" paddingHorizontal={8} width="max-content">
                      {slotCalendarDays.map((day) => {
                        const isSelected = selectedDateKey === day.key;
                        return (
                          <YStack
                            key={day.key}
                            alignItems="center"
                            gap="$1"
                            minWidth={slotCalendarWeekChipWidth}
                            style={{ scrollSnapAlign: "start" }}
                          >
                            <Text
                              color={
                                day.weekdayLabel.toLowerCase().startsWith("s")
                                  ? "#ff5a5f"
                                  : "$textSecondary"
                              }
                              fontSize={11}
                              fontWeight="500"
                            >
                              {day.weekdayLabel.replace(".", "")}
                            </Text>
                            <Button
                              alignItems="center"
                              backgroundColor={isSelected ? "#2b2d36" : "transparent"}
                              borderRadius={999}
                              chromeless
                              height={40}
                              justifyContent="center"
                              onPress={() => setSelectedDateKey(day.key)}
                              width={40}
                            >
                              <Text
                                color={isSelected ? "$primary" : "$textPrimary"}
                                fontSize={16}
                                fontWeight="500"
                              >
                                {day.dayLabel}
                              </Text>
                            </Button>
                          </YStack>
                        );
                      })}
                    </XStack>
                  </div>
                </YStack>

                {slotPeriods.map((period) => (
                  <YStack key={period.key} gap="$3">
                    <Text
                      color="$textSecondary"
                      fontSize="$6"
                      fontWeight="500"
                      letterSpacing={0.4}
                      textTransform="uppercase"
                    >
                      {period.label}
                    </Text>
                    <XStack flexWrap="wrap" gap="$3" paddingBottom="$2">
                      {period.slots.map((slot) => {
                        const isSelected =
                          selectedSlot?.start === slot.start &&
                          selectedSlot?.end === slot.end;

                        return (
                          <Button
                            key={slot.start}
                            backgroundColor={isSelected ? "$primary" : "#f1f5fc"}
                            borderRadius={bookingSurfaceRadius(platform)}
                            chromeless
                            minWidth={92}
                            onPress={() => handleSelectSlot(slot)}
                            paddingHorizontal="$4"
                            paddingVertical="$3"
                          >
                            <Text
                              color={isSelected ? "white" : "$textPrimary"}
                              fontSize="$6"
                              fontWeight="500"
                            >
                              {slot.label}
                            </Text>
                          </Button>
                        );
                      })}
                    </XStack>
                  </YStack>
                ))}
              </YStack>
            </SectionCard>
          ) : null}

          <Paragraph
            color="$textSecondary"
            fontSize={13}
            lineHeight={18}
            paddingHorizontal={sectionTitlePadding}
            paddingTop={0}
            size="$3"
          >
            {t("timeHint")}
          </Paragraph>
        </YStack>
      </YStack>
    );
  };

  const renderDetailsStep = () => {
    const formPadX = 0;
    const detailsHeaderPadX = bookingSectionHeaderPaddingX(platform);

    return (
    <form onSubmit={handleSubmitAppointment}>
      <YStack gap="$4">
        <BookingSection
          footer={
            <YStack paddingHorizontal={detailsHeaderPadX} paddingTop={0} width="100%">
              <Text
                color="$textSecondary"
                fontSize={platform === "ios" ? 13 : 12}
                lineHeight={platform === "ios" ? 18 : 16}
                selectable
              >
                {t("fieldPhoneHelper")}
              </Text>
            </YStack>
          }
          title={t("detailsTitle")}
          platform={platform}
        >
          <YStack gap={0} width="100%">
            <YStack paddingHorizontal={formPadX} paddingVertical={0} width="100%">
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
                width="100%"
              />
            </YStack>

            <SectionSeparator marginTop={0} platform={platform} variant="form" />

            <YStack paddingHorizontal={formPadX} paddingVertical={0} width="100%">
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
                width="100%"
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
        </YStack>
      </YStack>
    </form>
    );
  };

  const steps: Array<{ id: Step; label: string }> = [
    { id: "service", label: t("steps.service") },
    { id: "master", label: t("steps.master") },
    { id: "time", label: t("steps.time") },
    { id: "details", label: t("steps.details") },
  ];
  const activeStepIndex = Math.max(
    steps.findIndex((step) => step.id === currentVisualStep),
    0,
  );

  return (
    <SheetRoot
      platform={platform}
      style={{
        background:
          "linear-gradient(180deg, rgba(242,242,247,0.96) 0%, rgba(233,233,238,1) 100%)",
      }}
    >
      <YStack alignSelf="center" gap="$4" maxWidth={560} paddingBottom="$4" width="100%">
        {proceduresLoading ? (
          <SalonHeaderSkeleton ariaLabel={t("loading.salon")} platform={platform} />
        ) : (
          <XStack
            alignItems="center"
            gap={platform === "ios" ? BOOKING_IOS_SHEET_HEADER.avatarToTextGap : "$3"}
          >
            <Avatar
              circular
              size={platform === "ios" ? BOOKING_IOS_SHEET_HEADER.avatarSize : "$6"}
            >
              <Avatar.Image src={salonProfile?.logo ?? undefined} />
              <Avatar.Fallback alignItems="center" justifyContent="center">
                <Text
                  color="$primary"
                  fontSize={
                    platform === "ios" ? BOOKING_IOS_SHEET_HEADER.initialsFontSize : 18
                  }
                  fontWeight="700"
                >
                  {getInitials(salonName)}
                </Text>
              </Avatar.Fallback>
            </Avatar>

            <YStack
              flex={1}
              gap={
                platform === "ios" ? BOOKING_IOS_SHEET_HEADER.titleToSubtitleGap : "$1"
              }
            >
              <Text
                color="$textPrimary"
                fontSize={
                  platform === "ios" ? BOOKING_IOS_SHEET_HEADER.titleFontSize : "$10"
                }
                fontWeight={
                  platform === "ios"
                    ? BOOKING_IOS_SHEET_HEADER.titleFontWeight
                    : "800"
                }
                lineHeight={
                  platform === "ios"
                    ? BOOKING_IOS_SHEET_HEADER.titleLineHeight
                    : 34
                }
              >
                {salonName}
              </Text>
              {mapAddressUrl ? (
                <Anchor
                  alignSelf="flex-start"
                  color="$textSecondary"
                  display="block"
                  fontSize={
                    platform === "ios"
                      ? BOOKING_IOS_SHEET_HEADER.subtitleFontSize
                      : 14
                  }
                  href={mapAddressUrl}
                  lineHeight={
                    platform === "ios"
                      ? BOOKING_IOS_SHEET_HEADER.subtitleLineHeight
                      : 20
                  }
                  rel="noopener noreferrer"
                  target="_blank"
                  textDecorationLine="none"
                  hoverStyle={{ opacity: 0.72 }}
                  pressStyle={{ opacity: 0.72 }}
                >
                  {salonAddress}
                </Anchor>
              ) : (
                <Paragraph
                  color="$textSecondary"
                  fontSize={
                    platform === "ios"
                      ? BOOKING_IOS_SHEET_HEADER.subtitleFontSize
                      : 14
                  }
                  lineHeight={
                    platform === "ios"
                      ? BOOKING_IOS_SHEET_HEADER.subtitleLineHeight
                      : 20
                  }
                >
                  {salonAddress ?? t("subtitle")}
                </Paragraph>
              )}
            </YStack>
          </XStack>
        )}

        <div className="flex w-full max-w-full justify-center" ref={stepsRowMeasureRef}>
          <XStack
            alignItems="center"
            flexWrap={stepsRowNarrow ? "wrap" : "nowrap"}
            gap="$2"
            justifyContent="center"
            maxWidth="100%"
          >
            {steps.map((step, index) => {
              const isActive = currentVisualStep === step.id;
              const isDone = index < activeStepIndex;

              return (
                <XStack key={step.id} alignItems="center" flexShrink={stepsRowNarrow ? 1 : 0} gap="$2">
                  <Text
                    color={isActive ? "$primary" : isDone ? "$textPrimary" : "$textSecondary"}
                    fontSize={platform === "ios" ? 18 : 16}
                    fontWeight={isActive ? "700" : "600"}
                  >
                    {step.label}
                  </Text>
                  {index < steps.length - 1 ? (
                    <Text color="rgba(60,60,67,0.35)" fontSize="$3">
                      •
                    </Text>
                  ) : null}
                </XStack>
              );
            })}
          </XStack>
        </div>

        {renderServiceStep()}
        {selectedGroup ? renderMastersStep() : null}
        {selectedProcedure ? renderTimeStep() : null}
        {selectedSlot && selectedProcedurePrice ? (
          <BookingSection
            footer={(
              <Paragraph
                color="$textSecondary"
                fontSize={platform === "ios" ? 13 : 12}
                lineHeight={platform === "ios" ? 18 : 16}
                paddingHorizontal={bookingSectionHeaderPaddingX(platform)}
                paddingTop={0}
                size="$3"
              >
                {t("summaryTotalFooter")}
              </Paragraph>
            )}
            platform={platform}
            title={t("summaryTotalTitle")}
          >
            <XStack
              alignItems="center"
              justifyContent="space-between"
              paddingHorizontal={bookingSectionHeaderPaddingX(platform)}
              paddingVertical={platform === "ios" ? 16 : 14}
            >
              <Text
                color="$textPrimary"
                fontSize={platform === "ios" ? 17 : 16}
                fontWeight="600"
                lineHeight={platform === "ios" ? 22 : 20}
              >
                {t("summaryTotalLabel")}
              </Text>
              <Text
                color="$primary"
                fontSize={platform === "ios" ? 17 : 16}
                fontWeight="500"
                lineHeight={platform === "ios" ? 22 : 20}
              >
                {selectedProcedurePrice}
              </Text>
            </XStack>
          </BookingSection>
        ) : null}
        {selectedSlot ? renderDetailsStep() : null}
        <style jsx global>{`
          .booking-calendar-scroll::-webkit-scrollbar {
            display: none;
            height: 0;
            width: 0;
          }
        `}</style>
      </YStack>
    </SheetRoot>
  );
};

export default BookingScreen;
