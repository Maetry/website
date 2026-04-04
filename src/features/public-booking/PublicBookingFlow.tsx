"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { ApiError } from "@/lib/api/error-handler";
import {
  PublicBookingVisit,
  PublicComplexSlot,
  PublicDateInterval,
  PublicMarketingCampaign,
  PublicSalonCatalog,
  PublicSalonCatalogComplex,
  PublicSalonCatalogComplexProcedure,
  PublicSalonCatalogProcedure,
  PublicSalonMaster,
  PublicSalonProfile,
  PublicSearchSlotsResponse,
  createPublicBooking,
  getPublicBooking,
  isAuthorizationGap,
  readPublicBookingContext,
  savePublicBookingContext,
} from "@/lib/api/public-booking";
import {
  publicBookingKeys,
  publicBookingSlotsQueryOptions,
  publicSalonCatalogQueryOptions,
  publicSalonMastersQueryOptions,
  publicSalonProfileQueryOptions,
} from "@/lib/api/public-booking.queries";

type PublicBookingFlowProps = {
  campaign: PublicMarketingCampaign | null;
  initialTrackingId?: string | null;
  linkId: string;
  locale: string;
  salonId: string;
};

type StepId = "service" | "time" | "details" | "success";

type MasterOption = {
  avatarUrl?: string | null;
  id: string;
  name: string;
  position?: string | null;
};

type ProcedureSelection = {
  description?: string | null;
  durationMinutes?: number | null;
  id: string;
  kind: "procedure";
  masterOptions: MasterOption[];
  price?: { amount?: number | null; currency?: string | null } | null;
  title: string;
};

type ComplexSelectionProcedure = {
  id: string;
  masterIds: string[];
};

type ComplexSelection = {
  description?: string | null;
  durationMinutes?: number | null;
  id: string;
  kind: "complex";
  masterOptions: MasterOption[];
  procedureCount: number;
  procedures: ComplexSelectionProcedure[];
  title: string;
};

type SelectionOption = ProcedureSelection | ComplexSelection;

type SelectedSlot = {
  id: string;
  interval: PublicDateInterval;
  slot?: PublicComplexSlot;
};

type SalonDataState = {
  catalog: PublicSalonCatalog | null;
  catalogError: string | null;
  contractGap: boolean;
  masters: PublicSalonMaster[];
  mastersError: string | null;
  profile: PublicSalonProfile | null;
  profileError: string | null;
  status: "loading" | "ready" | "error";
};

type SlotsState = {
  data: PublicSearchSlotsResponse | null;
  error: string | null;
  status: "idle" | "loading" | "ready" | "error";
};

type ConfirmationState = {
  booking: PublicBookingVisit | null;
  bookingId: string | null;
  error: string | null;
  status: "idle" | "loading" | "ready" | "error";
};

const DATE_OPTIONS_DAYS = 14;
const DEFAULT_TIME_ZONE = "UTC";

function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
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

function formatDuration(minutes?: number | null, locale?: string) {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  const normalizedLocale = locale?.toLowerCase() ?? "en";

  if (normalizedLocale.startsWith("ru")) {
    if (hours && restMinutes) {
      return `${hours} ч ${restMinutes} мин`;
    }

    if (hours) {
      return `${hours} ч`;
    }

    return `${restMinutes} мин`;
  }

  if (normalizedLocale.startsWith("es")) {
    if (hours && restMinutes) {
      return `${hours} h ${restMinutes} min`;
    }

    if (hours) {
      return `${hours} h`;
    }

    return `${restMinutes} min`;
  }

  if (hours && restMinutes) {
    return `${hours}h ${restMinutes}m`;
  }

  if (hours) {
    return `${hours}h`;
  }

  return `${restMinutes}m`;
}

function formatAddress(address?: PublicSalonProfile["address"]) {
  if (!address) {
    return null;
  }

  return [address.address, address.city, address.country]
    .filter((part) => Boolean(part?.trim()))
    .join(", ");
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

  return (asUtc - date.getTime()) / 60000;
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

function formatDateValue(value: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    timeZone,
    weekday: "long",
  }).format(new Date(value));
}

function formatTimeValue(value: string, locale: string, timeZone: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    timeZone,
  }).format(new Date(value));
}

function formatPhoneInput(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "").slice(0, 15);

  if (!digits) {
    return rawValue.trim().startsWith("+") ? "+" : "";
  }

  const groups = digits.match(/.{1,3}/g) ?? [digits];
  return `+${groups.join(" ")}`;
}

function normalizePhone(rawValue: string) {
  const digits = rawValue.replace(/\D/g, "");
  return digits ? `+${digits}` : "";
}

function resolveRequestError(
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

function normalizeMaster(
  masterId: string,
  masterName: string,
  mastersById: Map<string, PublicSalonMaster>,
  avatarUrl?: string | null,
): MasterOption {
  const master = mastersById.get(masterId);

  return {
    avatarUrl: master?.logo ?? avatarUrl ?? null,
    id: masterId,
    name: master?.nickname ?? masterName,
    position: master?.position ?? null,
  };
}

function buildSelectionOptions(
  catalog: PublicSalonCatalog | null,
  masters: PublicSalonMaster[],
) {
  if (!catalog) {
    return [];
  }

  const mastersById = new Map(
    masters
      .filter((master): master is PublicSalonMaster & { id: string } => Boolean(master.id))
      .map((master) => [master.id as string, master]),
  );

  const procedureOptions: SelectionOption[] = (catalog.procedures ?? [])
    .filter((procedure) => procedure.id && !procedure.archived)
    .filter((procedure) => procedure.onlineBookingEnabled !== false)
    .map((procedure) => buildProcedureSelection(procedure, mastersById))
    .filter(isDefined);

  const complexOptions: SelectionOption[] = (catalog.complexes ?? [])
    .filter((complex) => complex.id && (complex.procedures?.length ?? 0) > 0)
    .map((complex) => buildComplexSelection(complex, mastersById))
    .filter(isDefined);

  return [...procedureOptions, ...complexOptions];
}

function buildProcedureSelection(
  procedure: PublicSalonCatalogProcedure,
  mastersById: Map<string, PublicSalonMaster>,
) {
  if (!procedure.id) {
    return null;
  }

  const masterOptions = Array.from(
    new Map(
      (procedure.executions ?? [])
        .filter(
          (execution): execution is NonNullable<typeof execution> & {
            masterId: string;
            masterName: string;
          } => Boolean(execution.masterId && execution.masterName),
        )
        .map((execution) => [
          execution.masterId,
          normalizeMaster(
            execution.masterId,
            execution.masterName,
            mastersById,
            execution.masterAvatar,
          ),
        ]),
    ).values(),
  );

  return {
    description: procedure.description ?? null,
    durationMinutes: procedure.minDuration ?? null,
    id: procedure.id,
    kind: "procedure" as const,
    masterOptions,
    price: procedure.minPrice ?? null,
    title:
      procedure.title?.trim() ||
      procedure.serviceTitle?.trim() ||
      procedure.id,
  };
}

function buildComplexSelection(
  complex: PublicSalonCatalogComplex,
  mastersById: Map<string, PublicSalonMaster>,
) {
  if (!complex.id || !complex.procedures?.length) {
    return null;
  }

  const procedures = complex.procedures
    .filter((procedure): procedure is PublicSalonCatalogComplexProcedure & { id: string } =>
      Boolean(procedure.id),
    )
    .map((procedure) => {
      const masterOptions = Array.from(
        new Map(
          (procedure.executions ?? [])
            .filter(
              (execution): execution is NonNullable<typeof execution> & {
                masterId: string;
                masterName: string;
              } => Boolean(execution.masterId && execution.masterName),
            )
            .map((execution) => [
              execution.masterId,
              normalizeMaster(
                execution.masterId,
                execution.masterName,
                mastersById,
                execution.masterAvatar,
              ),
            ]),
        ).values(),
      );

      return {
        id: procedure.id,
        masterOptions,
        masterIds: masterOptions.map((option) => option.id),
      };
    });

  const durationMinutes = complex.procedures.reduce<number | null>((total, procedure) => {
    if (!procedure.minDuration) {
      return total;
    }

    return (total ?? 0) + procedure.minDuration;
  }, 0);

  const sharedMasterIds = procedures.reduce<string[]>((acc, procedure, index) => {
    if (index === 0) {
      return [...procedure.masterIds];
    }

    return acc.filter((masterId) => procedure.masterIds.includes(masterId));
  }, []);

  const masterOptionsById = new Map(
    procedures.flatMap((procedure) =>
      procedure.masterOptions.map((master) => [master.id, master] as const),
    ),
  );

  const masterOptions = sharedMasterIds
    .map((masterId) => masterOptionsById.get(masterId) ?? null)
    .filter((master): master is MasterOption => Boolean(master));

  return {
    description: complex.description ?? null,
    durationMinutes,
    id: complex.id,
    kind: "complex" as const,
    masterOptions,
    procedureCount: procedures.length,
    procedures,
    title: complex.title?.trim() || complex.id,
  };
}

function buildSlotOptions(
  response: PublicSearchSlotsResponse | null,
  locale: string,
  timeZone: string,
): Array<{
  id: string;
  interval: PublicDateInterval;
  label: string;
  slot?: PublicComplexSlot;
}> {
  if (!response) {
    return [];
  }

  if ("intervals" in response) {
    return response.intervals.map((interval) => ({
      id: interval.start,
      interval,
      label: `${formatTimeValue(interval.start, locale, timeZone)} - ${formatTimeValue(interval.end, locale, timeZone)}`,
      slot: undefined,
    }));
  }

  return response.slots.map((slot) => ({
    id: slot.total.start,
    interval: slot.total,
    label: `${formatTimeValue(slot.total.start, locale, timeZone)} - ${formatTimeValue(slot.total.end, locale, timeZone)}`,
    slot,
  }));
}

function Avatar({
  imageUrl,
  name,
  size = "md",
}: {
  imageUrl?: string | null;
  name?: string | null;
  size?: "md" | "lg";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-2xl border border-white/50 bg-white/70 text-xs font-semibold text-slate-700 shadow-sm",
        size === "lg" ? "h-14 w-14" : "h-11 w-11",
      )}
      style={
        imageUrl
          ? {
              backgroundImage: `url(${imageUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }
          : undefined
      }
    >
      {!imageUrl ? getInitials(name) : null}
    </div>
  );
}

function StepBadge({
  active,
  done,
  label,
  number,
}: {
  active: boolean;
  done: boolean;
  label: string;
  number: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition",
          active
            ? "border-slate-900 bg-slate-900 text-white"
            : done
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-400",
        )}
      >
        {done ? "✓" : number}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          active || done ? "text-slate-900" : "text-slate-400",
        )}
      >
        {label}
      </span>
    </div>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
  type = "button",
  variant = "primary",
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300",
        variant === "primary"
          ? "bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300"
          : "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 disabled:text-slate-400",
        disabled && "cursor-not-allowed",
      )}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}

function StatusCard({
  actionLabel,
  message,
  onAction,
  title,
  tone = "neutral",
}: {
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
  tone?: "danger" | "neutral";
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border p-5",
        tone === "danger"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-slate-200 bg-slate-50 text-slate-700",
      )}
    >
      <div className="space-y-2">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm leading-6">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <div className="mt-4">
          <ActionButton onClick={onAction} variant="secondary">
            {actionLabel}
          </ActionButton>
        </div>
      ) : null}
    </div>
  );
}

export function PublicBookingFlow({
  campaign,
  initialTrackingId,
  linkId,
  locale,
  salonId,
}: PublicBookingFlowProps) {
  const t = useTranslations("booking");
  const commonT = useTranslations("common");
  const queryClient = useQueryClient();

  const apiMessageTemplate = useCallback(
    (message: string) => t("errors.apiMessage", { message }),
    [t],
  );

  const [currentStep, setCurrentStep] = useState<StepId>("service");
  const [selectedSelectionId, setSelectedSelectionId] = useState<string | null>(
    null,
  );
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlot | null>(null);
  const [salonTimeZone, setSalonTimeZone] = useState<string>(
    DEFAULT_TIME_ZONE,
  );
  const [trackingId, setTrackingId] = useState<string | null>(
    initialTrackingId ?? null,
  );
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    selection?: string;
    slot?: string;
  }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationState, setConfirmationState] = useState<ConfirmationState>({
    booking: null,
    bookingId: null,
    error: null,
    status: "idle",
  });

  const submitGuardRef = useRef(false);
  const confirmationLoadRequestRef = useRef(0);

  const profileQuery = useQuery(publicSalonProfileQueryOptions(salonId, locale));
  const catalogQuery = useQuery(publicSalonCatalogQueryOptions(salonId, locale));
  const mastersQuery = useQuery(publicSalonMastersQueryOptions(salonId, locale));

  const salonData = useMemo<SalonDataState>(() => {
    const profileError = profileQuery.error
      ? resolveRequestError(
          profileQuery.error,
          t("errors.loadSalonData"),
          apiMessageTemplate,
        )
      : null;
    const catalogError = catalogQuery.error
      ? resolveRequestError(
          catalogQuery.error,
          t("errors.loadSalonData"),
          apiMessageTemplate,
        )
      : null;
    const mastersError = mastersQuery.error
      ? resolveRequestError(
          mastersQuery.error,
          t("errors.loadSalonData"),
          apiMessageTemplate,
        )
      : null;

    return {
      catalog: catalogQuery.data ?? null,
      catalogError,
      contractGap:
        isAuthorizationGap(profileQuery.error) ||
        isAuthorizationGap(catalogQuery.error) ||
        isAuthorizationGap(mastersQuery.error),
      masters: mastersQuery.data ?? [],
      mastersError,
      profile: profileQuery.data ?? null,
      profileError,
      status:
        catalogQuery.isPending && !catalogQuery.data
          ? "loading"
          : catalogQuery.data
            ? "ready"
            : "error",
    };
  }, [
    apiMessageTemplate,
    catalogQuery.data,
    catalogQuery.error,
    catalogQuery.isPending,
    mastersQuery.data,
    mastersQuery.error,
    profileQuery.data,
    profileQuery.error,
    t,
  ]);

  const fallbackTimeZone =
    salonData.profile?.timeZoneId ||
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : null) ||
    DEFAULT_TIME_ZONE;

  useEffect(() => {
    setSalonTimeZone(fallbackTimeZone);
  }, [fallbackTimeZone]);

  useEffect(() => {
    const storedContext = readPublicBookingContext();
    const nextTrackingId = initialTrackingId ?? storedContext?.trackingId ?? null;

    setTrackingId(nextTrackingId);
    savePublicBookingContext({
      campaignId: campaign?.id ?? storedContext?.campaignId ?? null,
      kind: "marketing",
      linkId,
      salonId,
      savedAt: new Date().toISOString(),
      trackingId: nextTrackingId,
    });
  }, [campaign?.id, initialTrackingId, linkId, salonId]);

  const loadSalonData = useCallback(async () => {
    await Promise.allSettled([
      profileQuery.refetch(),
      catalogQuery.refetch(),
      mastersQuery.refetch(),
    ]);
  }, [catalogQuery, mastersQuery, profileQuery]);

  const selectionOptions = useMemo(
    () => buildSelectionOptions(salonData.catalog, salonData.masters),
    [salonData.catalog, salonData.masters],
  );

  const selectedSelection = useMemo(
    () =>
      selectionOptions.find((selection) => selection.id === selectedSelectionId) ??
      null,
    [selectedSelectionId, selectionOptions],
  );

  const dateOptions = useMemo(() => {
    const todayKey = getDateKeyForTimeZone(new Date(), salonTimeZone);

    return Array.from({ length: DATE_OPTIONS_DAYS }, (_, index) =>
      addDaysToDateKey(todayKey, index),
    );
  }, [salonTimeZone]);

  useEffect(() => {
    if (!selectedDateKey && dateOptions[0]) {
      setSelectedDateKey(dateOptions[0]);
      return;
    }

    if (selectedDateKey && !dateOptions.includes(selectedDateKey) && dateOptions[0]) {
      setSelectedDateKey(dateOptions[0]);
    }
  }, [dateOptions, selectedDateKey]);

  useEffect(() => {
    if (!selectedSelection) {
      setSelectedMasterId(null);
      setSelectedSlot(null);
      return;
    }

    if (selectedSelection.masterOptions.length === 1) {
      setSelectedMasterId(selectedSelection.masterOptions[0]?.id ?? null);
    } else if (
      selectedMasterId &&
      !selectedSelection.masterOptions.some((master) => master.id === selectedMasterId)
    ) {
      setSelectedMasterId(null);
    }

    setSelectedSlot(null);
  }, [selectedSelection, selectedMasterId]);

  useEffect(() => {
    setSelectedSlot(null);
  }, [selectedDateKey, selectedMasterId]);

  const selectedSlotsQueryParams = useMemo(() => {
    if (!selectedSelection || !selectedDateKey) {
      return null;
    }

    return {
      date: toTimeZoneIsoDate(selectedDateKey, salonTimeZone),
      masterId: selectedMasterId,
      procedureIds:
        selectedSelection.kind === "complex"
          ? selectedSelection.procedures.map((procedure) => procedure.id)
          : undefined,
      salonId,
      selectionId: selectedSelection.id,
      selectionKind: selectedSelection.kind,
      timeZone: salonTimeZone,
    } as const;
  }, [
    salonId,
    salonTimeZone,
    selectedDateKey,
    selectedMasterId,
    selectedSelection,
  ]);

  const selectedSlotsQueryOptions = useMemo(
    () =>
      selectedSlotsQueryParams
        ? publicBookingSlotsQueryOptions(selectedSlotsQueryParams)
        : null,
    [selectedSlotsQueryParams],
  );

  const slotsQuery = useQuery<PublicSearchSlotsResponse>({
    gcTime: selectedSlotsQueryOptions?.gcTime ?? 30 * 60 * 1000,
    queryFn: ({ signal }) => {
      if (!selectedSlotsQueryOptions) {
        throw new Error("Slots query is not enabled");
      }

      return selectedSlotsQueryOptions.queryFn({ signal });
    },
    queryKey:
      selectedSlotsQueryOptions?.queryKey ??
      publicBookingKeys.slots({
        date: "idle",
        masterId: null,
        procedureIds: [],
        salonId,
        selectionId: "idle",
        selectionKind: "procedure",
        timeZone: salonTimeZone,
      }),
    enabled: Boolean(selectedSlotsQueryParams),
    staleTime: selectedSlotsQueryOptions?.staleTime ?? 60 * 1000,
  });

  useEffect(() => {
    if (slotsQuery.data?.timeZoneId && slotsQuery.data.timeZoneId !== salonTimeZone) {
      setSalonTimeZone(slotsQuery.data.timeZoneId);
    }
  }, [salonTimeZone, slotsQuery.data?.timeZoneId]);

  const loadSlots = useCallback(async () => {
    if (!selectedSlotsQueryParams) {
      return;
    }

    setSelectedSlot(null);

    const queryOptions = publicBookingSlotsQueryOptions(selectedSlotsQueryParams);

    await queryClient.invalidateQueries({
      exact: true,
      queryKey: queryOptions.queryKey,
    });
    await queryClient.fetchQuery(queryOptions);
  }, [queryClient, selectedSlotsQueryParams]);

  const slotsState = useMemo<SlotsState>(() => {
    if (!selectedSelection || !selectedDateKey) {
      return {
        data: null,
        error: null,
        status: "idle",
      };
    }

    return {
      data: slotsQuery.data ?? null,
      error: slotsQuery.error
        ? resolveRequestError(
            slotsQuery.error,
            t("errors.loadSlots"),
            apiMessageTemplate,
          )
        : null,
      status:
        slotsQuery.isPending && !slotsQuery.data
          ? "loading"
          : slotsQuery.error
            ? "error"
            : "ready",
    };
  }, [
    apiMessageTemplate,
    selectedDateKey,
    selectedSelection,
    slotsQuery.data,
    slotsQuery.error,
    slotsQuery.isPending,
    t,
  ]);

  const slotOptions = useMemo(
    () => buildSlotOptions(slotsState.data, locale, salonTimeZone),
    [locale, salonTimeZone, slotsState.data],
  );

  const profileAddress = formatAddress(salonData.profile?.address);
  const salonName =
    salonData.profile?.name?.trim() ||
    campaign?.name?.trim() ||
    t("salonFallbackName");

  const partialSalonWarning =
    salonData.status === "ready" &&
    Boolean(salonData.profileError || salonData.mastersError);

  const steps = useMemo(
    () => [
      { id: "service" as const, label: t("steps.service") },
      { id: "time" as const, label: t("steps.time") },
      { id: "details" as const, label: t("steps.details") },
      { id: "success" as const, label: t("steps.success") },
    ],
    [t],
  );

  const currentStepIndex = steps.findIndex((step) => step.id === currentStep);

  const selectedMaster = selectedSelection?.masterOptions.find(
    (master) => master.id === selectedMasterId,
  );

  const summaryBooking = confirmationState.booking;

  const fetchConfirmedBooking = async (bookingId: string) => {
    const requestId = ++confirmationLoadRequestRef.current;

    setConfirmationState((current) => ({
      ...current,
      bookingId,
      error: null,
      status: "loading",
    }));

    try {
      const booking = await getPublicBooking(bookingId);

      if (requestId !== confirmationLoadRequestRef.current) {
        return;
      }

      setConfirmationState({
        booking,
        bookingId,
        error: null,
        status: "ready",
      });
    } catch (error) {
      if (requestId !== confirmationLoadRequestRef.current) {
        return;
      }

      setConfirmationState((current) => ({
        ...current,
        bookingId,
        error: resolveRequestError(
          error,
          t("errors.loadConfirmation"),
          apiMessageTemplate,
        ),
        status: "error",
      }));
    }
  };

  const handleSelectService = (selection: SelectionOption) => {
    setSelectedSelectionId(selection.id);
    setSelectedSlot(null);
    setSubmitError(null);
    setFormErrors({});
    setCurrentStep("time");
  };

  const handleContinueFromTime = () => {
    if (!selectedSlot) {
      setFormErrors((current) => ({
        ...current,
        slot: t("errors.validationSlot"),
      }));
      return;
    }

    setFormErrors((current) => ({
      ...current,
      slot: undefined,
    }));
    setCurrentStep("details");
  };

  const handleSubmit = async () => {
    const nextErrors: typeof formErrors = {};

    if (!selectedSelection) {
      nextErrors.selection = t("errors.validationSelection");
    }

    if (!selectedSlot) {
      nextErrors.slot = t("errors.validationSlot");
    }

    if (!clientName.trim()) {
      nextErrors.name = t("errors.validationName");
    }

    const normalizedPhone = normalizePhone(clientPhone);
    if (normalizedPhone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = t("errors.validationPhone");
    }

    setFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !selectedSelection || !selectedSlot) {
      return;
    }

    if (submitGuardRef.current) {
      return;
    }

    submitGuardRef.current = true;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const createdBooking = await createPublicBooking(salonId, {
        ...(selectedSelection.kind === "procedure"
          ? { procedureId: selectedSelection.id }
          : { complexId: selectedSelection.id }),
        ...(selectedSelection.kind === "procedure" && selectedMasterId
          ? { executorId: selectedMasterId }
          : {}),
        ...(trackingId ? { trackingId } : {}),
        clientName: clientName.trim(),
        clientPhone: normalizedPhone,
        time: selectedSlot.interval,
      });

      const bookingId = createdBooking.appointmentId ?? null;

      setConfirmationState({
        booking: createdBooking,
        bookingId,
        error: null,
        status: bookingId ? "loading" : "error",
      });
      setCurrentStep("success");

      if (bookingId) {
        await fetchConfirmedBooking(bookingId);
      } else {
        setConfirmationState((current) => ({
          ...current,
          error: t("errors.loadConfirmation"),
          status: "error",
        }));
      }
    } catch (error) {
      setSubmitError(
        resolveRequestError(
          error,
          t("errors.createAppointment"),
          apiMessageTemplate,
        ),
      );
    } finally {
      submitGuardRef.current = false;
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setSelectedSelectionId(null);
    setSelectedMasterId(null);
    setSelectedSlot(null);
    setClientName("");
    setClientPhone("");
    setFormErrors({});
    setSubmitError(null);
    setConfirmationState({
      booking: null,
      bookingId: null,
      error: null,
      status: "idle",
    });
    setCurrentStep("service");
  };

  const renderHeader = () => (
    <header className="space-y-5">
      <div className="flex items-start gap-4">
        <Avatar
          imageUrl={salonData.profile?.logo ?? null}
          name={salonName}
          size="lg"
        />
        <div className="space-y-2">
          <div className="inline-flex rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
            {t("headline")}
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              {salonName}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {salonData.profile?.description?.trim() ||
                campaign?.description?.trim() ||
                t("subtitle")}
            </p>
          </div>
        </div>
      </div>
      {profileAddress ? (
        <div className="rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-sm text-slate-600 backdrop-blur">
          {profileAddress}
        </div>
      ) : null}
    </header>
  );

  const renderSteps = () => (
    <div className="grid gap-3 border-y border-white/60 py-5 sm:grid-cols-4">
      {steps.map((step, index) => (
        <StepBadge
          active={index === currentStepIndex}
          done={index < currentStepIndex}
          key={step.id}
          label={step.label}
          number={index + 1}
        />
      ))}
    </div>
  );

  if (salonData.status === "loading") {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_36%),linear-gradient(135deg,_#f7c8a8_0%,_#ffdff4_35%,_#dce7ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_40px_120px_rgba(85,71,117,0.18)] backdrop-blur-2xl sm:p-8">
          {renderHeader()}
          <div className="mt-8">
            <StatusCard
              message={t("loading.salon")}
              title={commonT("loading")}
            />
          </div>
        </div>
      </div>
    );
  }

  if (salonData.status === "error" || !salonData.catalog) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_36%),linear-gradient(135deg,_#f7c8a8_0%,_#ffdff4_35%,_#dce7ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_40px_120px_rgba(85,71,117,0.18)] backdrop-blur-2xl sm:p-8">
          {renderHeader()}
          <div className="mt-8">
            <StatusCard
              actionLabel={t("retry")}
              message={
                salonData.contractGap
                  ? t("errors.contractGapCatalog")
                  : salonData.catalogError ?? t("errors.loadSalonData")
              }
              onAction={() => {
                void loadSalonData();
              }}
              title={commonT("error")}
              tone="danger"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.85),_transparent_36%),linear-gradient(135deg,_#f7c8a8_0%,_#ffdff4_35%,_#dce7ff_100%)] px-4 py-8 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-white/50 bg-white/70 p-6 shadow-[0_40px_120px_rgba(85,71,117,0.18)] backdrop-blur-2xl sm:p-8">
        {renderHeader()}
        <div className="mt-8 space-y-8">
          {renderSteps()}

          {partialSalonWarning ? (
            <StatusCard
              message={
                salonData.contractGap
                  ? t("warnings.missingPublicSalonContract")
                  : t("warnings.partialSalonData")
              }
              title={commonT("error")}
            />
          ) : null}

          {currentStep === "service" ? (
            <section className="space-y-5">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {t("serviceTitle")}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t("serviceHint")}
                </p>
              </div>

              {!selectionOptions.length ? (
                <StatusCard
                  message={t("serviceEmptyHint")}
                  title={t("serviceEmptyTitle")}
                />
              ) : (
                <div className="grid gap-4">
                  {selectionOptions.map((selection) => {
                    const selected = selection.id === selectedSelectionId;
                    const procedurePriceLabel =
                      selection.kind === "procedure"
                        ? formatCurrency(
                            selection.price?.amount,
                            selection.price?.currency,
                            locale,
                          )
                        : null;

                    return (
                      <button
                        className={cn(
                          "rounded-[28px] border p-5 text-left transition",
                          selected
                            ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                            : "border-white/70 bg-white/80 text-slate-900 hover:border-slate-200 hover:bg-white",
                        )}
                        key={selection.id}
                        onClick={() => handleSelectService(selection)}
                        type="button"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-semibold">{selection.title}</h3>
                              {selection.kind === "complex" ? (
                                <span
                                  className={cn(
                                    "rounded-full px-2.5 py-1 text-xs font-medium",
                                    selected
                                      ? "bg-white/15 text-white"
                                      : "bg-slate-100 text-slate-600",
                                  )}
                                >
                                  {t("complexLabel")}
                                </span>
                              ) : null}
                            </div>
                            {selection.description ? (
                              <p
                                className={cn(
                                  "text-sm leading-6",
                                  selected ? "text-white/80" : "text-slate-600",
                                )}
                              >
                                {selection.description}
                              </p>
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "grid min-w-40 gap-2 rounded-2xl border px-4 py-3 text-sm",
                              selected
                                ? "border-white/15 bg-white/10"
                                : "border-slate-100 bg-slate-50",
                            )}
                          >
                            {selection.kind === "complex" ? (
                              <div className="text-sm font-medium">
                                {t("complexIncludes", {
                                  count: selection.procedureCount,
                                })}
                              </div>
                            ) : null}
                            {selection.durationMinutes ? (
                              <div>
                                <span
                                  className={cn(
                                    "block text-xs uppercase tracking-[0.14em]",
                                    selected ? "text-white/60" : "text-slate-400",
                                  )}
                                >
                                  {t("serviceDuration")}
                                </span>
                                <span className="block font-medium">
                                  {formatDuration(selection.durationMinutes, locale)}
                                </span>
                              </div>
                            ) : null}
                            {selection.kind === "procedure" && procedurePriceLabel ? (
                              <div>
                                <span
                                  className={cn(
                                    "block text-xs uppercase tracking-[0.14em]",
                                    selected ? "text-white/60" : "text-slate-400",
                                  )}
                                >
                                  {t("servicePriceFrom", {
                                    value: procedurePriceLabel,
                                  })}
                                </span>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>
          ) : null}

          {currentStep === "time" ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {t("timeTitle")}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t("timeHint")}
                </p>
              </div>

              {selectedSelection ? (
                <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                        {t("serviceTitle")}
                      </p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">
                        {selectedSelection.title}
                      </h3>
                    </div>
                    <ActionButton
                      onClick={() => setCurrentStep("service")}
                      variant="secondary"
                    >
                      {t("changeSelection")}
                    </ActionButton>
                  </div>

                  <div className="mt-6 space-y-5">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {t("masterTitle")}
                        </h4>
                        <span className="text-xs text-slate-400">
                          {selectedSelection.masterOptions.length
                            ? t("masterHint")
                            : t("masterNotRequired")}
                        </span>
                      </div>

                      {selectedSelection.masterOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          <button
                            className={cn(
                              "rounded-full border px-4 py-2 text-sm font-medium transition",
                              !selectedMasterId
                                ? "border-slate-900 bg-slate-900 text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                            )}
                            onClick={() => setSelectedMasterId(null)}
                            type="button"
                          >
                            {t("masterAny")}
                          </button>
                          {selectedSelection.masterOptions.map((master) => (
                            <button
                              className={cn(
                                "inline-flex items-center gap-3 rounded-full border px-3 py-2 text-left text-sm font-medium transition",
                                selectedMasterId === master.id
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              )}
                              key={master.id}
                              onClick={() => setSelectedMasterId(master.id)}
                              type="button"
                            >
                              <Avatar imageUrl={master.avatarUrl} name={master.name} />
                              <span className="text-left">
                                <span className="block">{master.name}</span>
                                {master.position ? (
                                  <span
                                    className={cn(
                                      "block text-xs",
                                      selectedMasterId === master.id
                                        ? "text-white/70"
                                        : "text-slate-400",
                                    )}
                                  >
                                    {master.position}
                                  </span>
                                ) : null}
                              </span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                          {t("masterNotRequired")}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {t("timeSelectDate")}
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {dateOptions.map((dateKey) => {
                          const selected = selectedDateKey === dateKey;

                          return (
                            <button
                              className={cn(
                                "rounded-2xl border px-4 py-3 text-left transition",
                                selected
                                  ? "border-slate-900 bg-slate-900 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                              )}
                              key={dateKey}
                              onClick={() => setSelectedDateKey(dateKey)}
                              type="button"
                            >
                              {formatDateLabel(dateKey, locale, salonTimeZone)}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {t("timeSelectTime")}
                        </h4>
                        <ActionButton onClick={() => void loadSlots()} variant="secondary">
                          {t("timeReload")}
                        </ActionButton>
                      </div>

                      {slotsState.status === "loading" ? (
                        <StatusCard
                          message={t("loading.slots")}
                          title={commonT("loading")}
                        />
                      ) : null}

                      {slotsState.status === "error" && slotsState.error ? (
                        <StatusCard
                          actionLabel={t("retry")}
                          message={slotsState.error}
                          onAction={() => void loadSlots()}
                          title={commonT("error")}
                          tone="danger"
                        />
                      ) : null}

                      {slotsState.status === "ready" && !slotOptions.length ? (
                        <StatusCard
                          message={t("timeEmptyHint")}
                          title={t("timeEmptyTitle")}
                        />
                      ) : null}

                      {slotOptions.length ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          {slotOptions.map((slot) => {
                            const selected = selectedSlot?.id === slot.id;

                            return (
                              <button
                                className={cn(
                                  "rounded-2xl border px-4 py-4 text-left transition",
                                  selected
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
                                )}
                                key={slot.id}
                                onClick={() => {
                                  setSelectedSlot({
                                    id: slot.id,
                                    interval: slot.interval,
                                    slot: slot.slot,
                                  });
                                  setFormErrors((current) => ({
                                    ...current,
                                    slot: undefined,
                                  }));
                                }}
                                type="button"
                              >
                                <div className="space-y-1">
                                  <div className="text-base font-semibold">{slot.label}</div>
                                  <div
                                    className={cn(
                                      "text-xs",
                                      selected ? "text-white/70" : "text-slate-400",
                                    )}
                                  >
                                    {formatDateValue(slot.interval.start, locale, salonTimeZone)}
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : null}

                      {formErrors.slot ? (
                        <p className="text-sm text-red-600">{formErrors.slot}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <StatusCard
                  actionLabel={t("backLabel")}
                  message={t("errors.validationSelection")}
                  onAction={() => setCurrentStep("service")}
                  title={commonT("error")}
                  tone="danger"
                />
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <ActionButton onClick={() => setCurrentStep("service")} variant="secondary">
                  {t("backLabel")}
                </ActionButton>
                <ActionButton
                  disabled={!selectedSlot || slotsState.status === "loading"}
                  onClick={handleContinueFromTime}
                >
                  {commonT("next")}
                </ActionButton>
              </div>
            </section>
          ) : null}

          {currentStep === "details" ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {t("detailsTitle")}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t("detailsHint")}
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                  <div className="grid gap-5">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {t("fieldNameLabel")}
                      </span>
                      <input
                        className={cn(
                          "min-h-12 rounded-2xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400",
                          formErrors.name ? "border-red-300" : "border-slate-200",
                        )}
                        onChange={(event) => {
                          setClientName(event.target.value);
                          setFormErrors((current) => ({
                            ...current,
                            name: undefined,
                          }));
                        }}
                        placeholder={t("fieldNamePlaceholder")}
                        type="text"
                        value={clientName}
                      />
                      {formErrors.name ? (
                        <span className="text-sm text-red-600">{formErrors.name}</span>
                      ) : null}
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-slate-700">
                        {t("fieldPhoneLabel")}
                      </span>
                      <input
                        className={cn(
                          "min-h-12 rounded-2xl border bg-white px-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400",
                          formErrors.phone ? "border-red-300" : "border-slate-200",
                        )}
                        inputMode="tel"
                        onChange={(event) => {
                          setClientPhone(formatPhoneInput(event.target.value));
                          setFormErrors((current) => ({
                            ...current,
                            phone: undefined,
                          }));
                        }}
                        placeholder={t("fieldPhonePlaceholder")}
                        type="tel"
                        value={clientPhone}
                      />
                      <span className="text-xs leading-5 text-slate-500">
                        {t("fieldPhoneHelper")}
                      </span>
                      {formErrors.phone ? (
                        <span className="text-sm text-red-600">{formErrors.phone}</span>
                      ) : null}
                    </label>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-white">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("summaryTitle")}</h3>
                    <dl className="grid gap-3 text-sm">
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summaryService")}</dt>
                        <dd className="font-medium">
                          {selectedSelection?.title ?? "—"}
                        </dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summarySpecialist")}</dt>
                        <dd className="font-medium">
                          {selectedMaster?.name ??
                            (selectedSelection?.masterOptions.length
                              ? t("masterAny")
                              : t("masterNotRequired"))}
                        </dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summaryDate")}</dt>
                        <dd className="font-medium">
                          {selectedSlot
                            ? formatDateValue(
                                selectedSlot.interval.start,
                                locale,
                                salonTimeZone,
                              )
                            : "—"}
                        </dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summaryTime")}</dt>
                        <dd className="font-medium">
                          {selectedSlot
                            ? `${formatTimeValue(
                                selectedSlot.interval.start,
                                locale,
                                salonTimeZone,
                              )} - ${formatTimeValue(
                                selectedSlot.interval.end,
                                locale,
                                salonTimeZone,
                              )}`
                            : "—"}
                        </dd>
                      </div>
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summarySalon")}</dt>
                        <dd className="font-medium">{salonName}</dd>
                      </div>
                      {profileAddress ? (
                        <div className="grid gap-1">
                          <dt className="text-white/60">{t("summaryAddress")}</dt>
                          <dd className="font-medium">{profileAddress}</dd>
                        </div>
                      ) : null}
                      <div className="grid gap-1">
                        <dt className="text-white/60">{t("summaryTimezone")}</dt>
                        <dd className="font-medium">{salonTimeZone}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </div>

              {submitError ? (
                <StatusCard
                  message={submitError}
                  title={commonT("error")}
                  tone="danger"
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <ActionButton onClick={() => setCurrentStep("time")} variant="secondary">
                  {t("backLabel")}
                </ActionButton>
                <ActionButton disabled={isSubmitting} onClick={() => void handleSubmit()}>
                  {isSubmitting ? t("loading.submit") : t("submitLabel")}
                </ActionButton>
              </div>
            </section>
          ) : null}

          {currentStep === "success" ? (
            <section className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                  {t("successTitle")}
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {t("successBookingHint")}
                </p>
              </div>

              {confirmationState.status === "loading" ? (
                <StatusCard
                  message={t("loading.confirmation")}
                  title={commonT("loading")}
                />
              ) : null}

              {summaryBooking ? (
                <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                  <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <Avatar
                          imageUrl={summaryBooking.salonLogo ?? salonData.profile?.logo}
                          name={summaryBooking.salonName ?? salonName}
                          size="lg"
                        />
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            {t("summarySalon")}
                          </p>
                          <h3 className="text-xl font-semibold text-slate-950">
                            {summaryBooking.salonName ?? salonName}
                          </h3>
                        </div>
                      </div>
                      <dl className="grid gap-3 text-sm text-slate-700">
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summaryService")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.procedureName ??
                              selectedSelection?.title ??
                              "—"}
                          </dd>
                        </div>
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summarySpecialist")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.masterNickname ??
                              selectedMaster?.name ??
                              (selectedSelection?.masterOptions.length
                                ? t("masterAny")
                                : t("masterNotRequired"))}
                          </dd>
                        </div>
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summaryAddress")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.salonAddress ?? profileAddress ?? "—"}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
                      <dl className="grid gap-4 text-sm">
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summaryDate")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.time?.start
                              ? formatDateValue(
                                  summaryBooking.time.start,
                                  locale,
                                  summaryBooking.timezoneId ?? salonTimeZone,
                                )
                              : "—"}
                          </dd>
                        </div>
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summaryTime")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.time?.start && summaryBooking.time?.end
                              ? `${formatTimeValue(
                                  summaryBooking.time.start,
                                  locale,
                                  summaryBooking.timezoneId ?? salonTimeZone,
                                )} - ${formatTimeValue(
                                  summaryBooking.time.end,
                                  locale,
                                  summaryBooking.timezoneId ?? salonTimeZone,
                                )}`
                              : "—"}
                          </dd>
                        </div>
                        <div className="grid gap-1">
                          <dt className="text-slate-400">{t("summaryTimezone")}</dt>
                          <dd className="font-medium text-slate-950">
                            {summaryBooking.timezoneId ?? salonTimeZone}
                          </dd>
                        </div>
                        {summaryBooking.price?.amount ? (
                          <div className="grid gap-1">
                            <dt className="text-slate-400">{t("summaryPrice")}</dt>
                            <dd className="font-medium text-slate-950">
                              {formatCurrency(
                                summaryBooking.price.amount,
                                summaryBooking.price.currency,
                                locale,
                              )}
                            </dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </div>
                </div>
              ) : null}

              {confirmationState.status === "error" && confirmationState.error ? (
                <StatusCard
                  actionLabel={t("retry")}
                  message={confirmationState.error}
                  onAction={() => {
                    if (confirmationState.bookingId) {
                      void fetchConfirmedBooking(confirmationState.bookingId);
                    }
                  }}
                  title={commonT("error")}
                  tone="danger"
                />
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <ActionButton onClick={resetFlow} variant="secondary">
                  {t("successCreateAnother")}
                </ActionButton>
                {confirmationState.bookingId ? (
                  <div className="rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    ID: {confirmationState.bookingId}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
