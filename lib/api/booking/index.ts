import type { PublicTracking } from '@/lib/tracking/useTracking';

import type {
  AppointmentResponse,
  ProceduresResponse,
  SlotsResponse,
} from './types';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BOOKING_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8080';

const buildBookingUrl = (path: string) => {
  const base = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${base}${normalizedPath}`;
};

const extractErrorMessage = async (response: Response) => {
  try {
    const data = (await response.json()) as { message?: string; error?: string };
    return data?.message ?? data?.error ?? undefined;
  } catch {
    return undefined;
  }
};

export class BookingApiError extends Error {
  status: number;

  constructor(status: number, message?: string) {
    super(message ?? 'Booking API request failed');
    this.name = 'BookingApiError';
    this.status = status;
  }
}

export type CreateAppointmentPayload = {
  clientName: string;
  clientPhone: string;
  procedureId: string;
  time: {
    start: string;
    end: string;
  };
  tracking?: PublicTracking;
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
  const response = await fetch(
    buildBookingUrl(`/public/booking/salon/${salonId}/procedures`),
    {
      method: 'GET',
      headers: {
        languages: locale,
      },
      cache: 'no-store',
      signal,
    },
  );

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new BookingApiError(response.status, message);
  }

  return (await response.json()) as ProceduresResponse;
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
  const response = await fetch(buildBookingUrl(`/public/booking/salon/${salonId}/search-slots`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      procedureId,
      daysAhead,
    }),
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new BookingApiError(response.status, message);
  }

  return (await response.json()) as SlotsResponse;
}

export type CreateSalonAppointmentParams = FetchOptions & {
  payload: CreateAppointmentPayload;
};

export async function createSalonAppointment({
  salonId,
  payload,
}: CreateSalonAppointmentParams): Promise<AppointmentResponse> {
  const response = await fetch(
    buildBookingUrl(`/public/booking/salon/${salonId}/appointment`),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    },
  );

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new BookingApiError(response.status, message);
  }

  return (await response.json()) as AppointmentResponse;
}

export * from './types';

