"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMachine } from "@xstate/react";
import { useTranslations } from "next-intl";

import {
  createPublicBooking,
  waitForPublicBooking,
  type PublicSearchSlotsResponse,
  type PublicSalonProfile,
} from "@/lib/api/public-booking";
import {
  publicBookingKeys,
  publicBookingSlotsQueryOptions,
  publicSalonCatalogQueryOptions,
  publicSalonMastersQueryOptions,
  publicSalonProfileQueryOptions,
} from "@/lib/api/public-booking.queries";
import {
  adaptCatalogToProcedures,
  type Procedure,
  type ProcedureGroup,
  type SlotInterval,
  type Step,
} from "@/lib/public-booking-screen";
import {
  detectBookingAdaptivePlatform,
  getBookingPlatformVariant,
  type BookingPlatformVariant,
} from "@/src/features/booking/utils/platform";

import {
  formatAddress,
  formatCurrency,
  formatDuration,
  normalizePhone,
  resolveApiMessage,
  validatePhone,
} from "../../_shared/formatting";

import {
  clampBookingDraftStep,
  clearBookingDraftSnapshot,
  hasMeaningfulBookingDraft,
  normalizeBookingDraftStep,
  readBookingDraftSnapshot,
  readBookingDraftUrlState,
  writeBookingDraftSnapshot,
  writeBookingDraftUrlState,
} from "./bookingDraft";
import { bookingFlowMachine } from "./bookingFlowMachine";
import {
  DAYS_AHEAD,
  addDaysToDateKey,
  buildVisitUrl,
  formatDateLabel,
  formatSlotSummaryTitle,
  getDateKeyForTimeZone,
  getNightPeriodLabel,
  BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID,
  getProcedureSelectionKey,
  getTimeZoneParts,
  inferProcedureCategoryFromTags,
  inferProcedureCategoryLabel,
  toTimeZoneIsoDate,
} from "./date-utils";

export type SlotOption = {
  end: string;
  hour: number;
  label: string;
  start: string;
};

export type DateOption = {
  key: string;
  label: string;
};

export type CalendarDay = {
  dayLabel: string;
  isWeekend: boolean;
  isToday: boolean;
  key: string;
  monthLabel: string;
  weekdayLabel: string;
};

export type ProcedureCategoryGroup = {
  groups: ProcedureGroup[];
  id: string;
  title: string;
  grouping: "tag" | "inferred" | "uncategorized";
};

type TimePeriodKey = "morning" | "day" | "evening" | "night";

export type SlotPeriod = {
  key: TimePeriodKey;
  label: string;
  slots: SlotOption[];
};

export type BookingFlow = {
  platform: BookingPlatformVariant;
  locale: string;

  salonProfile: PublicSalonProfile | null;
  salonName: string;
  salonAddress: string | undefined;
  mapAddressUrl: string | null;

  proceduresLoading: boolean;
  proceduresError: string | null;
  procedureGroups: ProcedureGroup[];
  procedureCategories: ProcedureCategoryGroup[];
  selectedGroup: ProcedureGroup | null;
  selectedProcedure: Procedure | null;
  expandedCategoryIds: string[];

  selectedSlot: SlotInterval | null;
  selectedDateKey: string | null;
  slotsLoading: boolean;
  slotsError: string | null;
  slotPeriods: SlotPeriod[];
  slotCalendarDays: CalendarDay[];
  slotMonthTitle: string;
  selectedSlotSummaryTitle: string | null;
  selectedSlotDurationSubtitle: string | null;
  selectedProcedurePrice: string | null;

  clientName: string;
  clientPhone: string;
  formErrors: { name?: string; phone?: string };
  globalError: string | null;
  isSubmitting: boolean;
  isFormValid: boolean;

  currentVisualStep: Step;

  handleSelectGroup: (group: ProcedureGroup) => void;
  handleSelectProcedure: (procedure: Procedure) => void;
  handleSelectSlot: (slot: SlotInterval) => void;
  handleSubmitAppointment: (event: FormEvent<HTMLFormElement>) => void;
  setSelectedGroupId: Dispatch<SetStateAction<string | null>>;
  setSelectedProcedureKey: Dispatch<SetStateAction<string | null>>;
  setSelectedSlot: Dispatch<SetStateAction<SlotInterval | null>>;
  setSelectedDateKey: Dispatch<SetStateAction<string | null>>;
  setExpandedCategoryIds: Dispatch<SetStateAction<string[]>>;
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
  fetchSlotsForProcedure: (
    procedure: Procedure,
    dateKey: string,
    options?: { force?: boolean },
  ) => Promise<void>;
};

type UseBookingFlowParams = {
  salonId: string;
  locale: string;
  trackingId?: string | null;
};

function resolveSetterValue<T>(
  value: SetStateAction<T>,
  currentValue: T,
): T {
  return typeof value === "function"
    ? (value as (previousValue: T) => T)(currentValue)
    : value;
}

export function useBookingFlow({
  salonId,
  locale,
  trackingId: trackingIdProp,
}: UseBookingFlowParams): BookingFlow {
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
  const queryClient = useQueryClient();
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false);
  const isLeavingBookingFlowRef = useRef(false);
  const apiMessageTemplate = useCallback(
    (message: string) => t("errors.apiMessage", { message }),
    [t],
  );
  const [timeZoneId, setTimeZoneId] = useState("UTC");
  const [state, send] = useMachine(bookingFlowMachine);

  const {
    clientName,
    clientPhone,
    expandedCategoryIds,
    formErrors,
    globalError,
    selectedDateKey,
    selectedGroupId,
    selectedProcedureKey,
    selectedSlot,
  } = state.context;
  const isSubmitting = state.matches("submitting");

  const profileQuery = useQuery(publicSalonProfileQueryOptions(salonId, locale));
  const catalogQuery = useQuery(publicSalonCatalogQueryOptions(salonId, locale));
  const mastersQuery = useQuery(publicSalonMastersQueryOptions(salonId, locale));

  const salonProfile = profileQuery.data ?? null;
  const procedures = useMemo<Procedure[]>(
    () =>
      catalogQuery.data
        ? adaptCatalogToProcedures(catalogQuery.data, mastersQuery.data ?? [])
        : [],
    [catalogQuery.data, mastersQuery.data],
  );
  const proceduresLoading =
    catalogQuery.isPending || profileQuery.isPending || mastersQuery.isPending;
  const proceduresError = useMemo(() => {
    if (!catalogQuery.error) {
      return null;
    }

    return resolveApiMessage(
      catalogQuery.error,
      t("errors.loadProcedures"),
      apiMessageTemplate,
    );
  }, [apiMessageTemplate, catalogQuery.error, t]);

  useEffect(() => {
    if (profileQuery.data?.timeZoneId) {
      setTimeZoneId(profileQuery.data.timeZoneId);
    }
  }, [profileQuery.data?.timeZoneId]);

  // Группировка процедур
  const procedureGroups: ProcedureGroup[] = useMemo(() => {
    if (!procedures.length) return [];

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
          (existing.minPrice === null ||
            priceCandidate < (existing.minPrice ?? Infinity))
        ) {
          existing.minPrice = priceCandidate;
        }

        if (
          priceCandidate !== null &&
          priceCandidate !== undefined &&
          (existing.maxPrice === null ||
            priceCandidate > (existing.maxPrice ?? -Infinity))
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

  // Категории процедур: теги API → префикс в названии → общий список
  const procedureCategories = useMemo<ProcedureCategoryGroup[]>(() => {
    const grouped = new Map<string, ProcedureCategoryGroup>();

    procedureGroups.forEach((group) => {
      const fromTags = inferProcedureCategoryFromTags(group);
      const inferredTitle = inferProcedureCategoryLabel(group);

      let categoryId: string;
      let title: string;
      let grouping: ProcedureCategoryGroup["grouping"];

      if (fromTags) {
        categoryId = fromTags.categoryId;
        title = fromTags.title;
        grouping = "tag";
      } else if (inferredTitle) {
        categoryId = inferredTitle.toLowerCase();
        title = inferredTitle;
        grouping = "inferred";
      } else {
        categoryId = BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID;
        title = t("serviceCategoryFallback");
        grouping = "uncategorized";
      }

      const existing = grouped.get(categoryId);

      if (existing) {
        existing.groups.push(group);
        return;
      }

      grouped.set(categoryId, {
        groups: [group],
        id: categoryId,
        title,
        grouping,
      });
    });

    return Array.from(grouped.values());
  }, [procedureGroups, t]);

  const selectedGroup = useMemo(
    () =>
      procedureGroups.find((group) => group.id === selectedGroupId) ?? null,
    [procedureGroups, selectedGroupId],
  );

  const selectedProcedure = useMemo(() => {
    if (!selectedProcedureKey) return null;

    return (
      procedures.find(
        (procedure) =>
          getProcedureSelectionKey(procedure) === selectedProcedureKey,
      ) ?? null
    );
  }, [procedures, selectedProcedureKey]);

  useEffect(() => {
    if (selectedGroupId && !selectedGroup) {
      send({ type: "SET_GROUP_ID", value: null });
    }
  }, [selectedGroup, selectedGroupId, send]);

  useEffect(() => {
    if (selectedProcedureKey && !selectedProcedure) {
      send({ type: "SET_PROCEDURE_KEY", value: null });
    }
  }, [selectedProcedure, selectedProcedureKey, send]);

  useEffect(() => {
    if (!hasHydratedDraft) {
      return;
    }

    if (!procedureCategories.length) {
      if (expandedCategoryIds.length > 0) {
        send({ type: "SET_EXPANDED_CATEGORY", value: [] });
      }
      return;
    }

    const validIds = new Set(procedureCategories.map((category) => category.id));
    const next = expandedCategoryIds.filter((id) => validIds.has(id));
    if (next.length !== expandedCategoryIds.length) {
      send({ type: "SET_EXPANDED_CATEGORY", value: next });
    }
  }, [expandedCategoryIds, hasHydratedDraft, procedureCategories, send]);

  // Хэндлеры выбора
  const handleSelectGroup = (group: ProcedureGroup) => {
    send({
      type: "SELECT_GROUP",
      autoProcedureKey:
        group.procedures.length === 1
          ? getProcedureSelectionKey(group.procedures[0]!)
          : null,
      groupId: group.id,
    });
  };

  const handleSelectProcedure = (procedure: Procedure) => {
    send({
      type: "SELECT_PROCEDURE",
      procedureKey: getProcedureSelectionKey(procedure),
    });
  };

  // Даты
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
    if (!hasHydratedDraft) {
      return;
    }

    if (!dateOptions.length) return;
    if (
      !selectedDateKey ||
      !dateOptions.some((option) => option.key === selectedDateKey)
    ) {
      send({ type: "SET_DATE", value: dateOptions[0]?.key ?? null });
    }
  }, [dateOptions, hasHydratedDraft, selectedDateKey, send]);

  const selectedSlotsQueryParams = useMemo(() => {
    if (!selectedProcedure || !selectedDateKey) {
      return null;
    }

    return {
      date: toTimeZoneIsoDate(selectedDateKey, timeZoneId),
      masterId: selectedProcedure.masterId ?? null,
      procedureIds:
        selectedProcedure.kind === "complex"
          ? selectedProcedure.complexProcedureIds ?? []
          : undefined,
      salonId,
      selectionId: selectedProcedure.id,
      selectionKind: selectedProcedure.kind,
      timeZone: timeZoneId,
    } as const;
  }, [salonId, selectedDateKey, selectedProcedure, timeZoneId]);

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
        timeZone: timeZoneId,
      }),
    enabled: Boolean(selectedSlotsQueryParams),
    staleTime: selectedSlotsQueryOptions?.staleTime ?? 60 * 1000,
  });

  useEffect(() => {
    if (slotsQuery.data?.timeZoneId && slotsQuery.data.timeZoneId !== timeZoneId) {
      setTimeZoneId(slotsQuery.data.timeZoneId);
    }
  }, [slotsQuery.data?.timeZoneId, timeZoneId]);

  const fetchSlotsForProcedure = useCallback(
    async (
      procedure: Procedure,
      dateKey: string,
      options?: { force?: boolean },
    ) => {
      const queryOptions = publicBookingSlotsQueryOptions({
        date: toTimeZoneIsoDate(dateKey, timeZoneId),
        masterId: procedure.masterId ?? null,
        procedureIds:
          procedure.kind === "complex"
            ? procedure.complexProcedureIds ?? []
            : undefined,
        salonId,
        selectionId: procedure.id,
        selectionKind: procedure.kind,
        timeZone: timeZoneId,
      });

      if (options?.force) {
        await queryClient.invalidateQueries({
          exact: true,
          queryKey: queryOptions.queryKey,
        });
      }

      const data = await queryClient.fetchQuery(queryOptions);

      if (data.timeZoneId && data.timeZoneId !== timeZoneId) {
        setTimeZoneId(data.timeZoneId);
      }
    },
    [queryClient, salonId, timeZoneId],
  );

  useEffect(() => {
    if (hasHydratedDraft || proceduresLoading || !dateOptions.length) {
      return;
    }

    let cancelled = false;

    const restoreDraft = async () => {
      const scope = { locale, salonId };
      const draftSnapshot = readBookingDraftSnapshot(scope);
      const urlState = readBookingDraftUrlState(searchParams);

      const requestedProcedureKey =
        urlState.selectedProcedureKey ?? draftSnapshot?.selectedProcedureKey ?? null;
      const requestedGroupId =
        urlState.selectedGroupId ?? draftSnapshot?.selectedGroupId ?? null;
      const requestedDateKey =
        urlState.selectedDateKey ?? draftSnapshot?.selectedDateKey ?? null;
      const requestedSlotStart =
        urlState.selectedSlotStart ?? draftSnapshot?.selectedSlotStart ?? null;

      let nextProcedure =
        requestedProcedureKey
          ? procedures.find(
              (procedure) =>
                getProcedureSelectionKey(procedure) === requestedProcedureKey,
            ) ?? null
          : null;

      const nextGroup =
        nextProcedure
          ? procedureGroups.find((group) =>
              group.procedures.some(
                (procedure) =>
                  getProcedureSelectionKey(procedure) ===
                  getProcedureSelectionKey(nextProcedure!),
              ),
            ) ?? null
          : requestedGroupId
            ? procedureGroups.find((group) => group.id === requestedGroupId) ?? null
            : null;

      if (!nextProcedure && nextGroup?.procedures.length === 1) {
        nextProcedure = nextGroup.procedures[0] ?? null;
      }

      if (
        nextProcedure &&
        nextGroup &&
        !nextGroup.procedures.some(
          (procedure) =>
            getProcedureSelectionKey(procedure) ===
            getProcedureSelectionKey(nextProcedure!),
        )
      ) {
        nextProcedure = nextGroup.procedures.length === 1
          ? (nextGroup.procedures[0] ?? null)
          : null;
      }

      const nextDateKey =
        requestedDateKey &&
        dateOptions.some((option) => option.key === requestedDateKey)
          ? requestedDateKey
          : null;

      let nextSlot: SlotInterval | null = null;

      if (nextProcedure && nextDateKey && requestedSlotStart) {
        try {
          const data = await queryClient.fetchQuery(
            publicBookingSlotsQueryOptions({
              date: toTimeZoneIsoDate(nextDateKey, timeZoneId),
              masterId: nextProcedure.masterId ?? null,
              procedureIds:
                nextProcedure.kind === "complex"
                  ? nextProcedure.complexProcedureIds ?? []
                  : undefined,
              salonId,
              selectionId: nextProcedure.id,
              selectionKind: nextProcedure.kind,
              timeZone: timeZoneId,
            }),
          );

          const draftSlots = "intervals" in data
            ? data.intervals
            : data.slots.map((slot) => slot.total);

          nextSlot =
            draftSlots.find((slot) => slot.start === requestedSlotStart) ?? null;

          if (data.timeZoneId && data.timeZoneId !== timeZoneId) {
            setTimeZoneId(data.timeZoneId);
          }
        } catch {
          nextSlot = null;
        }
      }

      const maxAllowedStep = nextSlot
        ? "details"
        : nextProcedure
          ? "time"
          : nextGroup
            ? "master"
            : "service";
      const requestedStep = normalizeBookingDraftStep(
        draftSnapshot?.currentStep ?? maxAllowedStep,
      );

      if (cancelled) {
        return;
      }

      send({
        type: "HYDRATE",
        step: clampBookingDraftStep(requestedStep, maxAllowedStep),
        value: {
          clientName: draftSnapshot?.clientName ?? "",
          clientPhone: draftSnapshot?.clientPhone ?? "",
          expandedCategoryIds: draftSnapshot?.expandedCategoryIds ?? [],
          formErrors: {},
          globalError: null,
          selectedDateKey: nextDateKey,
          selectedGroupId: nextGroup?.id ?? null,
          selectedProcedureKey: nextProcedure
            ? getProcedureSelectionKey(nextProcedure)
            : null,
          selectedSlot: nextSlot,
        },
      });
      setHasHydratedDraft(true);
    };

    void restoreDraft();

    return () => {
      cancelled = true;
    };
  }, [
    dateOptions,
    hasHydratedDraft,
    locale,
    procedureGroups,
    procedures,
    proceduresLoading,
    queryClient,
    salonId,
    searchParams,
    send,
    timeZoneId,
  ]);

  const slots = useMemo<SlotInterval[]>(() => {
    if (!slotsQuery.data) {
      return [];
    }

    return "intervals" in slotsQuery.data
      ? slotsQuery.data.intervals
      : slotsQuery.data.slots.map((slot) => slot.total);
  }, [slotsQuery.data]);

  const slotsLoading = slotsQuery.isFetching;
  const slotsError = useMemo(() => {
    if (!slotsQuery.error) {
      return null;
    }

    return resolveApiMessage(
      slotsQuery.error,
      t("errors.loadSlots"),
      apiMessageTemplate,
    );
  }, [apiMessageTemplate, slotsQuery.error, t]);

  // Слоты
  const slotOptions = useMemo<SlotOption[]>(() => {
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
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

  const slotPeriods = useMemo<SlotPeriod[]>(() => {
    if (!slotOptions.length) return [];

    const periodDefinitions: Array<{
      key: TimePeriodKey;
      label: string;
      maxHour: number;
      minHour: number;
    }> = [
      { key: "morning", label: t("timePeriods.morning"), maxHour: 11, minHour: 6 },
      { key: "day", label: t("timePeriods.day"), maxHour: 17, minHour: 12 },
      { key: "evening", label: t("timePeriods.evening"), maxHour: 21, minHour: 18 },
      { key: "night", label: getNightPeriodLabel(locale), maxHour: 23, minHour: 22 },
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
    send({ type: "SELECT_SLOT", slot });
  };

  // Форма
  const isFormValid =
    clientName.trim().length > 0 && validatePhone(normalizePhone(clientPhone));

  const handleSubmitAppointment = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
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
      send({ type: "SET_FORM_ERRORS", value: nextErrors });
      return;
    }

    if (!selectedProcedure || !selectedSlot) {
      send({ type: "SET_GLOBAL_ERROR", value: t("errors.createAppointment") });
      return;
    }

    send({ type: "SET_FORM_ERRORS", value: {} });
    send({ type: "SET_GLOBAL_ERROR", value: null });
    send({ type: "SUBMIT" });

    try {
      const data = await createPublicBooking(salonId, {
        clientName: trimmedName,
        clientPhone: normalizedPhone,
        // executorId только для одиночной процедуры (см. PublicBookingParametersCreate в SDK).
        ...(selectedProcedure.kind === "procedure" && selectedProcedure.masterId
          ? { executorId: selectedProcedure.masterId }
          : {}),
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
        send({
          type: "SUBMIT_FAILURE",
          error: t("errors.createAppointment"),
        });
        return;
      }

      isLeavingBookingFlowRef.current = true;
      clearBookingDraftSnapshot({ locale, salonId });

      await waitForPublicBooking(appointmentId).catch(() => null);

      const visitUrl = buildVisitUrl(locale, appointmentId);
      if (typeof window !== "undefined") {
        // Replace the current history entry so a reload cannot drop the user
        // back into a half-cleared booking flow while the visit page is loading.
        window.location.replace(visitUrl);
        return;
      }

      send({ type: "SUBMIT_SUCCESS" });
      router.push(`/${locale}/visits/${appointmentId}`);
    } catch (error) {
      isLeavingBookingFlowRef.current = false;
      send({
        type: "SUBMIT_FAILURE",
        error: resolveApiMessage(
          error,
          t("errors.createAppointment"),
          apiMessageTemplate,
        ),
      });
    }
  };

  // Производные данные
  const salonName =
    salonProfile?.name?.trim() ||
    (proceduresLoading ? "" : t("salonFallbackName"));
  const salonAddress =
    formatAddress(salonProfile?.address, { includeCountry: false }) ||
    undefined;
  const mapAddressQuery =
    formatAddress(salonProfile?.address, { includeCountry: true }) ||
    undefined;

  const selectedProcedurePrice = formatCurrency(
    selectedProcedure?.price?.amount ?? selectedGroup?.minPrice ?? null,
    selectedProcedure?.price?.currency ?? selectedGroup?.currency ?? null,
    locale,
  );

  const selectedSlotSummaryTitle = selectedSlot
    ? formatSlotSummaryTitle(
        new Date(selectedSlot.start),
        locale,
        timeZoneId,
      )
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

  const mapAddressUrl = mapAddressQuery
    ? `https://maps.apple.com/?q=${encodeURIComponent(salonName)}&address=${encodeURIComponent(mapAddressQuery)}`
    : null;

  const slotCalendarDays = useMemo<CalendarDay[]>(() => {
    return dateOptions.map((option) => {
      const date = new Date(toTimeZoneIsoDate(option.key, timeZoneId));
      return {
        dayLabel: new Intl.DateTimeFormat(locale, {
          day: "numeric",
          timeZone: timeZoneId,
        }).format(date),
        isWeekend: [0, 6].includes(date.getUTCDay()),
        isToday:
          option.key === getDateKeyForTimeZone(new Date(), timeZoneId),
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

  const currentVisualStep: Step = state.matches("details") || state.matches("submitting")
    ? "details"
    : state.matches("time")
      ? "time"
      : state.matches("master")
        ? "master"
        : "service";

  useEffect(() => {
    if (!hasHydratedDraft || isLeavingBookingFlowRef.current) {
      return;
    }

    const scope = { locale, salonId };
    const draftSnapshot = {
      clientName,
      clientPhone,
      currentStep: currentVisualStep,
      expandedCategoryIds,
      locale,
      salonId,
      selectedDateKey,
      selectedGroupId,
      selectedProcedureKey,
      selectedSlotStart: selectedSlot?.start ?? null,
      updatedAt: Date.now(),
      version: 1 as const,
    };

    if (hasMeaningfulBookingDraft(draftSnapshot)) {
      writeBookingDraftSnapshot(scope, draftSnapshot);
    } else {
      clearBookingDraftSnapshot(scope);
    }

    writeBookingDraftUrlState({
      selectedDateKey,
      selectedGroupId,
      selectedProcedureKey,
      selectedSlotStart: selectedSlot?.start ?? null,
    });
  }, [
    clientName,
    clientPhone,
    currentVisualStep,
    expandedCategoryIds,
    hasHydratedDraft,
    locale,
    salonId,
    selectedDateKey,
    selectedGroupId,
    selectedProcedureKey,
    selectedSlot,
  ]);

  const setSelectedGroupId: Dispatch<SetStateAction<string | null>> = (value) => {
    send({
      type: "SET_GROUP_ID",
      value: resolveSetterValue(value, selectedGroupId),
    });
  };

  const setSelectedProcedureKey: Dispatch<SetStateAction<string | null>> = (value) => {
    send({
      type: "SET_PROCEDURE_KEY",
      value: resolveSetterValue(value, selectedProcedureKey),
    });
  };

  const setSelectedSlot: Dispatch<SetStateAction<SlotInterval | null>> = (value) => {
    send({
      type: "SET_SLOT",
      value: resolveSetterValue(value, selectedSlot),
    });
  };

  const setSelectedDateKey: Dispatch<SetStateAction<string | null>> = (value) => {
    send({
      type: "SET_DATE",
      value: resolveSetterValue(value, selectedDateKey),
    });
  };

  const setExpandedCategoryIds: Dispatch<SetStateAction<string[]>> = (value) => {
    send({
      type: "SET_EXPANDED_CATEGORY",
      value: resolveSetterValue(value, expandedCategoryIds),
    });
  };

  const setClientName: Dispatch<SetStateAction<string>> = (value) => {
    send({
      type: "SET_CLIENT_NAME",
      value: resolveSetterValue(value, clientName),
    });
  };

  const setClientPhone: Dispatch<SetStateAction<string>> = (value) => {
    send({
      type: "SET_CLIENT_PHONE",
      value: resolveSetterValue(value, clientPhone),
    });
  };

  const setFormErrors: Dispatch<
    SetStateAction<{ name?: string; phone?: string }>
  > = (value) => {
    send({
      type: "SET_FORM_ERRORS",
      value: resolveSetterValue(value, formErrors),
    });
  };

  return {
    platform,
    locale,

    salonProfile,
    salonName,
    salonAddress,
    mapAddressUrl,

    proceduresLoading,
    proceduresError,
    procedureGroups,
    procedureCategories,
    selectedGroup,
    selectedProcedure,
    expandedCategoryIds,

    selectedSlot,
    selectedDateKey,
    slotsLoading,
    slotsError,
    slotPeriods,
    slotCalendarDays,
    slotMonthTitle,
    selectedSlotSummaryTitle,
    selectedSlotDurationSubtitle,
    selectedProcedurePrice,

    clientName,
    clientPhone,
    formErrors,
    globalError,
    isSubmitting,
    isFormValid,

    currentVisualStep,

    handleSelectGroup,
    handleSelectProcedure,
    handleSelectSlot,
    handleSubmitAppointment,
    setSelectedGroupId,
    setSelectedProcedureKey,
    setSelectedSlot,
    setSelectedDateKey,
    setExpandedCategoryIds,
    setClientName,
    setClientPhone,
    setFormErrors,
    fetchSlotsForProcedure,
  };
}
