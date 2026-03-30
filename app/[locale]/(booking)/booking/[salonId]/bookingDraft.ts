import type { Step } from "@/lib/public-booking-screen";

const BOOKING_DRAFT_VERSION = 1;
const BOOKING_DRAFT_STORAGE_PREFIX = "booking-draft";

type BookingDraftScope = {
  locale: string;
  salonId: string;
};

type SearchParamsLike = {
  get(name: string): string | null;
};

export type BookingDraftSnapshot = {
  clientName: string;
  clientPhone: string;
  currentStep: Step;
  expandedCategoryId: string | null;
  locale: string;
  salonId: string;
  selectedDateKey: string | null;
  selectedGroupId: string | null;
  selectedProcedureKey: string | null;
  selectedSlotStart: string | null;
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
  return BOOKING_DRAFT_STEP_ORDER[desired] <= BOOKING_DRAFT_STEP_ORDER[maxAllowed]
    ? desired
    : maxAllowed;
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

    const parsed = JSON.parse(raw) as Partial<BookingDraftSnapshot>;

    if (
      parsed.version !== BOOKING_DRAFT_VERSION ||
      parsed.locale !== scope.locale ||
      parsed.salonId !== scope.salonId
    ) {
      return null;
    }

    return {
      clientName: parsed.clientName ?? "",
      clientPhone: parsed.clientPhone ?? "",
      currentStep: normalizeBookingDraftStep(parsed.currentStep),
      expandedCategoryId: parsed.expandedCategoryId ?? null,
      locale: scope.locale,
      salonId: scope.salonId,
      selectedDateKey: parsed.selectedDateKey ?? null,
      selectedGroupId: parsed.selectedGroupId ?? null,
      selectedProcedureKey: parsed.selectedProcedureKey ?? null,
      selectedSlotStart: parsed.selectedSlotStart ?? null,
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
    | "selectedGroupId"
    | "selectedProcedureKey"
    | "selectedSlotStart"
  >,
): boolean {
  return Boolean(
    snapshot.selectedGroupId ||
      snapshot.selectedProcedureKey ||
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

export function writeBookingDraftUrlState(
  state: BookingDraftUrlState,
): void {
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
