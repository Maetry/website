import type { NumericFormatProps } from "react-number-format";

import { ApiError } from "@/lib/api/error-handler";
import type { PublicSalonProfile } from "@/lib/api/public-booking";

export type CurrencyValue = {
  amount: number;
  currency: string;
};

export function toCurrencyValue(
  amount?: number | null,
  currency?: string | null,
): CurrencyValue | null {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  return { amount, currency };
}

type CurrencyNumericFormatConfig = Pick<
  NumericFormatProps,
  | "decimalScale"
  | "decimalSeparator"
  | "displayType"
  | "fixedDecimalScale"
  | "prefix"
  | "suffix"
  | "thousandSeparator"
  | "value"
>;

function formatNumberWithSeparators(
  value: number,
  thousandSeparator: string | undefined,
  decimalSeparator: string,
  decimalScale: number,
  fixedDecimalScale: boolean,
) {
  const normalized = fixedDecimalScale
    ? value.toFixed(decimalScale)
    : String(value);
  const [integerPart, fractionPart = ""] = normalized.split(".");
  const groupedInteger = thousandSeparator
    ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
    : integerPart;

  if (!fractionPart && decimalScale === 0) {
    return groupedInteger;
  }

  const fraction = fixedDecimalScale
    ? fractionPart.padEnd(decimalScale, "0").slice(0, decimalScale)
    : fractionPart;

  return fraction
    ? `${groupedInteger}${decimalSeparator}${fraction}`
    : groupedInteger;
}

export function getCurrencyNumericFormatProps(
  amount?: number | null,
  currency?: string | null,
  locale?: string,
): CurrencyNumericFormatConfig | null {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  try {
    const hasFraction = Math.abs(amount % 1) > Number.EPSILON;
    const formatter = new Intl.NumberFormat(locale ?? "en", {
      currency,
      maximumFractionDigits: 2,
      minimumFractionDigits: hasFraction ? 2 : 0,
      style: "currency",
    });
    const parts = formatter.formatToParts(Math.abs(amount));
    const numericStart = parts.findIndex(
      (part) =>
        part.type === "integer" ||
        part.type === "fraction" ||
        part.type === "decimal",
    );

    let prefix = amount < 0 ? "-" : "";
    let suffix = "";
    let thousandSeparator: string | undefined;
    let decimalSeparator = ".";

    parts.forEach((part, index) => {
      if (part.type === "currency") {
        if (numericStart === -1 || index < numericStart) {
          prefix += part.value;
        } else {
          suffix += part.value;
        }
        return;
      }

      if (part.type === "group") {
        thousandSeparator = part.value;
        return;
      }

      if (part.type === "decimal") {
        decimalSeparator = part.value;
      }
    });

    return {
      decimalScale: hasFraction ? 2 : 0,
      decimalSeparator,
      displayType: "text",
      fixedDecimalScale: hasFraction,
      prefix,
      suffix,
      thousandSeparator,
      value: Math.abs(amount),
    };
  } catch {
    return {
      decimalScale: 0,
      displayType: "text",
      prefix: `${amount} `,
      suffix: ` ${currency}`,
      value: Math.abs(amount),
    };
  }
}

export function formatCurrency(
  amount?: number | null,
  currency?: string | null,
  locale?: string,
) {
  const formatProps = getCurrencyNumericFormatProps(amount, currency, locale);
  if (!formatProps) {
    return null;
  }

  const number = formatNumberWithSeparators(
    formatProps.value as number,
    typeof formatProps.thousandSeparator === "string"
      ? formatProps.thousandSeparator
      : undefined,
    formatProps.decimalSeparator ?? ".",
    formatProps.decimalScale ?? 0,
    Boolean(formatProps.fixedDecimalScale),
  );

  return `${formatProps.prefix ?? ""}${number}${formatProps.suffix ?? ""}`;
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

  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

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
  const sanitizeMessage = (message: string | undefined) => {
    const trimmed = message?.trim();
    if (!trimmed) {
      return null;
    }

    const normalized = trimmed.toLowerCase();
    if (
      normalized === "maetry api request failed" ||
      normalized === "api request failed" ||
      normalized === "failed to fetch" ||
      normalized === "internal server error" ||
      normalized === "unknown error"
    ) {
      return null;
    }

    return trimmed;
  };

  if (error instanceof ApiError) {
    const message = sanitizeMessage(error.message);
    if (message) {
      return apiMessageTemplate(message);
    }
  }

  if (error instanceof Error) {
    const message = sanitizeMessage(error.message);
    if (message) {
      return apiMessageTemplate(message);
    }
  }

  return fallbackMessage;
}
