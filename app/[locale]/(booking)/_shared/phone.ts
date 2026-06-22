import {
  AsYouType,
  getCountries,
  getCountryCallingCode,
  isSupportedCountry,
  parsePhoneNumberFromString,
  type CountryCode,
} from "libphonenumber-js";

const COUNTRY_ALIASES: Partial<Record<string, CountryCode>> = {
  "czech republic": "CZ",
  england: "GB",
  "great britain": "GB",
  holland: "NL",
  korea: "KR",
  russia: "RU",
  scotland: "GB",
  uae: "AE",
  uk: "GB",
  usa: "US",
};

const SUPPORTED_COUNTRIES = getCountries();

function normalizeCountryToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .replace(/\s+/g, " ");
}

function getCountryFromLocale(locale?: string | null): CountryCode | undefined {
  if (!locale) {
    return undefined;
  }

  try {
    const region = new Intl.Locale(locale.replace(/_/g, "-")).maximize().region;
    if (region && isSupportedCountry(region)) {
      return region;
    }
  } catch {
    // Ignore malformed locale values.
  }

  const region = locale
    .replace(/_/g, "-")
    .split("-")
    .find((part) => /^[a-z]{2}$/i.test(part));

  if (!region) {
    return undefined;
  }

  const normalizedRegion = region.toUpperCase();
  return isSupportedCountry(normalizedRegion) ? normalizedRegion : undefined;
}

function getCountryFromName(
  countryName?: string | null,
  localeCandidates: Array<string | null | undefined> = [],
): CountryCode | undefined {
  if (!countryName?.trim()) {
    return undefined;
  }

  const upperCountry = countryName.trim().toUpperCase();
  if (upperCountry.length === 2 && isSupportedCountry(upperCountry)) {
    return upperCountry;
  }

  const normalizedCountry = normalizeCountryToken(countryName);
  const alias = COUNTRY_ALIASES[normalizedCountry];
  if (alias) {
    return alias;
  }

  const localesToTry = Array.from(
    new Set(
      localeCandidates
        .flatMap((locale) => {
          if (!locale) {
            return [];
          }

          const normalizedLocale = locale.replace(/_/g, "-");
          return [normalizedLocale, normalizedLocale.split("-")[0]];
        })
        .concat(["en", "es", "ru"]),
    ),
  );

  for (const locale of localesToTry) {
    try {
      const displayNames = new Intl.DisplayNames([locale], { type: "region" });

      for (const countryCode of SUPPORTED_COUNTRIES) {
        const localizedName = displayNames.of(countryCode);
        if (!localizedName) {
          continue;
        }

        if (normalizeCountryToken(localizedName) === normalizedCountry) {
          return countryCode;
        }
      }
    } catch {
      // Ignore unsupported locale identifiers.
    }
  }

  return undefined;
}

export function resolvePhoneCountry(options: {
  locale?: string | null;
  salonCountry?: string | null;
  salonLocale?: string | null;
}): CountryCode | undefined {
  return (
    getCountryFromName(options.salonCountry, [
      options.salonLocale,
      options.locale,
    ]) ??
    getCountryFromLocale(options.salonLocale) ??
    getCountryFromLocale(options.locale)
  );
}

export function getPhoneCountryFromValue(
  value?: string | null,
): CountryCode | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  return parsePhoneNumberFromString(value, { extract: false })?.country;
}

export function getPhoneCountryCallingCode(country?: CountryCode | null) {
  if (!country) {
    return null;
  }

  return `+${getCountryCallingCode(country)}`;
}

export function getNationalPhoneDisplay(
  value: string,
  country: CountryCode,
) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = parsePhoneNumberFromString(trimmed, {
    defaultCountry: country,
    extract: false,
  });

  if (parsed) {
    return parsed.formatNational();
  }

  return new AsYouType(country).input(trimmed);
}

export function formatNationalPhoneInput(
  value: string,
  country: CountryCode,
) {
  return new AsYouType(country).input(value);
}

export function normalizePhoneToE164(
  value: string,
  defaultCountry?: CountryCode,
) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const parsed = parsePhoneNumberFromString(
    trimmed,
    defaultCountry
      ? { defaultCountry, extract: false }
      : { extract: false },
  );

  return parsed?.number ?? "";
}

export function validatePhoneForCountry(
  value: string,
  selectedCountry?: CountryCode,
) {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  const parsed = parsePhoneNumberFromString(
    trimmed,
    selectedCountry
      ? { defaultCountry: selectedCountry, extract: false }
      : { extract: false },
  );

  if (!parsed?.isValid()) {
    return false;
  }

  return !selectedCountry || parsed.country === selectedCountry;
}
