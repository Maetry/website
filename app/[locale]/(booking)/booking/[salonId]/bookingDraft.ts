import type { Step } from "@/lib/public-booking-screen";

const BOOKING_DRAFT_VERSION = 3;
const BOOKING_DRAFT_STORAGE_PREFIX = "booking-draft";

type BookingDraftScope = {
  locale: string;
  salonId: string;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

export type BookingDraftServiceSection = {
  selectedBundleProcedureSelections?: Array<{
    executionId: string | null;
    procedureId: string;
  }>;
  selectedGroupId: string | null;
  selectedProcedureKey: string | null;
};

export type BookingDraftSnapshot = {
  clientName: string;
  clientPhone: string;
  currentStep: Step;
  expandedCategoryIds: string[];
  locale: string;
  salonId: string;
  selectedDateKey: string | null;
  selectedSlotStart: string | null;
  serviceSections: BookingDraftServiceSection[];
  updatedAt: number;
  version: typeof BOOKING_DRAFT_VERSION;
};

export type BookingDraftUrlState = {
  selectedDateKey: string | null;
  selectedGroupId: string | null;
  selectedProcedureKey: string | null;
  selectedSlotStart: string | null;
};

const BOOKING_DRAFT_STEP_ORDER: Record<Step, number> = {
  details: 3,
  master: 1,
  service: 0,
  time: 2,
};

function getBookingDraftStorageKey({
  locale,
  salonId,
}: BookingDraftScope): string {
  return `${BOOKING_DRAFT_STORAGE_PREFIX}:${locale}:${salonId}`;
}

export function normalizeBookingDraftStep(
  value: string | null | undefined,
): Step {
  if (
    value === "service" ||
    value === "master" ||
    value === "time" ||
    value === "details"
  ) {
    return value;
  }

  return "service";
}

export function clampBookingDraftStep(desired: Step, maxAllowed: Step): Step {
  return BOOKING_DRAFT_STEP_ORDER[desired] <=
    BOOKING_DRAFT_STEP_ORDER[maxAllowed]
    ? desired
    : maxAllowed;
}

function normalizeServiceSections(parsed: {
  serviceSections?: unknown;
  selectedBundleProcedureSelections?: unknown;
  selectedGroupId?: string | null;
  selectedProcedureKey?: string | null;
}) {
  if (Array.isArray(parsed.serviceSections)) {
    const normalized: BookingDraftServiceSection[] = [];

    for (const section of parsed.serviceSections) {
      if (!section || typeof section !== "object") {
        continue;
      }

      const sectionValue = section as {
        selectedBundleProcedureSelections?: unknown;
        selectedGroupId?: unknown;
        selectedProcedureKey?: unknown;
      };

      const selectedBundleProcedureSelections = Array.isArray(
        sectionValue.selectedBundleProcedureSelections,
      )
        ? sectionValue.selectedBundleProcedureSelections
            .map((selection: unknown) => {
              if (!selection || typeof selection !== "object") {
                return null;
              }

              const selectionValue = selection as {
                executionId?: unknown;
                procedureId?: unknown;
              };

              return typeof selectionValue.procedureId === "string"
                ? {
                    executionId:
                      typeof selectionValue.executionId === "string"
                        ? selectionValue.executionId
                        : null,
                    procedureId: selectionValue.procedureId,
                  }
                : null;
            })
            .filter(
              (
                selection,
              ): selection is NonNullable<
                BookingDraftServiceSection["selectedBundleProcedureSelections"]
              >[number] => selection !== null,
            )
        : [];

      normalized.push({
        selectedBundleProcedureSelections,
        selectedGroupId:
          typeof sectionValue.selectedGroupId === "string"
            ? sectionValue.selectedGroupId
            : null,
        selectedProcedureKey:
          typeof sectionValue.selectedProcedureKey === "string"
            ? sectionValue.selectedProcedureKey
            : null,
      });
    }

    if (normalized.length > 0) {
      return normalized;
    }
  }

  if (parsed.selectedGroupId || parsed.selectedProcedureKey) {
    return [
      {
        selectedBundleProcedureSelections: [],
        selectedGroupId: parsed.selectedGroupId ?? null,
        selectedProcedureKey: parsed.selectedProcedureKey ?? null,
      },
    ];
  }

  return [];
}

export function readBookingDraftSnapshot(
  scope: BookingDraftScope,
): BookingDraftSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(getBookingDraftStorageKey(scope));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      clientName?: string;
      clientPhone?: string;
      currentStep?: string | null;
      expandedCategoryId?: string | null;
      expandedCategoryIds?: string[];
      locale?: string;
      salonId?: string;
      selectedDateKey?: string | null;
      selectedGroupId?: string | null;
      selectedProcedureKey?: string | null;
      selectedSlotStart?: string | null;
      serviceSections?: BookingDraftServiceSection[];
      updatedAt?: number;
      version?: number;
    };

    if (parsed.locale !== scope.locale || parsed.salonId !== scope.salonId) {
      return null;
    }

    if (
      parsed.version !== undefined &&
      parsed.version !== 1 &&
      parsed.version !== 2 &&
      parsed.version !== BOOKING_DRAFT_VERSION
    ) {
      return null;
    }

    const expandedCategoryIds = (() => {
      if (Array.isArray(parsed.expandedCategoryIds)) {
        return parsed.expandedCategoryIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0,
        );
      }
      if (
        typeof parsed.expandedCategoryId === "string" &&
        parsed.expandedCategoryId.length > 0
      ) {
        return [parsed.expandedCategoryId];
      }
      return [];
    })();

    return {
      clientName: parsed.clientName ?? "",
      clientPhone: parsed.clientPhone ?? "",
      currentStep: normalizeBookingDraftStep(parsed.currentStep),
      expandedCategoryIds,
      locale: scope.locale,
      salonId: scope.salonId,
      selectedDateKey: parsed.selectedDateKey ?? null,
      selectedSlotStart: parsed.selectedSlotStart ?? null,
      serviceSections: normalizeServiceSections(parsed),
      updatedAt: parsed.updatedAt ?? Date.now(),
      version: BOOKING_DRAFT_VERSION,
    };
  } catch {
    return null;
  }
}

export function writeBookingDraftSnapshot(
  scope: BookingDraftScope,
  snapshot: BookingDraftSnapshot,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    getBookingDraftStorageKey(scope),
    JSON.stringify(snapshot),
  );
}

export function clearBookingDraftSnapshot(scope: BookingDraftScope): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.removeItem(getBookingDraftStorageKey(scope));
}

export function hasMeaningfulBookingDraft(
  snapshot: Pick<
    BookingDraftSnapshot,
    | "clientName"
    | "clientPhone"
    | "selectedDateKey"
    | "selectedSlotStart"
    | "serviceSections"
  >,
): boolean {
  return Boolean(
    snapshot.serviceSections.some(
      (section) =>
        section.selectedGroupId ||
        section.selectedProcedureKey ||
        (section.selectedBundleProcedureSelections?.length ?? 0) > 0,
    ) ||
      snapshot.selectedDateKey ||
      snapshot.selectedSlotStart ||
      snapshot.clientName.trim() ||
      snapshot.clientPhone.trim(),
  );
}

export function readBookingDraftUrlState(
  searchParams: SearchParamsLike,
): BookingDraftUrlState {
  return {
    selectedDateKey: searchParams.get("date"),
    selectedGroupId: searchParams.get("group"),
    selectedProcedureKey: searchParams.get("procedure"),
    selectedSlotStart: searchParams.get("slot"),
  };
}

export function writeBookingDraftUrlState(state: BookingDraftUrlState): void {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);

  if (state.selectedGroupId) {
    url.searchParams.set("group", state.selectedGroupId);
  } else {
    url.searchParams.delete("group");
  }

  if (state.selectedProcedureKey) {
    url.searchParams.set("procedure", state.selectedProcedureKey);
  } else {
    url.searchParams.delete("procedure");
  }

  if (state.selectedDateKey) {
    url.searchParams.set("date", state.selectedDateKey);
  } else {
    url.searchParams.delete("date");
  }

  if (state.selectedSlotStart) {
    url.searchParams.set("slot", state.selectedSlotStart);
  } else {
    url.searchParams.delete("slot");
  }

  window.history.replaceState(window.history.state, "", url.toString());
}
