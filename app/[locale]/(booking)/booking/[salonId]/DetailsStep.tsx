"use client";

import type { ChangeEvent, Dispatch, FormEvent, SetStateAction } from "react";

import { useTranslations } from "next-intl";
import { Input, Spinner, Text, XStack, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingSection } from "../../_shared/BookingSection";
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
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
};

function DetailsNamePhoneFields({
  clientName,
  clientPhone,
  formErrors,
  platform,
  setClientName,
  setClientPhone,
  setFormErrors,
  t,
}: {
  clientName: string;
  clientPhone: string;
  formErrors: { name?: string; phone?: string };
  platform: BookingPlatformVariant;
  setClientName: Dispatch<SetStateAction<string>>;
  setClientPhone: Dispatch<SetStateAction<string>>;
  setFormErrors: Dispatch<SetStateAction<{ name?: string; phone?: string }>>;
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
        <Input
          aria-label={t("fieldPhoneLabel")}
          autoComplete="tel"
          backgroundColor="$chromeBackground"
          borderRadius={0}
          color="$textPrimary"
          fontSize={17}
          inputMode="tel"
          minHeight={surface.details.inputMinHeight}
          {...bookingDetailsFieldProps}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            setClientPhone(event.target.value);
            if (formErrors.phone) {
              setFormErrors((current) => ({
                ...current,
                phone: undefined,
              }));
            }
          }}
          placeholder={t("fieldPhonePlaceholder")}
          placeholderTextColor="$textSecondary"
          value={clientPhone}
          width="100%"
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
  setClientName,
  setClientPhone,
  setFormErrors,
}: DetailsStepProps) {
  const t = useTranslations("booking");
  const surface = getBookingSurfaceStyle(platform);
  const footerMessage =
    formErrors.name || formErrors.phone || globalError || t("fieldPhoneHelper");
  const hasFooterError = Boolean(
    formErrors.name || formErrors.phone || globalError,
  );

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
            platform={platform}
            setClientName={setClientName}
            setClientPhone={setClientPhone}
            setFormErrors={setFormErrors}
            t={t}
          />
        </BookingSection>

        <YStack gap="$2">
          <PrimaryAction
            disabled={!isFormValid || isSubmitting}
            platform={platform}
            type="submit"
            width="100%"
          >
            <XStack alignItems="center" gap="$2">
              {isSubmitting ? <Spinner /> : null}
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
    </form>
  );
}
