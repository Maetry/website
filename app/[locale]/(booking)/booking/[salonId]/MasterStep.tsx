"use client";

import { useTranslations } from "next-intl";
import { Avatar, Text, YStack } from "tamagui";

import type { Procedure, ProcedureGroup, Step } from "@/lib/public-booking-screen";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingRowMeta } from "../../_shared/BookingRowMeta";
import { BookingSection } from "../../_shared/BookingSection";
import {
  formatCurrency,
  formatDuration,
  getInitials,
} from "../../_shared/formatting";
import { BOOKING_MASTER_AVATAR_PX } from "../../_shared/primitives";
import { SectionSeparator } from "../../_shared/SectionSeparator";

import { getProcedureSelectionKey } from "./date-utils";

type MasterStepProps = {
  currentVisualStep: Step;
  locale: string;
  onDeselectProcedure: () => void;
  onSelectProcedure: (procedure: Procedure) => void;
  platform: BookingPlatformVariant;
  selectedGroup: ProcedureGroup | null;
  selectedProcedure: Procedure | null;
};

export function MasterStep({
  currentVisualStep,
  locale,
  onDeselectProcedure,
  onSelectProcedure,
  platform,
  selectedGroup,
  selectedProcedure,
}: MasterStepProps) {
  const t = useTranslations("booking");

  if (!selectedGroup) return null;

  if (selectedProcedure && currentVisualStep !== "master") {
    return (
      <BookingSection
       
        platform={platform}
        title={t("masterTitle")}
      >
        <BookingRow
          ctaLabel={t("changeSelectionShort")}
          onPress={onDeselectProcedure}
          platform={platform}
          subtitle={
            selectedProcedure.masterPosition?.trim()
              ? selectedProcedure.masterPosition.trim()
              : undefined
          }
          title={
            selectedProcedure.masterNickname ??
            selectedProcedure.alias ??
            t("masterAny")
          }
        />
      </BookingSection>
    );
  }

  return (
    <BookingSection platform={platform} title={t("masterTitle")}>
      {selectedGroup.procedures.map((procedure) => {
        const priceLabel = formatCurrency(
          procedure.price?.amount ?? selectedGroup.minPrice,
          procedure.price?.currency ?? selectedGroup.currency,
          locale,
        );
        const durationLabel = formatDuration(procedure.duration, locale);
        const subtitle =
          procedure.alias && procedure.alias !== procedure.masterNickname
            ? procedure.alias
            : t("steps.master");

        return (
          <YStack key={getProcedureSelectionKey(procedure)}>
            <BookingRow
              before={
                <Avatar circular size={BOOKING_MASTER_AVATAR_PX}>
                  <Avatar.Image
                    src={procedure.masterAvatar ?? undefined}
                  />
                  <Avatar.Fallback
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize={14} fontWeight="700" lineHeight={16}>
                      {getInitials(
                        procedure.masterNickname ??
                          procedure.alias ??
                          t("steps.master"),
                      )}
                    </Text>
                  </Avatar.Fallback>
                </Avatar>
              }
              indicator={
                <BookingRowMeta
                  duration={durationLabel}
                  platform={platform}
                  price={priceLabel}
                />
              }
              onPress={() => onSelectProcedure(procedure)}
              platform={platform}
              subtitle={subtitle}
              title={
                procedure.masterNickname ??
                procedure.alias ??
                t("masterAny")
              }
            />
            <SectionSeparator platform={platform} variant="withAvatar" />
          </YStack>
        );
      })}
    </BookingSection>
  );
}
