import {
  getPublicSalonCatalog,
  getPublicSalonMasters,
  getPublicSalonProfile,
  searchPublicBookingSlots,
} from "./public-booking";

type SlotSelectionKind = "complex" | "procedure";

export type PublicBookingSlotsQueryParams = {
  date: string;
  masterId?: string | null;
  procedureIds?: string[];
  salonId: string;
  selectionId: string;
  selectionKind: SlotSelectionKind;
  timeZone: string;
};

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
        masterId: params.masterId ?? null,
        procedureIds: params.procedureIds ?? [],
        salonId: params.salonId,
        selectionId: params.selectionId,
        selectionKind: params.selectionKind,
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
          body:
            params.selectionKind === "complex"
              ? {
                  id: params.selectionId,
                  procedures: (params.procedureIds ?? []).map((id) => ({
                    ...(params.masterId ? { executorId: params.masterId } : {}),
                    id,
                  })),
                }
              : {
                  ...(params.masterId ? { executorId: params.masterId } : {}),
                  id: params.selectionId,
                },
          date: params.date,
          salonId: params.salonId,
        },
        { signal },
      ),
    queryKey: publicBookingKeys.slots(params),
    staleTime: 60 * 1000,
  };
}
