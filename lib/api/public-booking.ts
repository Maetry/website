"use client";

import { clientApiRequest } from "./client";
import { ApiError } from "./error-handler";

export type PublicLinkKind = "marketing" | "employeeInvite" | "clientInvite";

export type PublicMarketingCampaign = {
  id?: string;
  salonId?: string;
  type?: string;
  name?: string;
  description?: string | null;
  linkId?: string;
  affiliateOfferId?: string | null;
  influencerContactId?: string | null;
  clicksCount?: number;
  appointmentsCreated?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicClickPayload = {
  clientId?: string;
  employeeId?: string;
  campaignId?: string;
  salonId?: string;
};

export type PublicClickMetadata = {
  language: string;
  languages: string[];
  cores: number;
  memory: number;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  timeZone: string;
  /** Доп. сигнал для сопоставления клика с установкой приложения */
  userAgent?: string;
};

export type PublicClickResponse = {
  nanoId: string;
  kind: PublicLinkKind;
  payload?: PublicClickPayload;
  isOneTime: boolean;
  expiresAt?: string | null;
  usedAt?: string | null;
  createdAt?: string | null;
};

export type PublicPrice = {
  amount?: number | null;
  currency?: string | null;
};

export type PublicAddress = {
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
};

export type PublicSalonProfile = {
  id?: string;
  name?: string;
  type?: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
  isFavorite?: boolean;
  localeId?: string;
  timeZoneId?: string;
  address?: PublicAddress;
  inviteLink?: string;
};

export type PublicSalonMaster = {
  id?: string;
  nickname?: string;
  logo?: string;
  position?: string;
};

export type PublicProcedureExecution = {
  id?: string;
  procedureId?: string;
  serviceId?: string;
  masterId?: string;
  masterName?: string;
  masterAvatar?: string;
  duration?: number;
  price?: number;
  currency?: string;
};

export type PublicSalonCatalogProcedure = {
  id?: string;
  title?: string;
  serviceTitle?: string;
  description?: string;
  minDuration?: number;
  minPrice?: PublicPrice;
  currency?: string;
  serviceId?: string;
  serviceTags?: Array<{ tag?: string; translate?: string }>;
  executions?: PublicProcedureExecution[];
  onlineBookingEnabled?: boolean;
  accessType?: string;
  postServiceBreakDuration?: number | null;
  archived?: boolean;
};

export type PublicComplexProcedureExecution = {
  id?: string;
  masterId?: string;
  masterName?: string;
  masterAvatar?: string;
  duration?: number;
  price?: number;
  currency?: string;
};

export type PublicSalonCatalogComplexProcedure = {
  id?: string;
  title?: string;
  serviceTitle?: string;
  description?: string;
  minDuration?: number;
  minPrice?: PublicPrice;
  currency?: string;
  serviceId?: string;
  serviceTags?: Array<{ tag?: string; translate?: string }>;
  executions?: PublicComplexProcedureExecution[];
};

export type PublicSalonCatalogComplex = {
  id?: string;
  title?: string;
  description?: string;
  priceShift?: {
    percent?: number;
  };
  procedures?: PublicSalonCatalogComplexProcedure[];
};

export type PublicSalonCatalog = {
  procedures?: PublicSalonCatalogProcedure[];
  complexes?: PublicSalonCatalogComplex[];
};

export type PublicDateInterval = {
  start: string;
  end: string;
};

export type PublicProcedureSlotsResponse = {
  intervals: PublicDateInterval[];
  timeZoneId: string;
};

export type PublicComplexSlotProcedure = {
  id: string;
  executorId: string;
  time: PublicDateInterval;
};

export type PublicComplexSlot = {
  total: PublicDateInterval;
  procedures: PublicComplexSlotProcedure[];
};

export type PublicComplexSlotsResponse = {
  slots: PublicComplexSlot[];
  timeZoneId: string;
};

export type PublicSearchProcedureBody = {
  id: string;
  executorId?: string;
};

export type PublicSearchComplexBody = {
  id: string;
  procedures: PublicSearchProcedureBody[];
};

export type PublicSearchSlotsResponse =
  | PublicProcedureSlotsResponse
  | PublicComplexSlotsResponse;

export type PublicBookingCreatePayload = {
  clientName: string;
  clientPhone: string;
  procedureId?: string;
  executorId?: string;
  complexId?: string;
  time: PublicDateInterval;
  trackingId?: string;
};

export type PublicBookingVisit = {
  appointmentId?: string;
  salonId?: string;
  procedureId?: string;
  time?: PublicDateInterval;
  timezoneId?: string;
  price?: PublicPrice;
  masterId?: string;
  masterNickname?: string;
  salonName?: string;
  salonLogo?: string;
  salonAddress?: string;
  procedureName?: string;
};

export type StoredPublicBookingContext = {
  linkId: string;
  salonId?: string | null;
  campaignId?: string | null;
  trackingId?: string | null;
  kind?: PublicLinkKind;
  savedAt: string;
};

type RequestOptions = {
  signal?: AbortSignal;
};

/** Путь ссылки в URL API: `b/nano` → `b/nano` как несколько сегментов пути. */
export function encodeLinkPathForApi(linkPath: string): string {
  return linkPath
    .split("/")
    .filter((s) => s.length > 0)
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
      ? Number((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4) * 1024
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
  { signal }: RequestOptions = {},
): Promise<PublicSalonProfile> {
  return clientApiRequest<PublicSalonProfile>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/profile`,
    method: "GET",
    signal,
  });
}

export async function getPublicSalonCatalog(
  salonId: string,
  { signal }: RequestOptions = {},
): Promise<PublicSalonCatalog> {
  return clientApiRequest<PublicSalonCatalog>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/catalog`,
    method: "GET",
    signal,
  });
}

export async function getPublicSalonMasters(
  salonId: string,
  { signal }: RequestOptions = {},
): Promise<PublicSalonMaster[]> {
  return clientApiRequest<PublicSalonMaster[]>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/masters`,
    method: "GET",
    signal,
  });
}

export async function searchPublicBookingSlots(
  params: {
    salonId: string;
    date: string;
    body: PublicSearchProcedureBody | PublicSearchComplexBody;
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
    signal,
  });
}

export async function createPublicBooking(
  salonId: string,
  payload: PublicBookingCreatePayload,
): Promise<PublicBookingVisit> {
  return clientApiRequest<PublicBookingVisit>({
    endpoint: `/api/public-booking/salon/${encodeURIComponent(salonId)}/bookings`,
    method: "POST",
    body: payload,
  });
}

export async function getPublicBooking(
  bookingId: string,
  { signal }: RequestOptions = {},
): Promise<PublicBookingVisit> {
  return clientApiRequest<PublicBookingVisit>({
    endpoint: `/api/public-booking/bookings/${encodeURIComponent(bookingId)}`,
    method: "GET",
    signal,
  });
}
