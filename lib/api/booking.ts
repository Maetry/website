"use client";

import { clientApiRequest } from "./client";
import { getOrCreateDeviceId } from "./device-id";

export type Step = "service" | "master" | "time" | "details";

export type Procedure = {
  alias?: string;
  duration?: number;
  id: string;
  masterAvatar?: string | null;
  masterId?: string | null;
  masterNickname?: string | null;
  parameters?: Array<{
    cases?: Array<{
      id: string;
      price?: {
        amount: number;
        currency: string;
      };
      title: string;
    }>;
    id: string;
    title: string;
  }>;
  price?: {
    amount: number;
    currency: string;
  };
  serviceDescription?: string;
  serviceTitle?: string;
};

export type ProcedureGroup = {
  currency?: string | null;
  description?: string;
  duration?: number | null;
  id: string;
  maxPrice?: number | null;
  minPrice?: number | null;
  procedures: Procedure[];
  title: string;
};

export type ProceduresResponse = {
  procedures: Procedure[];
};

export type SlotInterval = {
  end: string;
  start: string;
};

export type SlotsResponse = {
  intervals: SlotInterval[];
  timeZoneId: string;
};

export type AppointmentResponse = {
  appointmentId?: string;
  appleWalletUrl?: string;
  googleWalletUrl?: string;
  masterId?: string | null;
  masterNickname?: string | null;
  price?: {
    amount: number;
    currency: string;
  };
  procedureId?: string;
  salonIcon?: string;
  salonId?: string;
  salonName?: string;
  time?: SlotInterval;
  wallet?: {
    apple?: string;
    google?: string;
  };
  walletLinks?: {
    apple?: string;
    google?: string;
  };
};

export { ApiError as BookingApiError } from "./error-handler";

export type CreateAppointmentPayload = {
  clientName: string;
  clientPhone: string;
  executorId?: string | null;
  procedureId: string;
  time: {
    end: string;
    start: string;
  };
  trackingId?: string | null;
};

type FetchOptions = {
  salonId: string;
};

export type GetSalonProceduresParams = FetchOptions & {
  locale: string;
  signal?: AbortSignal;
};

export async function getSalonProcedures({
  salonId,
  locale,
  signal,
}: GetSalonProceduresParams): Promise<ProceduresResponse> {
  return clientApiRequest<ProceduresResponse>({
    endpoint: `/api/booking/salon/${encodeURIComponent(salonId)}/procedures`,
    headers: {
      languages: locale,
    },
    method: "GET",
    signal,
  });
}

export type SearchSalonSlotsParams = FetchOptions & {
  date: string;
  executorId?: string | null;
  procedureId: string;
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

export async function searchSalonSlots({
  salonId,
  procedureId,
  executorId,
  date,
}: SearchSalonSlotsParams): Promise<SlotsResponse> {
  return clientApiRequest<SlotsResponse>({
    body: {
      date,
      executorId,
      procedureId,
    },
    endpoint: `/api/booking/salon/${encodeURIComponent(salonId)}/search-slots`,
    headers: buildDeviceIdHeader(),
    method: "POST",
  });
}

export type CreateSalonAppointmentParams = FetchOptions & {
  payload: CreateAppointmentPayload;
};

export async function createSalonAppointment({
  salonId,
  payload,
}: CreateSalonAppointmentParams): Promise<AppointmentResponse> {
  return clientApiRequest<AppointmentResponse>({
    body: payload,
    endpoint: `/api/booking/salon/${encodeURIComponent(salonId)}/appointment`,
    method: "POST",
  });
}

export type GetSalonAppointmentParams = FetchOptions & {
  appointmentId: string;
};

export async function getSalonAppointment({
  salonId,
  appointmentId,
}: GetSalonAppointmentParams): Promise<AppointmentResponse> {
  return clientApiRequest<AppointmentResponse>({
    endpoint: `/api/booking/salon/${encodeURIComponent(salonId)}/appointment/${encodeURIComponent(appointmentId)}`,
    method: "GET",
  });
}

export type GetAppointmentParams = {
  appointmentId: string;
};

export async function getAppointment({
  appointmentId,
}: GetAppointmentParams): Promise<AppointmentResponse> {
  return clientApiRequest<AppointmentResponse>({
    endpoint: `/api/booking/appointment/${encodeURIComponent(appointmentId)}`,
    method: "GET",
  });
}

export type GetWalletUrlParams = {
  appointmentId: string;
  type: "apple" | "google";
};

export async function getWalletUrl({
  appointmentId,
  type,
}: GetWalletUrlParams): Promise<{ url: string }> {
  return clientApiRequest<{ url: string }>({
    endpoint: `/api/wallet/${type}?id=${encodeURIComponent(appointmentId)}`,
    method: "GET",
  });
}

export type GetAppleWalletUrlParams = {
  appointmentId: string;
};

export async function getAppleWalletUrl({
  appointmentId,
}: GetAppleWalletUrlParams): Promise<{ url: string }> {
  return getWalletUrl({ appointmentId, type: "apple" });
}

export type GetGoogleWalletUrlParams = {
  appointmentId: string;
};

export async function getGoogleWalletUrl({
  appointmentId,
}: GetGoogleWalletUrlParams): Promise<{ url: string }> {
  return getWalletUrl({ appointmentId, type: "google" });
}
