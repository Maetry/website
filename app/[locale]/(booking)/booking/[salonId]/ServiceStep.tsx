"use client";

import { useTranslations } from "next-intl";
import { Spinner, YStack } from "tamagui";

import type { ProcedureGroup, Step } from "@/lib/public-booking-screen";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingRowMeta } from "../../_shared/BookingRowMeta";
import { BookingSection } from "../../_shared/BookingSection";
import { BookingState } from "../../_shared/BookingState";
import { formatCurrency, formatDuration } from "../../_shared/formatting";
import { SectionSeparator } from "../../_shared/SectionSeparator";

type ServiceStepProps = {
  currentVisualStep: Step;
  locale: string;
  onDeselectGroup: () => void;
  onSelectGroup: (group: ProcedureGroup) => void;
  platform: BookingPlatformVariant;
  procedureGroups: ProcedureGroup[];
  proceduresError: string | null;
  proceduresLoading: boolean;
  selectedGroup: ProcedureGroup | null;
};

export function ServiceStep({
  currentVisualStep,
  locale,
  onDeselectGroup,
  onSelectGroup,
  platform,
  procedureGroups,
  proceduresError,
  proceduresLoading,
  selectedGroup,
}: ServiceStepProps) {
  const t = useTranslations("booking");

  if (proceduresLoading) {
    return (
      <BookingState
        action={<Spinner />}
        description={t("subtitle")}
        platform={platform}
        title={t("loading.procedures")}
      />
    );
  }

  if (proceduresError) {
    return (
      <BookingState
        description={proceduresError}
        platform={platform}
        title={t("errors.loadProcedures")}
      />
    );
  }

  if (!procedureGroups.length) {
    return (
      <BookingState
        description={t("serviceEmptyHint")}
        platform={platform}
        title={t("serviceEmptyTitle")}
      />
    );
  }

  const renderServiceGroupRow = (
    group: ProcedureGroup,
    index: number,
    arrayLength: number,
  ) => {
    const groupPriceValue = formatCurrency(group.minPrice, group.currency, locale);
    const priceLabel =
      group.minPrice !== null &&
      group.maxPrice !== null &&
      group.minPrice !== group.maxPrice &&
      groupPriceValue
        ? t("serviceValueFrom", { value: groupPriceValue })
        : groupPriceValue;
    const durationValues = new Set(
      group.procedures
        .map((procedure) => procedure.duration)
        .filter((duration): duration is number => typeof duration === "number"),
    );
    const groupDurationValue = formatDuration(group.duration, locale);
    const durationLabel =
      durationValues.size > 1 && groupDurationValue
        ? t("serviceValueFrom", { value: groupDurationValue })
        : groupDurationValue;
    const specialistCount = group.procedures.length;
    const specialistsSubtitle =
      specialistCount > 1
        ? t("serviceSpecialistsCount", { count: specialistCount })
        : undefined;

    return (
      <YStack key={group.id}>
        <BookingRow
          indicator={
            <BookingRowMeta
              duration={durationLabel}
              platform={platform}
              price={priceLabel}
            />
          }
          onPress={() => onSelectGroup(group)}
          platform={platform}
          subtitle={specialistsSubtitle}
          title={group.title}
        />
        {index < arrayLength - 1 ? (
          <SectionSeparator platform={platform} />
        ) : null}
      </YStack>
    );
  };

  if (selectedGroup && currentVisualStep !== "service") {
    return (
      <BookingSection platform={platform} title={t("serviceTitle")}>
        <BookingRow
          ctaLabel={t("changeSelectionShort")}
          onPress={onDeselectGroup}
          platform={platform}
          subtitle={selectedGroup.description ?? undefined}
          title={selectedGroup.title}
        />
      </BookingSection>
    );
  }

  return (
    <BookingSection platform={platform} title={t("serviceTitle")}>
      {procedureGroups.map((group, index) =>
        renderServiceGroupRow(group, index, procedureGroups.length),
      )}
    </BookingSection>
  );
}
