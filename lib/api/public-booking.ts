"use client";

import { clientApiRequest } from "./client";
import { getOrCreateDeviceId } from "./device-id";
import { ApiError } from "./error-handler";
import type {
  PublicBookingCreatePayload,
  PublicClickMetadata,
  PublicClickResponse,
  PublicDateInterval,
  PublicLinkKind,
  PublicSalonCatalog,
  PublicSalonMaster,
  PublicSalonProfile,
  PublicSearchComplexBody,
  PublicSearchProcedureBody,
  PublicSearchSlotsResponse,
  SharedPublicBookingVisit,
} from "./maetry-contracts";

export type {
  PublicAddress,
  PublicBookingCreatePayload,
  PublicClickMetadata,
  PublicClickPayload,
  PublicClickResponse,
  PublicComplexSlot,
  PublicComplexSlotProcedure,
  PublicComplexSlotsResponse,
  PublicDateInterval,
  PublicLinkKind,
  PublicPrice,
  PublicProcedureSlotsResponse,
  PublicSalonCatalog,
  PublicSalonCatalogComplex,
  PublicSalonCatalogComplexProcedure,
  PublicSalonCatalogProcedure,
  PublicSalonMaster,
  PublicSalonProfile,
  PublicSearchComplexBody,
  PublicSearchProcedureBody,
  PublicSearchSlotsResponse,
} from "./maetry-contracts";

export type PublicMarketingCampaign = {
  affiliateOfferId?: string | null;
  appointmentsCreated?: number;
  clicksCount?: number;
  createdAt?: string;
  description?: string | null;
  id?: string;
  influencerContactId?: string | null;
  linkId?: string;
  name?: string;
  salonId?: string;
  type?: string;
  updatedAt?: string;
};

export type PublicBookingVisit = {
  appointmentId?: string;
  masterId?: string;
  masterNickname?: string;
  price?: {
    amount?: number | null;
    currency?: string | null;
  };
  procedureId?: string;
  procedureName?: string;
  salonAddress?: string;
  salonId?: string;
  salonLogo?: string;
  salonName?: string;
  time?: PublicDateInterval;
  timezoneId?: string;
};

export type StoredPublicBookingContext = {
  campaignId?: string | null;
  kind?: PublicLinkKind;
  linkId: string;
  salonId?: string | null;
  savedAt: string;
  trackingId?: string | null;
};

type RequestOptions = {
  locale?: string;
  signal?: AbortSignal;
};

function buildDeviceIdHeader(): Record<string, string> | undefined {
  const deviceId = getOrCreateDeviceId();

  if (!deviceId) {
    return undefined;
  }

  return {
    "Device-ID": deviceId,
  };
}

function minorToMajor(value: number): number {
  return value / 100;
}

function formatAddress(value?: PublicSalonProfile["address"]) {
  if (!value) {
    return undefined;
  }

  return [value.address, value.city, value.country]
    .filter((part) => Boolean(part?.trim()))
    .join(", ");
}

function adaptVisitToPublicBookingVisit(
  visit: SharedPublicBookingVisit,
): PublicBookingVisit {
  const procedure =
    "procedure" in visit.service ? visit.service.procedure : undefined;
  const complex =
    "complex" in visit.service ? visit.service.complex : undefined;
  const firstComplexProcedure = complex?.procedures[0];
  const executor = procedure?.executor ?? firstComplexProcedure?.executor;

  return {
    appointmentId: visit.id,
    masterId: executor?.masterId,
    masterNickname: executor?.name,
    price: {
      amount: minorToMajor(visit.priceMinor),
      currency: visit.currency,
    },
    procedureId: procedure?.id ?? firstComplexProcedure?.id,
    procedureName: procedure?.title ?? complex?.title,
    salonAddress: formatAddress(visit.address),
    salonId: visit.salon.id,
    salonLogo: visit.salon.logoUrl,
    salonName: visit.salon.name,
    time:
      visit.startTime && visit.endTime
        ? {
            end: visit.endTime,
            start: visit.startTime,
          }
        : undefined,
    timezoneId: visit.timezoneId,
  };
}

/** Путь ссылки в URL API: `b/nano` → `b/nano` как несколько сегментов пути. */
export function encodeLinkPathForApi(linkPath: string): string {
  return linkPath
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

const PUBLIC_BOOKING_CONTEXT_KEY = "maetry-public-booking-context";

const isNavigator = typeof navigator !== "undefined";
const isWindow = typeof window !== "undefined";

export function buildClickMetadata(): PublicClickMetadata {
  const navigatorLanguage = isNavigator ? navigator.language : "en-US";
  const language = navigatorLanguage.split("-")[0] || "en";
  const languages = isNavigator
    ? navigator.languages.map((item) => item.split("-")[0]).filter(Boolean)
    : [language];
  const cores = isNavigator ? navigator.hardwareConcurrency ?? 4 : 4;
  const memory =
    isNavigator && "deviceMemory" in navigator
      ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) *
        1024
      : 4096;
  const screenWidth = isWindow
    ? Math.round(window.screen.width * (window.devicePixelRatio || 1))
    : 1920;
  const screenHeight = isWindow
    ? Math.round(window.screen.height * (window.devicePixelRatio || 1))
    : 1080;
  const colorDepth = isWindow ? window.screen.colorDepth || 24 : 24;
  const pixelRatio = isWindow ? window.devicePixelRatio || 1 : 1;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  return {
    language,
    languages: languages.length ? languages : [language],
    cores,
    memory,
    screenWidth,
    screenHeight,
    colorDepth,
    pixelRatio,
    timeZone,
    ...(isNavigator && navigator.userAgent
      ? { userAgent: navigator.userAgent }
      : {}),
  };
}

export function savePublicBookingContext(
  context: StoredPublicBookingContext,
): void {
  if (!isWindow) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      PUBLIC_BOOKING_CONTEXT_KEY,
      JSON.stringify(context),
    );
  } catch {
    // ignore storage failures
  }
}

export function readPublicBookingContext(): StoredPublicBookingContext | null {
  if (!isWindow) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(PUBLIC_BOOKING_CONTEXT_KEY);

    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredPublicBookingContext;
  } catch {
    return null;
  }
}

export function isAuthorizationGap(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

export async function getCampaignByLink(
  linkId: string,
  { signal }: RequestOptions = {},
): Promise<PublicMarketingCampaign> {
  return clientApiRequest<PublicMarketingCampaign>({
    endpoint: `/api/marketing/campaigns/by-link/${encodeLinkPathForApi(linkId)}`,
    method: "GET",
    signal,
  });
}

export async function registerLinkClick(
  linkId: string,
  { signal }: RequestOptions = {},
): Promise<PublicClickResponse> {
  return clientApiRequest<PublicClickResponse>({
    endpoint: `/api/clicks/${encodeLinkPathForApi(linkId)}`,
    method: "POST",
    body: buildClickMetadata(),
    signal,
  });
}

export async function getPublicSalonProfile(
  salonId: string,
  { locale, signal }: RequestOptions = {},
): Promise<PublicSalonProfile> {
  return clientApiRequest<PublicSalonProfile>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/profile`,
    headers: locale
      ? {
          languages: locale,
        }
      : undefined,
    method: "GET",
    signal,
  });
}

export async function getPublicSalonCatalog(
  salonId: string,
  { locale, signal }: RequestOptions = {},
): Promise<PublicSalonCatalog> {
  return clientApiRequest<PublicSalonCatalog>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/catalog`,
    headers: locale
      ? {
          languages: locale,
        }
      : undefined,
    method: "GET",
    signal,
  });
}

export async function getPublicSalonMasters(
  salonId: string,
  { locale, signal }: RequestOptions = {},
): Promise<PublicSalonMaster[]> {
  return clientApiRequest<PublicSalonMaster[]>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/masters`,
    headers: locale
      ? {
          languages: locale,
        }
      : undefined,
    method: "GET",
    signal,
  });
}

export async function searchPublicBookingSlots(
  params: {
    body: PublicSearchProcedureBody | PublicSearchComplexBody;
    date: string;
    salonId: string;
  },
  { signal }: RequestOptions = {},
): Promise<PublicSearchSlotsResponse> {
  const query = new URLSearchParams({
    salonId: params.salonId,
    date: params.date,
  });

  return clientApiRequest<PublicSearchSlotsResponse>({
    endpoint: `/api/public-booking/search-slots?${query.toString()}`,
    method: "POST",
    body: params.body,
    headers: buildDeviceIdHeader(),
    signal,
  });
}

export async function createPublicBooking(
  salonId: string,
  payload: PublicBookingCreatePayload,
): Promise<PublicBookingVisit> {
  const response = await clientApiRequest<SharedPublicBookingVisit>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/bookings`,
    method: "POST",
    body: payload,
  });

  return adaptVisitToPublicBookingVisit(response);
}

export async function getPublicBooking(
  bookingId: string,
  { signal }: RequestOptions = {},
): Promise<PublicBookingVisit> {
  const response = await clientApiRequest<SharedPublicBookingVisit>({
    endpoint: `/api/public-booking/bookings/${encodeURIComponent(bookingId)}`,
    method: "GET",
    signal,
  });

  return adaptVisitToPublicBookingVisit(response);
}
