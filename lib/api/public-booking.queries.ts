import type { PublicSearchSlotsBody } from "./public-booking";
import {
  getPublicSalonCatalog,
  getPublicSalonMasters,
  getPublicSalonProfile,
  searchPublicBookingSlots,
} from "./public-booking";

type LegacyPublicBookingSlotsQueryParams = {
  date: string;
  masterId?: string | null;
  procedureIds?: string[];
  salonId: string;
  selectionId: string;
  selectionKind: "complex" | "procedure";
  timeZone: string;
};

export type PublicBookingSlotsQueryParams =
  | {
      date: string;
      salonId: string;
      selectedService: PublicSearchSlotsBody;
      timeZone: string;
    }
  | LegacyPublicBookingSlotsQueryParams;

function normalizeSelectedService(
  params: PublicBookingSlotsQueryParams,
): PublicSearchSlotsBody {
  if ("selectedService" in params) {
    return params.selectedService;
  }

  if (params.selectionKind === "complex") {
    return {
      items: [{
        bundle: {
          bundleId: params.selectionId,
          items: (params.procedureIds ?? []).map((procedureId) => ({
            ...(params.masterId ? { executionId: params.masterId } : {}),
            procedureId,
          })),
        },
      }],
    };
  }

  return {
    items: [{
      procedure: {
        ...(params.masterId ? { executionId: params.masterId } : {}),
        procedureId: params.selectionId,
      },
    }],
  };
}

function normalizeSelectedServiceCacheKey(selectedService: PublicSearchSlotsBody) {
  return selectedService.items.map((item) => {
    if ("procedure" in item) {
      return {
        procedure: {
          executionId: item.procedure.executionId ?? null,
          procedureId: item.procedure.procedureId,
        },
      };
    }

    return {
      bundle: {
        bundleId: item.bundle.bundleId,
        items: item.bundle.items.map((bundleItem) => ({
          executionId: bundleItem.executionId ?? null,
          procedureId: bundleItem.procedureId,
        })),
      },
    };
  });
}

export const publicBookingKeys = {
  salonCatalog: (salonId: string, locale?: string) =>
    ["public-booking", "salon-catalog", salonId, locale ?? "default"] as const,
  salonMasters: (salonId: string, locale?: string) =>
    ["public-booking", "salon-masters", salonId, locale ?? "default"] as const,
  salonProfile: (salonId: string, locale?: string) =>
    ["public-booking", "salon-profile", salonId, locale ?? "default"] as const,
  slots: (params: PublicBookingSlotsQueryParams) =>
    [
      "public-booking",
      "slots",
      {
        date: params.date,
        salonId: params.salonId,
        selectedService: normalizeSelectedServiceCacheKey(
          normalizeSelectedService(params),
        ),
        timeZone: params.timeZone,
      },
    ] as const,
};

export function publicSalonProfileQueryOptions(
  salonId: string,
  locale?: string,
) {
  return {
    gcTime: 6 * 60 * 60 * 1000,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getPublicSalonProfile(salonId, { locale, signal }),
    queryKey: publicBookingKeys.salonProfile(salonId, locale),
    staleTime: 10 * 60 * 1000,
  };
}

export function publicSalonCatalogQueryOptions(
  salonId: string,
  locale?: string,
) {
  return {
    gcTime: 6 * 60 * 60 * 1000,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getPublicSalonCatalog(salonId, { locale, signal }),
    queryKey: publicBookingKeys.salonCatalog(salonId, locale),
    staleTime: 10 * 60 * 1000,
  };
}

export function publicSalonMastersQueryOptions(
  salonId: string,
  locale?: string,
) {
  return {
    gcTime: 6 * 60 * 60 * 1000,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      getPublicSalonMasters(salonId, { locale, signal }),
    queryKey: publicBookingKeys.salonMasters(salonId, locale),
    staleTime: 10 * 60 * 1000,
  };
}

export function publicBookingSlotsQueryOptions(
  params: PublicBookingSlotsQueryParams,
) {
  return {
    gcTime: 30 * 60 * 1000,
    queryFn: ({ signal }: { signal: AbortSignal }) =>
      searchPublicBookingSlots(
        {
          body: normalizeSelectedService(params),
          date: params.date,
          salonId: params.salonId,
        },
        { signal },
      ),
    queryKey: publicBookingKeys.slots(params),
    staleTime: 60 * 1000,
  };
}
