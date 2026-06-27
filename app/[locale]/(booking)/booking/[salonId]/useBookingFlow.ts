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
import type { CountryCode } from "libphonenumber-js";
import { useTranslations } from "next-intl";

import {
  createPublicBooking,
  waitForPublicBooking,
  type PublicBookingCreatePayload,
  type PublicSearchSlotsBody,
  type PublicSearchSlotsResponse,
  type PublicSalonProfile,
} from "@/lib/api/public-booking";
import {
  publicBookingSlotsQueryOptions,
  publicSalonCatalogQueryOptions,
  publicSalonMastersQueryOptions,
  publicSalonProfileQueryOptions,
} from "@/lib/api/public-booking.queries";
import { buildPlatformMapsUrl } from "@/lib/platform-links";
import {
  adaptCatalogToProcedures,
  buildBundlePrice,
  type BundleProcedureItem,
  type BundleProcedureSelection,
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
  resolveApiMessage,
  toCurrencyValue,
  type CurrencyValue,
} from "../../_shared/formatting";
import {
  getPhoneCountryFromValue,
  normalizePhoneToE164,
  resolvePhoneCountry,
  validatePhoneForCountry,
} from "../../_shared/phone";

import {
  clampBookingDraftStep,
  clearBookingDraftSnapshot,
  hasMeaningfulBookingDraft,
  normalizeBookingDraftStep,
  readBookingDraftSnapshot,
  readBookingDraftUrlState,
  writeBookingDraftSnapshot,
  writeBookingDraftUrlState,
  type BookingDraftServiceSection,
} from "./bookingDraft";
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

type BookingServiceSectionState = {
  activeBundleProcedureId: string | null;
  id: string;
  isActionMenuOpen: boolean;
  isDescriptionExpanded: boolean;
  selectedBundleProcedureSelections: BundleProcedureSelection[];
  selectedGroupId: string | null;
  selectedProcedureKey: string | null;
};

export type BookingServiceSection = BookingServiceSectionState & {
  footerDuration: string | null;
  footerPrice: CurrencyValue | null;
  isComplete: boolean;
  selectedGroup: ProcedureGroup | null;
  selectedProcedure: Procedure | null;
};

export type BookingSummaryServiceItem = {
  id: string;
  items?: Array<{
    id: string;
    specialist: string | null;
    title: string;
  }>;
  meta: string | null;
  specialist: string | null;
  title: string;
};

export type BookingSummary = {
  services: BookingSummaryServiceItem[];
  slotSubtitle: string | null;
  slotTitle: string | null;
  totalDuration: string | null;
  totalPrice: string | null;
};

const HOTFIX_PROCEDURE_ORDER = new Map<string, number>([
  ["92c31d71-c6c9-490e-b565-627f0110c70e", 0],
  ["1e11fa3e-6fc7-4e9c-b732-e4c5c2c83583", 1],
  ["5d8da97a-de45-44f8-adf9-4b1b6cf2e11d", 2],
  ["a4c50e39-2279-4fd6-9382-58dc48c5386c", 3],
  ["08a56111-006d-454a-afdd-1bf315531326", 4],
  ["4ff3e3e0-7804-493a-8506-c5ca52fc6b98", 5],
  ["e034d3c8-ec52-473c-a7ba-b4abaec50e2e", 6],
  ["896d7887-c87d-4907-a7eb-e41c2a2fe81c", 7],
  ["b88f8b4b-79e5-45fc-9702-1dcaca29fe55", 8],
  ["0aabac72-b0dd-48ed-be14-c8a19a528445", 9],
]);

function getHotfixProcedurePriority(procedureId: string): number {
  return (
    HOTFIX_PROCEDURE_ORDER.get(procedureId.toLowerCase()) ??
    Number.POSITIVE_INFINITY
  );
}

function sortProceduresForBooking(procedures: Procedure[]): Procedure[] {
  return procedures
    .map((procedure, index) => ({
      index,
      priority: getHotfixProcedurePriority(procedure.id),
      procedure,
    }))
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.index - right.index;
    })
    .map(({ procedure }) => procedure);
}

type TimePeriodKey = "morning" | "day" | "evening" | "night";

export type SlotPeriod = {
  key: TimePeriodKey;
  label: string;
  slots: SlotOption[];
};

export type BookingFlow = {
  addServiceSection: () => void;
  bookingSummary: BookingSummary;
  canAddAnotherService: boolean;
  clientName: string;
  clientPhone: string;
  currentVisualStep: Step;
  formErrors: { name?: string; phone?: string };
  globalError: string | null;
  handleSectionActionRequest: (sectionId: string) => void;
  handleSectionDelete: (sectionId: string) => void;
  handleSectionEditConfirm: (sectionId: string) => void;
  handleSectionSelectGroup: (sectionId: string, group: ProcedureGroup) => void;
  handleSectionSelectBundleProcedureMaster: (
    sectionId: string,
    procedureId: string,
    executionId: string | null,
  ) => void;
  handleSectionSelectProcedure: (
    sectionId: string,
    procedure: Procedure,
  ) => void;
  handleToggleBundleProcedurePicker: (
    sectionId: string,
    procedureId: string,
  ) => void;
  handleSubmitAppointment: (event: FormEvent<HTMLFormElement>) => void;
  handleToggleSectionDescription: (sectionId: string) => void;
  isFormValid: boolean;
  isReadyForTimeSelection: boolean;
  isSubmitting: boolean;
  locale: string;
  mapAddressUrl: string | null;
  platform: BookingPlatformVariant;
  procedureCategories: ProcedureCategoryGroup[];
  procedureGroups: ProcedureGroup[];
  proceduresError: string | null;
  proceduresLoading: boolean;
  refetchSlots: () => Promise<void>;
  salonAddress: string | undefined;
  salonName: string;
  salonProfile: PublicSalonProfile | null;
  sections: BookingServiceSection[];
  selectedDateKey: string | null;
  selectedPhoneCountry?: CountryCode;
  selectedProcedure: Procedure | null;
  selectedProcedurePrice: CurrencyValue | null;
  selectedSlot: SlotInterval | null;
  selectedSlotDurationSubtitle: string | null;
  selectedSlotSummaryTitle: string | null;
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
  setSelectedPhoneCountry: Dispatch<SetStateAction<CountryCode | undefined>>;
  setSelectedDateKey: Dispatch<SetStateAction<string | null>>;
  setSelectedSlot: Dispatch<SetStateAction<SlotInterval | null>>;
  slotCalendarDays: CalendarDay[];
  slotMonthTitle: string;
  slotPeriods: SlotPeriod[];
  slotsError: string | null;
  slotsLoading: boolean;
  submitErrorNonce: number;
};

type UseBookingFlowParams = {
  locale: string;
  salonId: string;
  trackingId?: string | null;
};

function createSectionId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `section-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptySection(
  overrides: Partial<BookingServiceSectionState> = {},
): BookingServiceSectionState {
  return {
    activeBundleProcedureId: null,
    id: overrides.id ?? createSectionId(),
    isActionMenuOpen: false,
    isDescriptionExpanded: false,
    selectedBundleProcedureSelections: [],
    selectedGroupId: null,
    selectedProcedureKey: null,
    ...overrides,
  };
}

function getBundleProcedureSelectionMap(
  selections: BundleProcedureSelection[],
) {
  return new Map(
    selections.map(
      (selection) =>
        [selection.procedureId, selection.executionId ?? null] as const,
    ),
  );
}

function applyBundleProcedureSelections(
  procedure: Procedure,
  selections: BundleProcedureSelection[],
): Procedure {
  if (procedure.kind !== "bundle") {
    return procedure;
  }

  const selectionMap = getBundleProcedureSelectionMap(selections);
  const bundleItems = (procedure.bundleItems ?? []).map((item) => ({
    executionId: selectionMap.get(item.procedureId) ?? item.executionId ?? null,
    procedureId: item.procedureId,
  }));
  const bundleProcedureItems = (procedure.bundleProcedureItems ?? []).map(
    (item) => {
      const selectedExecutionId = selectionMap.get(item.procedureId) ?? null;
      const selectedMasterOption =
        item.masterOptions.find(
          (option) => (option.executionId ?? null) === selectedExecutionId,
        ) ?? null;

      return {
        ...item,
        selectedMasterOption,
      } satisfies BundleProcedureItem;
    },
  );
  const totalDuration = bundleProcedureItems.reduce(
    (total, item) =>
      total + (item.selectedMasterOption?.duration ?? item.duration ?? 0),
    0,
  );

  return {
    ...procedure,
    bundleItems,
    bundleProcedureItems,
    duration: totalDuration,
    price: procedure.bundleDefinition
      ? buildBundlePrice(procedure.bundleDefinition, bundleItems)
      : procedure.price,
  };
}

function buildBundleProcedureSelections(
  procedure: Procedure | null,
  selections: BundleProcedureSelection[],
) {
  if (procedure?.kind !== "bundle") {
    return [];
  }

  const selectionMap = getBundleProcedureSelectionMap(selections);
  return (procedure.bundleItems ?? []).map((item) => ({
    executionId: selectionMap.get(item.procedureId) ?? item.executionId ?? null,
    procedureId: item.procedureId,
  }));
}

function isSlotInFuture(slot: SlotInterval, nowTimestamp: number): boolean {
  return new Date(slot.start).getTime() > nowTimestamp;
}

function buildSelectedServiceSearchItem(
  procedure: Procedure,
): PublicSearchSlotsBody["items"][number] {
  if (procedure.kind === "bundle") {
    return {
      bundle: {
        bundleId: procedure.id,
        items: (procedure.bundleItems ?? []).map((item) => ({
          ...(item.executionId ? { executionId: item.executionId } : {}),
          procedureId: item.procedureId,
        })),
      },
    };
  }

  return {
    procedure: {
      ...(procedure.executionId ? { executionId: procedure.executionId } : {}),
      procedureId: procedure.id,
    },
  };
}

function buildSelectedServiceBody(
  procedures: Procedure[],
): PublicSearchSlotsBody {
  return {
    items: procedures.map((procedure) => buildSelectedServiceSearchItem(procedure)),
  };
}

function normalizeSlotInterval(slot: SlotInterval): SlotInterval {
  return {
    end: new Date(slot.end).toISOString(),
    start: new Date(slot.start).toISOString(),
  };
}

function findMatchingDetailedSlot(
  slotsResponse: PublicSearchSlotsResponse | undefined,
  selectedSlot: SlotInterval,
) {
  if (!slotsResponse || "intervals" in slotsResponse) {
    return null;
  }

  return (
    slotsResponse.slots.find(
      (slot) =>
        slot.total.start === selectedSlot.start && slot.total.end === selectedSlot.end,
    ) ?? null
  );
}

function buildCreateSelectedServiceItem(
  procedure: Procedure,
  selectedSlot: SlotInterval,
  slotsResponse: PublicSearchSlotsResponse | undefined,
): PublicBookingCreatePayload["selectedService"]["items"][number] {
  const normalizedSelectedSlot = normalizeSlotInterval(selectedSlot);
  const detailedSlot = findMatchingDetailedSlot(slotsResponse, selectedSlot);
  const slotProcedureTimeByKey = new Map<string, SlotInterval>();
  const slotProcedureTimeByProcedureId = new Map<string, SlotInterval>();

  for (const item of detailedSlot?.procedures ?? []) {
    slotProcedureTimeByKey.set(`${item.id}:${item.executorId}`, item.time);
    if (!slotProcedureTimeByProcedureId.has(item.id)) {
      slotProcedureTimeByProcedureId.set(item.id, item.time);
    }
  }

  if (procedure.kind === "bundle") {
    return {
      bundle: {
        bundleId: procedure.id,
        items: (procedure.bundleItems ?? []).map((item) => {
          const time =
            slotProcedureTimeByKey.get(
              `${item.procedureId}:${item.executionId ?? ""}`,
            ) ??
            slotProcedureTimeByProcedureId.get(item.procedureId) ??
            undefined;

          return {
            ...(item.executionId ? { executionId: item.executionId } : {}),
            procedureId: item.procedureId,
            ...(time ? { time } : {}),
          };
        }),
      },
    };
  }

  const procedureTime =
    slotProcedureTimeByKey.get(`${procedure.id}:${procedure.executionId ?? ""}`) ??
    slotProcedureTimeByProcedureId.get(procedure.id) ??
    normalizedSelectedSlot;

  return {
    procedure: {
      ...(procedure.executionId ? { executionId: procedure.executionId } : {}),
      procedureId: procedure.id,
      time: procedureTime,
    },
  };
}

function buildCreateSelectedServiceBody(
  procedures: Procedure[],
  selectedSlot: SlotInterval,
  slotsResponse: PublicSearchSlotsResponse | undefined,
): PublicBookingCreatePayload["selectedService"] {
  return {
    items: procedures.map((procedure) =>
      buildCreateSelectedServiceItem(procedure, selectedSlot, slotsResponse),
    ),
  };
}

function mapDraftSectionsToState(
  sections: BookingDraftServiceSection[],
): BookingServiceSectionState[] {
  if (!sections.length) {
    return [createEmptySection()];
  }

  return sections.map((section) =>
    createEmptySection({
      selectedBundleProcedureSelections:
        section.selectedBundleProcedureSelections?.map((selection) => ({
          executionId: selection.executionId ?? null,
          procedureId: selection.procedureId,
        })) ?? [],
      selectedGroupId: section.selectedGroupId,
      selectedProcedureKey: section.selectedProcedureKey,
    }),
  );
}

function normalizeSections(
  sections: BookingServiceSectionState[],
): BookingServiceSectionState[] {
  return sections.length > 0 ? sections : [createEmptySection()];
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
  const [submitErrorNonce, setSubmitErrorNonce] = useState(0);
  const [nowTimestamp, setNowTimestamp] = useState(() => Date.now());
  const [timeZoneId, setTimeZoneId] = useState("UTC");
  const [serviceSections, setServiceSections] = useState<
    BookingServiceSectionState[]
  >([createEmptySection()]);
  const [selectedDateKeyState, setSelectedDateKeyState] = useState<
    string | null
  >(null);
  const [selectedSlotState, setSelectedSlotState] =
    useState<SlotInterval | null>(null);
  const [clientName, setClientNameState] = useState("");
  const [clientPhone, setClientPhoneState] = useState("");
  const [selectedPhoneCountry, setSelectedPhoneCountryState] = useState<
    CountryCode | undefined
  >(() => resolvePhoneCountry({ locale }));
  const [hasUserSelectedPhoneCountry, setHasUserSelectedPhoneCountry] =
    useState(false);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [formErrors, setFormErrorsState] = useState<{
    name?: string;
    phone?: string;
  }>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiMessageTemplate = useCallback(
    (message: string) => t("errors.apiMessage", { message }),
    [t],
  );

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTimestamp(Date.now());
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const profileQuery = useQuery(
    publicSalonProfileQueryOptions(salonId, locale),
  );
  const catalogQuery = useQuery(
    publicSalonCatalogQueryOptions(salonId, locale),
  );
  const mastersQuery = useQuery(
    publicSalonMastersQueryOptions(salonId, locale),
  );

  const salonProfile = profileQuery.data ?? null;
  const defaultPhoneCountry = useMemo(
    () =>
      resolvePhoneCountry({
        locale,
        salonCountry: salonProfile?.address?.country,
        salonLocale: salonProfile?.localeId,
      }),
    [locale, salonProfile?.address?.country, salonProfile?.localeId],
  );
  const procedures = useMemo<Procedure[]>(
    () =>
      catalogQuery.data
        ? sortProceduresForBooking(
            adaptCatalogToProcedures(
              catalogQuery.data,
              mastersQuery.data ?? [],
            ),
          )
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

  useEffect(() => {
    if (hasUserSelectedPhoneCountry) {
      return;
    }

    const phoneCountry = getPhoneCountryFromValue(clientPhone);
    setSelectedPhoneCountryState(phoneCountry ?? defaultPhoneCountry);
  }, [clientPhone, defaultPhoneCountry, hasUserSelectedPhoneCountry]);

  const procedureGroups: ProcedureGroup[] = useMemo(() => {
    if (!procedures.length) return [];

    const groupsMap = new Map<string, ProcedureGroup>();

    procedures.forEach((procedure) => {
      const baseTitle =
        procedure.title?.trim() ?? procedure.alias?.trim() ?? procedure.id;

      const key = `${procedure.kind}:${procedure.accessType}:${baseTitle.toLowerCase()}`;
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

  useEffect(() => {
    if (!hasHydratedDraft) {
      return;
    }

    if (!procedureCategories.length) {
      if (expandedCategoryIds.length > 0) {
        setExpandedCategoryIds([]);
      }
      return;
    }

    const validIds = new Set(
      procedureCategories.map((category) => category.id),
    );
    const next = expandedCategoryIds.filter((id) => validIds.has(id));
    if (next.length !== expandedCategoryIds.length) {
      setExpandedCategoryIds(next);
    }
  }, [expandedCategoryIds, hasHydratedDraft, procedureCategories]);

  const sections = useMemo<BookingServiceSection[]>(() => {
    return normalizeSections(serviceSections).map((section) => {
      const selectedGroup =
        procedureGroups.find((group) => group.id === section.selectedGroupId) ??
        null;
      const baseSelectedProcedure = section.selectedProcedureKey
        ? (procedures.find(
            (procedure) =>
              getProcedureSelectionKey(procedure) ===
              section.selectedProcedureKey,
          ) ?? null)
        : null;
      const selectedProcedure =
        baseSelectedProcedure?.kind === "bundle"
          ? applyBundleProcedureSelections(
              baseSelectedProcedure,
              buildBundleProcedureSelections(
                baseSelectedProcedure,
                section.selectedBundleProcedureSelections,
              ),
            )
          : baseSelectedProcedure;
      const isBundleComplete = Boolean(
        selectedGroup?.procedures[0]?.kind === "bundle" &&
          selectedProcedure?.kind === "bundle",
      );

      return {
        ...section,
        footerDuration: formatDuration(
          selectedProcedure?.duration ?? selectedGroup?.duration ?? null,
          locale,
        ),
        footerPrice: toCurrencyValue(
          selectedProcedure?.price?.amount ?? selectedGroup?.minPrice ?? null,
          selectedProcedure?.price?.currency ?? selectedGroup?.currency ?? null,
        ),
        isComplete: selectedProcedure !== null || isBundleComplete,
        selectedGroup,
        selectedProcedure,
      };
    });
  }, [locale, procedureGroups, procedures, serviceSections]);

  const selectedProcedures = useMemo(
    () =>
      sections
        .map((section) => section.selectedProcedure)
        .filter((procedure): procedure is Procedure => procedure !== null),
    [sections],
  );

  const allSectionsComplete = useMemo(
    () =>
      sections.length > 0 &&
      sections.every((section) => section.selectedProcedure !== null),
    [sections],
  );

  const isReadyForTimeSelection =
    allSectionsComplete && selectedProcedures.length > 0;

  const selectedProcedure = selectedProcedures[0] ?? null;

  const selectedDateKey = selectedDateKeyState;
  const selectedSlot = selectedSlotState;

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

  const selectedServiceBody = useMemo(
    () =>
      isReadyForTimeSelection
        ? buildSelectedServiceBody(selectedProcedures)
        : null,
    [isReadyForTimeSelection, selectedProcedures],
  );

  const selectedSlotsQueryParams = useMemo(
    () =>
      selectedServiceBody && selectedDateKey
        ? {
            date: toTimeZoneIsoDate(selectedDateKey, timeZoneId),
            salonId,
            selectedService: selectedServiceBody,
            timeZone: timeZoneId,
          }
        : null,
    [salonId, selectedDateKey, selectedServiceBody, timeZoneId],
  );

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
    queryKey: selectedSlotsQueryOptions?.queryKey ?? [
      "public-booking",
      "slots",
      "idle",
      salonId,
      timeZoneId,
    ],
    enabled: Boolean(selectedSlotsQueryParams),
    staleTime: selectedSlotsQueryOptions?.staleTime ?? 60 * 1000,
  });

  useEffect(() => {
    if (
      slotsQuery.data?.timeZoneId &&
      slotsQuery.data.timeZoneId !== timeZoneId
    ) {
      setTimeZoneId(slotsQuery.data.timeZoneId);
    }
  }, [slotsQuery.data?.timeZoneId, timeZoneId]);

  const refetchSlots = useCallback(async () => {
    if (!selectedSlotsQueryParams) {
      return;
    }

    const queryOptions = publicBookingSlotsQueryOptions(
      selectedSlotsQueryParams,
    );
    await queryClient.invalidateQueries({
      exact: true,
      queryKey: queryOptions.queryKey,
    });
    const data = await queryClient.fetchQuery(queryOptions);

    if (data.timeZoneId && data.timeZoneId !== timeZoneId) {
      setTimeZoneId(data.timeZoneId);
    }
  }, [queryClient, selectedSlotsQueryParams, timeZoneId]);

  useEffect(() => {
    if (hasHydratedDraft || proceduresLoading || !dateOptions.length) {
      return;
    }

    let cancelled = false;

    const restoreDraft = async () => {
      const scope = { locale, salonId };
      const draftSnapshot = readBookingDraftSnapshot(scope);
      const urlState = readBookingDraftUrlState(searchParams);

      const requestedSections = draftSnapshot?.serviceSections.length
        ? draftSnapshot.serviceSections
        : urlState.selectedGroupId || urlState.selectedProcedureKey
          ? [
              {
                selectedBundleProcedureSelections: [],
                selectedGroupId: urlState.selectedGroupId,
                selectedProcedureKey: urlState.selectedProcedureKey,
              },
            ]
          : [];

      const nextSections = mapDraftSectionsToState(requestedSections).map(
        (section) => {
          const requestedProcedure = section.selectedProcedureKey
            ? (procedures.find(
                (procedure) =>
                  getProcedureSelectionKey(procedure) ===
                  section.selectedProcedureKey,
              ) ?? null)
            : null;

          const requestedGroup = requestedProcedure
            ? (procedureGroups.find((group) =>
                group.procedures.some(
                  (procedure) =>
                    getProcedureSelectionKey(procedure) ===
                    getProcedureSelectionKey(requestedProcedure),
                ),
              ) ?? null)
            : section.selectedGroupId
              ? (procedureGroups.find(
                  (group) => group.id === section.selectedGroupId,
                ) ?? null)
              : null;

          if (!requestedGroup) {
            return createEmptySection({ id: section.id });
          }

          let selectedProcedureKey =
            requestedProcedure &&
            requestedGroup.procedures.some(
              (procedure) =>
                getProcedureSelectionKey(procedure) ===
                getProcedureSelectionKey(requestedProcedure),
            )
              ? getProcedureSelectionKey(requestedProcedure)
              : null;

          if (!selectedProcedureKey && requestedGroup.procedures.length === 1) {
            selectedProcedureKey = getProcedureSelectionKey(
              requestedGroup.procedures[0]!,
            );
          }

          return createEmptySection({
            activeBundleProcedureId: null,
            id: section.id,
            selectedBundleProcedureSelections:
              requestedProcedure?.kind === "bundle"
                ? buildBundleProcedureSelections(
                    requestedProcedure,
                    section.selectedBundleProcedureSelections,
                  )
                : [],
            selectedGroupId: requestedGroup.id,
            selectedProcedureKey,
          });
        },
      );

      const requestedDateKey =
        urlState.selectedDateKey ?? draftSnapshot?.selectedDateKey ?? null;
      const requestedSlotStart =
        urlState.selectedSlotStart ?? draftSnapshot?.selectedSlotStart ?? null;

      const nextDateKey =
        requestedDateKey &&
        dateOptions.some((option) => option.key === requestedDateKey)
          ? requestedDateKey
          : null;

      const nextSelectedProcedures = nextSections
        .map((section) =>
          section.selectedProcedureKey
            ? (() => {
                const procedure =
                  procedures.find(
                    (candidate) =>
                      getProcedureSelectionKey(candidate) ===
                      section.selectedProcedureKey,
                  ) ?? null;
                return procedure?.kind === "bundle"
                  ? applyBundleProcedureSelections(
                      procedure,
                      buildBundleProcedureSelections(
                        procedure,
                        section.selectedBundleProcedureSelections,
                      ),
                    )
                  : procedure;
              })()
            : null,
        )
        .filter((procedure): procedure is Procedure => procedure !== null);

      const restoredAllComplete =
        nextSections.length > 0 &&
        nextSections.every((section) => section.selectedProcedureKey !== null);

      let nextSlot: SlotInterval | null = null;

      if (
        restoredAllComplete &&
        nextSelectedProcedures.length > 0 &&
        nextDateKey &&
        requestedSlotStart
      ) {
        try {
          const queryOptions = publicBookingSlotsQueryOptions({
            date: toTimeZoneIsoDate(nextDateKey, timeZoneId),
            salonId,
            selectedService: buildSelectedServiceBody(nextSelectedProcedures),
            timeZone: timeZoneId,
          });

          const data = await queryClient.fetchQuery(queryOptions);
          const draftSlots =
            "intervals" in data
              ? data.intervals
              : data.slots.map((slot) => slot.total);

          nextSlot =
            draftSlots.find(
              (slot) =>
                slot.start === requestedSlotStart &&
                isSlotInFuture(slot, nowTimestamp),
            ) ?? null;

          if (data.timeZoneId && data.timeZoneId !== timeZoneId) {
            setTimeZoneId(data.timeZoneId);
          }
        } catch {
          nextSlot = null;
        }
      }

      const maxAllowedStep = nextSlot
        ? "details"
        : restoredAllComplete && nextSelectedProcedures.length > 0
          ? "time"
          : nextSections.some((section) => section.selectedGroupId)
            ? "master"
            : "service";
      const requestedStep = normalizeBookingDraftStep(
        draftSnapshot?.currentStep ?? maxAllowedStep,
      );
      void clampBookingDraftStep(requestedStep, maxAllowedStep);

      if (cancelled) {
        return;
      }

      const restoredPhoneCountry =
        typeof draftSnapshot?.selectedPhoneCountry === "string"
          ? (draftSnapshot.selectedPhoneCountry as CountryCode)
          : undefined;
      const nextPhoneCountry =
        restoredPhoneCountry ??
        getPhoneCountryFromValue(draftSnapshot?.clientPhone) ??
        defaultPhoneCountry;

      setClientNameState(draftSnapshot?.clientName ?? "");
      setClientPhoneState(
        normalizePhoneToE164(
          draftSnapshot?.clientPhone ?? "",
          nextPhoneCountry ?? defaultPhoneCountry,
        ),
      );
      setSelectedPhoneCountryState(nextPhoneCountry);
      setHasUserSelectedPhoneCountry(Boolean(restoredPhoneCountry));
      setExpandedCategoryIds(draftSnapshot?.expandedCategoryIds ?? []);
      setFormErrorsState({});
      setGlobalError(null);
      setSelectedDateKeyState(nextDateKey);
      setSelectedSlotState(nextSlot);
      setServiceSections(normalizeSections(nextSections));
      setHasHydratedDraft(true);
    };

    void restoreDraft();

    return () => {
      cancelled = true;
    };
  }, [
    dateOptions,
    defaultPhoneCountry,
    hasHydratedDraft,
    locale,
    nowTimestamp,
    procedureGroups,
    procedures,
    proceduresLoading,
    queryClient,
    salonId,
    searchParams,
    timeZoneId,
  ]);

  useEffect(() => {
    if (!hasHydratedDraft) {
      return;
    }

    if (!dateOptions.length) return;
    if (
      !selectedDateKey ||
      !dateOptions.some((option) => option.key === selectedDateKey)
    ) {
      setSelectedDateKeyState(dateOptions[0]?.key ?? null);
    }
  }, [dateOptions, hasHydratedDraft, selectedDateKey]);

  useEffect(() => {
    if (!hasHydratedDraft) {
      return;
    }

    const nextSections = sections.map((section) => {
      if (!section.selectedGroup) {
        return createEmptySection({
          activeBundleProcedureId: null,
          id: section.id,
          isDescriptionExpanded: section.isDescriptionExpanded,
        });
      }

      let nextProcedureKey = section.selectedProcedureKey;
      if (
        nextProcedureKey &&
        !section.selectedGroup.procedures.some(
          (procedure) =>
            getProcedureSelectionKey(procedure) === nextProcedureKey,
        )
      ) {
        nextProcedureKey =
          section.selectedGroup.procedures.length === 1
            ? getProcedureSelectionKey(section.selectedGroup.procedures[0]!)
            : null;
      }

      return createEmptySection({
        activeBundleProcedureId: section.activeBundleProcedureId,
        id: section.id,
        isDescriptionExpanded: section.isDescriptionExpanded,
        selectedBundleProcedureSelections:
          section.selectedProcedure?.kind === "bundle"
            ? buildBundleProcedureSelections(
                section.selectedProcedure,
                section.selectedBundleProcedureSelections,
              )
            : [],
        selectedGroupId: section.selectedGroup.id,
        selectedProcedureKey: nextProcedureKey,
      });
    });

    const changed =
      nextSections.length !== serviceSections.length ||
      nextSections.some((section, index) => {
        const current = serviceSections[index];
        return (
          !current ||
          current.activeBundleProcedureId !== section.activeBundleProcedureId ||
          JSON.stringify(current.selectedBundleProcedureSelections) !==
            JSON.stringify(section.selectedBundleProcedureSelections) ||
          current.selectedGroupId !== section.selectedGroupId ||
          current.selectedProcedureKey !== section.selectedProcedureKey
        );
      });

    if (changed) {
      setServiceSections(normalizeSections(nextSections));
    }
  }, [hasHydratedDraft, sections, serviceSections]);

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

  const slotOptions = useMemo<SlotOption[]>(() => {
    const timeFormatter = new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timeZoneId,
    });

    const seenIntervals = new Set<string>();

    return [...slots]
      .filter((slot) => isSlotInFuture(slot, nowTimestamp))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .filter((slot) => {
        const intervalKey = `${slot.start}|${slot.end}`;
        if (seenIntervals.has(intervalKey)) {
          return false;
        }

        seenIntervals.add(intervalKey);
        return true;
      })
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
  }, [locale, nowTimestamp, slots, timeZoneId]);

  useEffect(() => {
    if (!selectedSlot || isSlotInFuture(selectedSlot, nowTimestamp)) {
      return;
    }

    setSelectedSlotState(null);
  }, [nowTimestamp, selectedSlot]);

  const slotPeriods = useMemo<SlotPeriod[]>(() => {
    if (!slotOptions.length) return [];

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
      { key: "day", label: t("timePeriods.day"), maxHour: 17, minHour: 12 },
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

  const updateSections = useCallback(
    (
      updater: (
        previous: BookingServiceSectionState[],
      ) => BookingServiceSectionState[],
    ) => {
      setServiceSections((previous) => normalizeSections(updater(previous)));
      setSelectedSlotState(null);
      setGlobalError(null);
    },
    [],
  );

  const handleSectionSelectGroup = useCallback(
    (sectionId: string, group: ProcedureGroup) => {
      updateSections((previous) =>
        previous.map((section) => {
          if (section.id !== sectionId) {
            return {
              ...section,
              isActionMenuOpen: false,
            };
          }

          return createEmptySection({
            activeBundleProcedureId: null,
            id: section.id,
            isDescriptionExpanded: section.isDescriptionExpanded,
            selectedBundleProcedureSelections:
              group.procedures[0]?.kind === "bundle"
                ? buildBundleProcedureSelections(
                    group.procedures[0],
                    group.procedures[0].bundleItems ?? [],
                  )
                : [],
            selectedGroupId: group.id,
            selectedProcedureKey:
              group.procedures.length === 1
                ? getProcedureSelectionKey(group.procedures[0]!)
                : null,
          });
        }),
      );
    },
    [updateSections],
  );

  const handleSectionSelectProcedure = useCallback(
    (sectionId: string, procedure: Procedure) => {
      updateSections((previous) =>
        previous.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                activeBundleProcedureId: null,
                isActionMenuOpen: false,
                selectedBundleProcedureSelections: [],
                selectedProcedureKey: getProcedureSelectionKey(procedure),
              }
            : {
                ...section,
                isActionMenuOpen: false,
              },
        ),
      );
    },
    [updateSections],
  );

  const handleToggleBundleProcedurePicker = useCallback(
    (sectionId: string, procedureId: string) => {
      updateSections((previous) =>
        previous.map((section) => {
          if (section.id !== sectionId) {
            return {
              ...section,
              activeBundleProcedureId: null,
              isActionMenuOpen: false,
            };
          }

          return {
            ...section,
            activeBundleProcedureId:
              section.activeBundleProcedureId === procedureId
                ? null
                : procedureId,
            isActionMenuOpen: false,
          };
        }),
      );
    },
    [updateSections],
  );

  const handleSectionSelectBundleProcedureMaster = useCallback(
    (sectionId: string, procedureId: string, executionId: string | null) => {
      updateSections((previous) =>
        previous.map((section) => {
          if (section.id !== sectionId) {
            return {
              ...section,
              activeBundleProcedureId: null,
              isActionMenuOpen: false,
            };
          }

          const existingSelections = buildBundleProcedureSelections(
            section.selectedProcedureKey
              ? (procedures.find(
                  (procedure) =>
                    getProcedureSelectionKey(procedure) ===
                    section.selectedProcedureKey,
                ) ?? null)
              : null,
            section.selectedBundleProcedureSelections,
          );
          const nextSelections = existingSelections.map((selection) =>
            selection.procedureId === procedureId
              ? {
                  ...selection,
                  executionId,
                }
              : selection,
          );

          return {
            ...section,
            activeBundleProcedureId: null,
            isActionMenuOpen: false,
            selectedBundleProcedureSelections: nextSelections,
          };
        }),
      );
    },
    [procedures, updateSections],
  );

  const handleSectionActionRequest = useCallback(
    (sectionId: string) => {
      updateSections((previous) => {
        return previous.map((section) => {
          if (section.id !== sectionId) {
            return {
              ...section,
              isActionMenuOpen: false,
            };
          }

          if (section.selectedProcedureKey) {
            return {
              ...section,
              activeBundleProcedureId: null,
              isActionMenuOpen: !section.isActionMenuOpen,
            };
          }

          return createEmptySection({
            id: section.id,
            isDescriptionExpanded: section.isDescriptionExpanded,
          });
        });
      });
    },
    [updateSections],
  );

  const handleSectionEditConfirm = useCallback(
    (sectionId: string) => {
      updateSections((previous) =>
        previous.map((section) =>
          section.id === sectionId
            ? createEmptySection({
                id: section.id,
                isDescriptionExpanded: section.isDescriptionExpanded,
              })
            : {
                ...section,
                activeBundleProcedureId: null,
                isActionMenuOpen: false,
              },
        ),
      );
    },
    [updateSections],
  );

  const handleSectionDelete = useCallback(
    (sectionId: string) => {
      updateSections((previous) => {
        const next = previous.filter((section) => section.id !== sectionId);
        return next.length > 0 ? next : [createEmptySection()];
      });
    },
    [updateSections],
  );

  const addServiceSection = useCallback(() => {
    updateSections((previous) => [...previous, createEmptySection()]);
  }, [updateSections]);

  const handleToggleSectionDescription = useCallback((sectionId: string) => {
    setServiceSections((previous) =>
      previous.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              activeBundleProcedureId: null,
              isDescriptionExpanded: !section.isDescriptionExpanded,
            }
          : section,
      ),
    );
  }, []);

  const setSelectedDateKey: Dispatch<SetStateAction<string | null>> =
    useCallback((value) => {
      setSelectedDateKeyState((previous) =>
        typeof value === "function" ? value(previous) : value,
      );
      setSelectedSlotState(null);
    }, []);

  const setSelectedSlot: Dispatch<SetStateAction<SlotInterval | null>> =
    useCallback((value) => {
      setSelectedSlotState((previous) =>
        typeof value === "function" ? value(previous) : value,
      );
    }, []);

  const setClientName: Dispatch<SetStateAction<string>> = useCallback(
    (value) => {
      setClientNameState((previous) =>
        typeof value === "function" ? value(previous) : value,
      );
    },
    [],
  );

  const setClientPhone: Dispatch<SetStateAction<string>> = useCallback(
    (value) => {
      setClientPhoneState((previous) =>
        typeof value === "function" ? value(previous) : value,
      );
    },
    [],
  );

  const setSelectedPhoneCountry: Dispatch<
    SetStateAction<CountryCode | undefined>
  > = useCallback((value) => {
    setHasUserSelectedPhoneCountry(true);
    setSelectedPhoneCountryState((previous) =>
      typeof value === "function" ? value(previous) : value,
    );
  }, []);

  const setFormErrors: Dispatch<
    SetStateAction<{ name?: string; phone?: string }>
  > = useCallback((value) => {
    setFormErrorsState((previous) =>
      typeof value === "function" ? value(previous) : value,
    );
  }, []);

  const isFormValid =
    clientName.trim().length > 0 &&
    validatePhoneForCountry(clientPhone, selectedPhoneCountry);

  const handleSubmitAppointment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const trimmedName = clientName.trim();
    const normalizedPhone = normalizePhoneToE164(
      clientPhone,
      selectedPhoneCountry,
    );
    const nextErrors: { name?: string; phone?: string } = {};

    if (!trimmedName) {
      nextErrors.name = t("errors.validationName");
    }

    if (!validatePhoneForCountry(normalizedPhone, selectedPhoneCountry)) {
      nextErrors.phone = t("errors.validationPhone");
    }

    if (Object.keys(nextErrors).length > 0) {
      setFormErrorsState(nextErrors);
      setSubmitErrorNonce((current) => current + 1);
      return;
    }

    if (!selectedServiceBody || !selectedSlot) {
      setGlobalError(t("errors.createAppointment"));
      setSubmitErrorNonce((current) => current + 1);
      return;
    }

    if (!isSlotInFuture(selectedSlot, Date.now())) {
      setSelectedSlotState(null);
      setGlobalError(t("errors.slotExpired"));
      setSubmitErrorNonce((current) => current + 1);
      return;
    }

    setFormErrorsState({});
    setGlobalError(null);
    setIsSubmitting(true);

    try {
      const createSelectedServiceBody = buildCreateSelectedServiceBody(
        selectedProcedures,
        selectedSlot,
        slotsQuery.data,
      );

      const data = await createPublicBooking(salonId, {
        clientName: trimmedName,
        clientPhone: normalizedPhone,
        selectedService: createSelectedServiceBody,
        time: normalizeSlotInterval(selectedSlot),
        ...(trackingId ? { trackingId } : {}),
      });

      const appointmentId = data.appointmentId;

      if (!appointmentId) {
        setSubmitErrorNonce((current) => current + 1);
        setGlobalError(t("errors.createAppointment"));
        setIsSubmitting(false);
        return;
      }

      isLeavingBookingFlowRef.current = true;
      clearBookingDraftSnapshot({ locale, salonId });

      await waitForPublicBooking(appointmentId).catch(() => null);

      const visitUrl = buildVisitUrl(locale, appointmentId);
      if (typeof window !== "undefined") {
        window.location.replace(visitUrl);
        return;
      }

      router.push(`/${locale}/visits/${appointmentId}`);
    } catch (error) {
      isLeavingBookingFlowRef.current = false;
      setSubmitErrorNonce((current) => current + 1);
      setGlobalError(
        resolveApiMessage(
          error,
          t("errors.createAppointment"),
          apiMessageTemplate,
        ),
      );
      setIsSubmitting(false);
    }
  };

  const salonName =
    salonProfile?.name?.trim() ||
    (proceduresLoading ? "" : t("salonFallbackName"));
  const salonAddress =
    formatAddress(salonProfile?.address, { includeCountry: false }) ||
    undefined;
  const mapAddressQuery =
    formatAddress(salonProfile?.address, { includeCountry: true }) || undefined;

  const totalPrice = useMemo(() => {
    if (!selectedProcedures.length) {
      return null;
    }

    const currency = selectedProcedures[0]?.price?.currency ?? null;
    if (!currency) {
      return null;
    }

    if (
      selectedProcedures.some(
        (procedure) =>
          procedure.price?.amount === undefined ||
          procedure.price?.currency !== currency,
      )
    ) {
      return null;
    }

    return selectedProcedures.reduce(
      (total, procedure) => total + (procedure.price?.amount ?? 0),
      0,
    );
  }, [selectedProcedures]);

  const selectedProcedurePrice = toCurrencyValue(
    totalPrice,
    selectedProcedures[0]?.price?.currency ?? null,
  );

  const totalDuration = formatDuration(
    selectedProcedures.reduce(
      (total, procedure) => total + (procedure.duration ?? 0),
      0,
    ),
    locale,
  );

  const selectedSlotSummaryTitle = selectedSlot
    ? formatSlotSummaryTitle(
        new Date(selectedSlot.start),
        new Date(selectedSlot.end),
        locale,
        timeZoneId,
      )
    : null;

  const selectedSlotDurationSubtitle =
    selectedSlot && selectedProcedures.length > 0
      ? t("summaryDurationLine", {
          value: totalDuration ?? "—",
        })
      : null;

  const bookingSummary = useMemo<BookingSummary>(
    () => ({
      services: sections
        .filter((section) => section.isComplete)
        .map((section) => ({
          id: section.id,
          items:
            section.selectedProcedure?.kind === "bundle"
              ? (section.selectedProcedure.bundleProcedureItems ?? []).map(
                  (item) => ({
                    id: item.procedureId,
                    specialist:
                      item.selectedMasterOption?.masterNickname ??
                      t("masterAny"),
                    title: item.title,
                  }),
                )
              : undefined,
          meta:
            [
              section.footerPrice
                ? formatCurrency(
                    section.footerPrice.amount,
                    section.footerPrice.currency,
                    locale,
                  )
                : null,
              section.footerDuration,
            ]
              .filter(Boolean)
              .join(" • ") || null,
          specialist:
            section.selectedProcedure?.masterNickname ??
            section.selectedProcedure?.alias ??
            t("masterAny"),
          title: section.selectedGroup?.title ?? "—",
        })),
      slotSubtitle: null,
      slotTitle: selectedSlotSummaryTitle,
      totalDuration,
      totalPrice: selectedProcedurePrice
        ? formatCurrency(
            selectedProcedurePrice.amount,
            selectedProcedurePrice.currency,
            locale,
          )
        : null,
    }),
    [
      locale,
      sections,
      selectedProcedurePrice,
      selectedSlotSummaryTitle,
      t,
      totalDuration,
    ],
  );

  const mapAddressUrl = mapAddressQuery
    ? buildPlatformMapsUrl(platform === "ios" ? "apple" : "android", {
        address: mapAddressQuery,
        salonName,
      })
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
        isToday: option.key === getDateKeyForTimeZone(new Date(), timeZoneId),
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

  const currentVisualStep: Step = selectedSlot
    ? "details"
    : isReadyForTimeSelection
      ? "time"
      : sections.some((section) => section.selectedGroup)
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
      selectedPhoneCountry: selectedPhoneCountry ?? null,
      selectedDateKey,
      selectedSlotStart: selectedSlot?.start ?? null,
      serviceSections: serviceSections.map((section) => ({
        selectedBundleProcedureSelections:
          section.selectedBundleProcedureSelections.map((selection) => ({
            executionId: selection.executionId ?? null,
            procedureId: selection.procedureId,
          })),
        selectedGroupId: section.selectedGroupId,
        selectedProcedureKey: section.selectedProcedureKey,
      })),
      updatedAt: Date.now(),
      version: 4 as const,
    };

    if (hasMeaningfulBookingDraft(draftSnapshot)) {
      writeBookingDraftSnapshot(scope, draftSnapshot);
    } else {
      clearBookingDraftSnapshot(scope);
    }

    const firstSection = serviceSections[0] ?? null;
    writeBookingDraftUrlState({
      selectedDateKey,
      selectedGroupId: firstSection?.selectedGroupId ?? null,
      selectedProcedureKey: firstSection?.selectedProcedureKey ?? null,
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
    selectedPhoneCountry,
    selectedDateKey,
    selectedSlot,
    serviceSections,
  ]);

  const canAddAnotherService =
    allSectionsComplete && procedureGroups.length > 0 && !isSubmitting;

  return {
    addServiceSection,
    bookingSummary,
    canAddAnotherService,
    clientName,
    clientPhone,
    currentVisualStep,
    formErrors,
    globalError,
    handleSectionActionRequest,
    handleSectionDelete,
    handleSectionEditConfirm,
    handleSectionSelectBundleProcedureMaster,
    handleSectionSelectGroup,
    handleSectionSelectProcedure,
    handleSubmitAppointment,
    handleToggleBundleProcedurePicker,
    handleToggleSectionDescription,
    isFormValid,
    isReadyForTimeSelection,
    isSubmitting,
    locale,
    mapAddressUrl,
    platform,
    procedureCategories,
    procedureGroups,
    proceduresError,
    proceduresLoading,
    refetchSlots,
    salonAddress,
    salonName,
    salonProfile,
    sections,
    selectedDateKey,
    selectedPhoneCountry,
    selectedProcedure,
    selectedProcedurePrice,
    selectedSlot,
    selectedSlotDurationSubtitle,
    selectedSlotSummaryTitle,
    setClientName,
    setClientPhone,
    setFormErrors,
    setSelectedPhoneCountry,
    setSelectedDateKey,
    setSelectedSlot,
    slotCalendarDays,
    slotMonthTitle,
    slotPeriods,
    slotsError,
    slotsLoading,
    submitErrorNonce,
  };
}
