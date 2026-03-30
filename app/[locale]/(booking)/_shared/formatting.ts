import { ApiError } from "@/lib/api/error-handler";
import type { PublicSalonProfile } from "@/lib/api/public-booking";

export function formatCurrency(
  amount?: number | null,
  currency?: string | null,
  locale?: string,
) {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  try {
    return new Intl.NumberFormat(locale ?? "en", {
      currency,
      maximumFractionDigits: 2,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

export function formatDuration(minutes?: number | null, locale?: string) {
  if (!minutes) {
    return null;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const lowerLocale = locale?.toLowerCase() ?? "en";

  if (lowerLocale.startsWith("ru")) {
    if (hours && mins) return `${hours} ч ${mins} мин`;
    if (hours) return `${hours} ч`;
    return `${mins} мин`;
  }

  if (lowerLocale.startsWith("es")) {
    if (hours && mins) return `${hours} h ${mins} min`;
    if (hours) return `${hours} h`;
    return `${mins} min`;
  }

  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  return `${mins}m`;
}

export function getInitials(value?: string | null) {
  if (!value) return "M";

  const parts = value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);

  if (!parts.length) return "M";
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
}

export function formatAddress(
  address?: PublicSalonProfile["address"],
  options?: { includeCountry?: boolean },
) {
  if (!address) return null;

  const includeCountry = options?.includeCountry !== false;
  const parts = includeCountry
    ? [address.address, address.city, address.country]
    : [address.address, address.city];

  return parts.filter((part) => Boolean(part?.trim())).join(", ");
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 15);
  return digits ? `+${digits}` : "";
}

export function validatePhone(value: string) {
  return /^\+\d{10,15}$/.test(normalizePhone(value));
}

export function resolveApiMessage(
  error: unknown,
  fallbackMessage: string,
  apiMessageTemplate: (message: string) => string,
) {
  if (error instanceof ApiError && error.message) {
    return apiMessageTemplate(error.message);
  }

  if (error instanceof Error && error.message) {
    return apiMessageTemplate(error.message);
  }

  return fallbackMessage;
}
