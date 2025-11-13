export type Step = 'service' | 'master' | 'time' | 'details' | 'success';

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
