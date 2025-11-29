import { handleApiResponse } from './error-handler';

// Типы
export type Step = 'service' | 'master' | 'time' | 'details';

export type Procedure = {
  id: string;
  alias?: string;
  duration?: number;
  price?: {
    amount: number;
    currency: string;
  };
  serviceTitle?: string;
  serviceDescription?: string;
  masterId?: string | null;
  masterNickname?: string | null;
  masterAvatar?: string | null;
  parameters?: Array<{
    id: string;
    title: string;
    cases?: Array<{
      id: string;
      title: string;
      price?: {
        amount: number;
        currency: string;
      };
    }>;
  }>;
};

export type ProcedureGroup = {
  id: string;
  title: string;
  description?: string;
  currency?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  duration?: number | null;
  procedures: Procedure[];
};

export type ProceduresResponse = {
  procedures: Procedure[];
};

export type SlotInterval = {
  start: string;
  end: string;
};

export type SlotsResponse = {
  intervals: SlotInterval[];
  timeZoneId: string;
};

export type AppointmentResponse = {
  appointmentId?: string;
  salonId?: string;
  salonName?: string;
  salonIcon?: string;
  procedureId?: string;
  time?: SlotInterval;
  price?: {
    amount: number;
    currency: string;
  };
  masterId?: string | null;
  masterNickname?: string | null;
  appleWalletUrl?: string;
  googleWalletUrl?: string;
  walletLinks?: {
    apple?: string;
    google?: string;
  };
  wallet?: {
    apple?: string;
    google?: string;
  };
};

// Обратная совместимость - используем ApiError напрямую
export { ApiError as BookingApiError } from './error-handler';

export type CreateAppointmentPayload = {
  clientName: string;
  clientPhone: string;
  procedureId: string;
  time: {
    start: string;
    end: string;
  };
  trackingId?: string | null;
};

type FetchOptions = {
  salonId: string;
};

// Функции
export type GetSalonProceduresParams = FetchOptions & {
  locale: string;
  signal?: AbortSignal;
};

export async function getSalonProcedures({
  salonId,
  locale,
  signal,
}: GetSalonProceduresParams): Promise<ProceduresResponse> {
  const response = await fetch(
    `/api/booking/salon/${encodeURIComponent(salonId)}/procedures`,
    {
      method: 'GET',
      headers: {
        languages: locale,
      },
      cache: 'no-store',
      signal,
    },
  );

  return handleApiResponse<ProceduresResponse>(response);
}

export type SearchSalonSlotsParams = FetchOptions & {
  procedureId: string;
  daysAhead: number;
};

export async function searchSalonSlots({
  salonId,
  procedureId,
  daysAhead,
}: SearchSalonSlotsParams): Promise<SlotsResponse> {
  const response = await fetch(
    `/api/booking/salon/${encodeURIComponent(salonId)}/search-slots`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        procedureId,
        daysAhead,
      }),
      cache: 'no-store',
    },
  );

  return handleApiResponse<SlotsResponse>(response);
}

export type CreateSalonAppointmentParams = FetchOptions & {
  payload: CreateAppointmentPayload;
};

export async function createSalonAppointment({
  salonId,
  payload,
}: CreateSalonAppointmentParams): Promise<AppointmentResponse> {
  const response = await fetch(
    `/api/booking/salon/${encodeURIComponent(salonId)}/appointment`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
  );

  return handleApiResponse<AppointmentResponse>(response);
}

export type GetSalonAppointmentParams = FetchOptions & {
  appointmentId: string;
};

export async function getSalonAppointment({
  salonId,
  appointmentId,
}: GetSalonAppointmentParams): Promise<AppointmentResponse> {
  const response = await fetch(
    `/api/booking/salon/${encodeURIComponent(salonId)}/appointment/${encodeURIComponent(appointmentId)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  return handleApiResponse<AppointmentResponse>(response);
}

export type GetAppointmentParams = {
  appointmentId: string;
};

export async function getAppointment({
  appointmentId,
}: GetAppointmentParams): Promise<AppointmentResponse> {
  const response = await fetch(
    `/api/booking/appointment/${encodeURIComponent(appointmentId)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  return handleApiResponse<AppointmentResponse>(response);
}

export type GetWalletUrlParams = {
  appointmentId: string;
  type: 'apple' | 'google';
};

export async function getWalletUrl({
  appointmentId,
  type,
}: GetWalletUrlParams): Promise<{ url: string }> {
  const response = await fetch(
    `/api/wallet/${type}?id=${encodeURIComponent(appointmentId)}`,
    {
      method: 'GET',
      cache: 'no-store',
    },
  );

  return handleApiResponse<{ url: string }>(response);
}

// Обратная совместимость
export type GetAppleWalletUrlParams = {
  appointmentId: string;
};

export async function getAppleWalletUrl({
  appointmentId,
}: GetAppleWalletUrlParams): Promise<{ url: string }> {
  return getWalletUrl({ appointmentId, type: 'apple' });
}

export type GetGoogleWalletUrlParams = {
  appointmentId: string;
};

export async function getGoogleWalletUrl({
  appointmentId,
}: GetGoogleWalletUrlParams): Promise<{ url: string }> {
  return getWalletUrl({ appointmentId, type: 'google' });
}

