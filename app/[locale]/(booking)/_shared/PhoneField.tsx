"use client";

import { useMemo, type ChangeEvent } from "react";

import type { CountryCode } from "libphonenumber-js";
import { getCountries, getExampleNumber } from "libphonenumber-js";
import examples from "libphonenumber-js/examples.mobile.json";
import { ChevronsUpDown } from "lucide-react";
import flags from "react-phone-number-input/flags";
import { Input, XStack } from "tamagui";

import {
  formatNationalPhoneInput,
  getNationalPhoneDisplay,
  getPhoneCountryCallingCode,
} from "./phone";

type PhoneFieldProps = {
  country?: CountryCode;
  fieldProps?: Record<string, unknown>;
  label: string;
  locale: string;
  minHeight: number;
  onBlur?: (country: CountryCode) => void;
  onChange: (value: string) => void;
  onCountryChange: (country: CountryCode) => void;
  placeholderFallback: string;
  value: string;
};

type CountryOption = {
  callingCode: string;
  code: CountryCode;
  label: string;
};

export function PhoneField({
  country,
  fieldProps,
  label,
  locale,
  minHeight,
  onBlur,
  onChange,
  onCountryChange,
  placeholderFallback,
  value,
}: PhoneFieldProps) {
  const countryOptions = useMemo<CountryOption[]>(() => {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });

    return getCountries().map((countryCode) => ({
      callingCode: getPhoneCountryCallingCode(countryCode) ?? "",
      code: countryCode,
      label: displayNames.of(countryCode) ?? countryCode,
    }));
  }, [locale]);

  const resolvedCountry =
    country ?? countryOptions[0]?.code ?? ("US" as CountryCode);
  const currentCountryOption =
    countryOptions.find((option) => option.code === resolvedCountry) ?? null;
  const Flag = flags[resolvedCountry];
  const nationalValue = useMemo(
    () => getNationalPhoneDisplay(value, resolvedCountry),
    [resolvedCountry, value],
  );
  const phonePlaceholder = useMemo(() => {
    const exampleNumber = getExampleNumber(resolvedCountry, examples);
    return exampleNumber?.formatNational() ?? placeholderFallback;
  }, [placeholderFallback, resolvedCountry]);

  const handleNationalChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(formatNationalPhoneInput(event.target.value, resolvedCountry));
  };

  return (
    <>
      <XStack
        alignItems="stretch"
        gap={0}
        minHeight={minHeight}
        paddingHorizontal="$3"
        width="100%"
      >
        <div className="booking-phone-country-picker">
          <div aria-hidden="true" className="booking-phone-country-display">
            {Flag ? (
              <span className="booking-phone-flag">
                <Flag title={currentCountryOption?.label ?? resolvedCountry} />
              </span>
            ) : (
              <span className="booking-phone-flag-fallback">
                {resolvedCountry}
              </span>
            )}
            <XStack alignItems="center" color="$textSecondary" flexShrink={0}>
              <ChevronsUpDown
                aria-hidden
                color="currentColor"
                size={14}
                strokeWidth={2.25}
              />
            </XStack>
            <span className="booking-phone-calling-code">
              {currentCountryOption?.callingCode ?? ""}
            </span>
          </div>

          <select
            aria-label={label}
            className="booking-phone-country-select"
            onChange={(event) => {
              onCountryChange(event.target.value as CountryCode);
            }}
            value={resolvedCountry}
          >
            {countryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label} {option.callingCode}
              </option>
            ))}
          </select>
        </div>

        <Input
          alignSelf="center"
          aria-label={label}
          autoComplete="tel-national"
          backgroundColor="transparent"
          borderRadius={0}
          className="booking-phone-number-input"
          color="$textPrimary"
          flex={1}
          fontSize={17}
          minHeight={minHeight}
          minWidth={0}
          padding={0}
          paddingHorizontal={0}
          paddingVertical={0}
          {...fieldProps}
          onBlur={() => {
            onBlur?.(resolvedCountry);
          }}
          onChange={handleNationalChange}
          placeholder={phonePlaceholder}
          placeholderTextColor="$textSecondary"
          value={nationalValue}
          width="100%"
        />
      </XStack>

      <style jsx>{`
        :global(.booking-phone-number-input) {
          padding-block: 0;
          padding-inline: 0;
        }

        .booking-phone-country-picker {
          align-self: stretch;
          flex: 0 0 auto;
          margin-right: 4px;
          position: relative;
          width: fit-content;
        }

        .booking-phone-country-display {
          align-items: center;
          display: flex;
          gap: 4px;
          height: 100%;
          pointer-events: none;
        }

        .booking-phone-country-select {
          appearance: none;
          background: transparent;
          border: 0;
          cursor: pointer;
          height: 100%;
          inset: 0;
          margin: 0;
          opacity: 0;
          position: absolute;
          width: 100%;
          z-index: 1;
        }

        .booking-phone-calling-code {
          display: none;
        }

        .booking-phone-flag,
        .booking-phone-flag-fallback {
          align-items: center;
          border-radius: 4px;
          display: flex;
          height: 28px;
          justify-content: center;
          overflow: hidden;
          width: 28px;
        }

        .booking-phone-flag :global(svg) {
          border-radius: 4px;
          display: block;
          height: 100%;
          object-fit: cover;
          width: 100%;
        }

        .booking-phone-flag-fallback {
          background: rgba(148, 163, 184, 0.24);
          color: rgba(15, 23, 42, 0.72);
          font-size: 10px;
          font-weight: 600;
        }
      `}</style>
    </>
  );
}
