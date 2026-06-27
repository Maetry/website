"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import type { CountryCode } from "libphonenumber-js";
import { useLocale, useTranslations } from "next-intl";
import { Input, Text, XStack, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingSection } from "../../_shared/BookingSection";
import { validatePhoneForCountry } from "../../_shared/phone";
import { PhoneField } from "../../_shared/PhoneField";
import { PrimaryAction } from "../../_shared/primitives";
import { SectionSeparator } from "../../_shared/SectionSeparator";

/** Без видимой рамки при hover/focus — только разделители между полями. */
const bookingDetailsFieldProps = {
  borderColor: "transparent" as const,
  focusStyle: {
    borderColor: "transparent",
    outlineStyle: "none",
    outlineWidth: 0,
  },
  focusVisibleStyle: {
    borderColor: "transparent",
    outlineStyle: "none",
    outlineWidth: 0,
  },
  hoverStyle: {
    borderColor: "transparent",
  },
};

type DetailsStepProps = {
  clientName: string;
  clientPhone: string;
  formErrors: { name?: string; phone?: string };
  globalError: string | null;
  isFormValid: boolean;
  isSubmitting: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  platform: BookingPlatformVariant;
  selectedPhoneCountry?: CountryCode;
  submitErrorNonce: number;
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
  setSelectedPhoneCountry: Dispatch<SetStateAction<CountryCode | undefined>>;
};

function DetailsNamePhoneFields({
  clientName,
  clientPhone,
  formErrors,
  locale,
  platform,
  selectedPhoneCountry,
  setClientName,
  setClientPhone,
  setFormErrors,
  setSelectedPhoneCountry,
  t,
}: {
  clientName: string;
  clientPhone: string;
  formErrors: { name?: string; phone?: string };
  locale: string;
  platform: BookingPlatformVariant;
  selectedPhoneCountry?: CountryCode;
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
  setSelectedPhoneCountry: Dispatch<SetStateAction<CountryCode | undefined>>;
  t: (key: string) => string;
}) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <YStack gap={0} width="100%">
      <YStack paddingHorizontal={0} paddingVertical={0} width="100%">
        <Input
          aria-label={t("fieldNameLabel")}
          autoComplete="name"
          backgroundColor="$chromeBackground"
          borderRadius={0}
          color="$textPrimary"
          fontSize={17}
          minHeight={surface.details.inputMinHeight}
          {...bookingDetailsFieldProps}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setClientName(event.target.value);
            if (formErrors.name) {
              setFormErrors((current) => ({
                ...current,
                name: undefined,
              }));
            }
          }}
          placeholder={t("fieldNamePlaceholder")}
          placeholderTextColor="$textSecondary"
          value={clientName}
          width="100%"
        />
      </YStack>

      <SectionSeparator marginTop={0} platform={platform} variant="form" />

      <YStack paddingHorizontal={0} paddingVertical={0} width="100%">
        <PhoneField
          country={selectedPhoneCountry}
          fieldProps={bookingDetailsFieldProps}
          label={t("fieldPhoneLabel")}
          locale={locale}
          minHeight={surface.details.inputMinHeight}
          onBlur={(country) => {
            if (
              clientPhone &&
              !validatePhoneForCountry(clientPhone, country)
            ) {
              setFormErrors((current) => ({
                ...current,
                phone: t("errors.validationPhone"),
              }));
            }
          }}
          onChange={(value) => {
            setClientPhone(value);
            if (formErrors.phone) {
              setFormErrors((current) => ({
                ...current,
                phone: undefined,
              }));
            }
          }}
          onCountryChange={(nextCountry) => {
            setSelectedPhoneCountry(nextCountry);
            if (formErrors.phone) {
              setFormErrors((current) => ({
                ...current,
                phone: undefined,
              }));
            }
          }}
          placeholderFallback={t("fieldPhonePlaceholder")}
          value={clientPhone}
        />
      </YStack>
    </YStack>
  );
}

export function DetailsStep({
  clientName,
  clientPhone,
  formErrors,
  globalError,
  isFormValid,
  isSubmitting,
  onSubmit,
  platform,
  selectedPhoneCountry,
  submitErrorNonce,
  setClientName,
  setClientPhone,
  setFormErrors,
  setSelectedPhoneCountry,
}: DetailsStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale();
  const surface = getBookingSurfaceStyle(platform);
  const [isShaking, setIsShaking] = useState(false);
  const footerMessage =
    formErrors.name || formErrors.phone || globalError || t("fieldPhoneHelper");
  const hasFooterError = Boolean(
    formErrors.name || formErrors.phone || globalError,
  );

  useEffect(() => {
    if (submitErrorNonce === 0) {
      return;
    }

    setIsShaking(true);
    const timeoutId = window.setTimeout(() => {
      setIsShaking(false);
    }, 420);

    return () => window.clearTimeout(timeoutId);
  }, [submitErrorNonce]);

  return (
    <form onSubmit={onSubmit}>
      <YStack gap="$4">
        <BookingSection
          footer={
            <Text
              color={hasFooterError ? "$danger" : "$textSecondary"}
              fontSize={surface.details.helperFontSize}
              lineHeight={surface.details.helperLineHeight}
              userSelect="text"
            >
              {footerMessage}
            </Text>
          }
          platform={platform}
          title={t("detailsTitle")}
        >
          <DetailsNamePhoneFields
            clientName={clientName}
            clientPhone={clientPhone}
            formErrors={formErrors}
            locale={locale}
            platform={platform}
            selectedPhoneCountry={selectedPhoneCountry}
            setClientName={setClientName}
            setClientPhone={setClientPhone}
            setFormErrors={setFormErrors}
            setSelectedPhoneCountry={setSelectedPhoneCountry}
            t={t}
          />
        </BookingSection>

        <YStack gap="$2">
          <YStack
            style={{
              animation: isShaking
                ? "booking-submit-shake 420ms ease-in-out"
                : undefined,
            }}
          >
            <PrimaryAction
              disabled={!isFormValid || isSubmitting}
              platform={platform}
              type="submit"
              width="100%"
            >
              <XStack alignItems="center" gap="$2">
                {isSubmitting ? (
                  <span aria-hidden="true" className="booking-submit-spinner" />
                ) : null}
                <Text
                  color="white"
                  fontSize={surface.action.textFontSize}
                  fontWeight="600"
                  lineHeight={surface.action.textLineHeight}
                >
                  {isSubmitting ? t("loading.submit") : t("submitLabel")}
                </Text>
              </XStack>
            </PrimaryAction>
          </YStack>
        </YStack>
      </YStack>
      <style jsx>{`
        @keyframes booking-submit-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes booking-submit-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-8px);
          }
          40% {
            transform: translateX(7px);
          }
          60% {
            transform: translateX(-5px);
          }
          80% {
            transform: translateX(3px);
          }
        }

        .booking-submit-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: white;
          border-radius: 999px;
          animation: booking-submit-spin 0.8s linear infinite;
          flex: 0 0 auto;
        }
      `}</style>
    </form>
  );
}
