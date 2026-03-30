"use client";

import type { ReactNode } from "react";

import { useTranslations } from "next-intl";
import { Button, Spinner, Text, XStack, YStack } from "tamagui";

import type { Procedure, ProcedureGroup, Step } from "@/lib/public-booking-screen";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingRowMeta } from "../../_shared/BookingRowMeta";
import { BookingSection } from "../../_shared/BookingSection";
import { BookingState } from "../../_shared/BookingState";
import { formatCurrency, formatDuration } from "../../_shared/formatting";
import { SectionSeparator } from "../../_shared/SectionSeparator";

import type { ProcedureCategoryGroup } from "./useBookingFlow";

function ProcedureCategoryBlock({
  category,
  expandedCategoryId,
  onExpandCategory,
  platform,
  renderGroupRow,
}: {
  category: ProcedureCategoryGroup;
  expandedCategoryId: string | null;
  onExpandCategory: (id: string | null) => void;
  platform: BookingPlatformVariant;
  renderGroupRow: (
    group: ProcedureGroup,
    index: number,
    arrayLength: number,
  ) => ReactNode;
}) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <YStack
      backgroundColor="$bookingCategoryShell"
      borderRadius={surface.section.cardRadius}
      overflow="hidden"
    >
      <Button
        backgroundColor="$bookingCategoryShell"
        borderRadius={surface.section.cardRadius}
        chromeless
        onPress={() =>
          onExpandCategory(expandedCategoryId === category.id ? null : category.id)
        }
        paddingHorizontal="$4"
        paddingVertical="$3"
      >
        <XStack
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Text color="$textPrimary" fontSize="$5" fontWeight="600">
            {category.title}
          </Text>
          <Text color="$textSecondary" fontSize="$4">
            {expandedCategoryId === category.id ? "−" : "+"}
          </Text>
        </XStack>
      </Button>

      {expandedCategoryId === category.id ? (
        <YStack backgroundColor="$bookingCategoryExpanded" overflow="hidden">
          {category.groups.map((group, index) =>
            renderGroupRow(group, index, category.groups.length),
          )}
        </YStack>
      ) : null}
    </YStack>
  );
}

type ServiceStepProps = {
  currentVisualStep: Step;
  expandedCategoryId: string | null;
  locale: string;
  onDeselectGroup: () => void;
  onExpandCategory: (id: string | null) => void;
  onSelectGroup: (group: ProcedureGroup) => void;
  platform: BookingPlatformVariant;
  procedureCategories: ProcedureCategoryGroup[];
  procedureGroups: ProcedureGroup[];
  proceduresError: string | null;
  proceduresLoading: boolean;
  selectedGroup: ProcedureGroup | null;
  selectedProcedure: Procedure | null;
};

export function ServiceStep({
  currentVisualStep,
  expandedCategoryId,
  locale,
  onDeselectGroup,
  onExpandCategory,
  onSelectGroup,
  platform,
  procedureCategories,
  procedureGroups,
  proceduresError,
  proceduresLoading,
  selectedGroup,
  selectedProcedure,
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

  const shouldUseCategories =
    procedureCategories.length > 1 &&
    procedureCategories.some((category) => category.title !== "Services");

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
    const specialistsSubtitle = t("serviceSpecialistsCount", {
      count: group.procedures.length,
    });

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

  const selectedGroupCategoryTag = selectedGroup
    ? procedureCategories.find((category) =>
        category.groups.some((group) => group.id === selectedGroup.id),
      )?.title
    : null;

  if (selectedGroup && currentVisualStep !== "service") {
    return (
      <BookingSection platform={platform} title={t("serviceTitle")}>
        <BookingRow
          ctaLabel={t("changeSelectionShort")}
          onPress={onDeselectGroup}
          platform={platform}
          subtitle={
            selectedGroupCategoryTag
              ? `#${selectedGroupCategoryTag}`
              : (selectedGroup.description ?? undefined)
          }
          title={selectedProcedure?.serviceTitle ?? selectedGroup.title}
        />
      </BookingSection>
    );
  }

  if (!shouldUseCategories) {
    return (
      <BookingSection platform={platform} title={t("serviceTitle")}>
        {procedureGroups.map((group, index) =>
          renderServiceGroupRow(group, index, procedureGroups.length),
        )}
      </BookingSection>
    );
  }

  return (
    <BookingSection platform={platform} title={t("serviceTitle")}>
      <YStack gap="$3" width="100%">
        {procedureCategories.map((category) => (
          <ProcedureCategoryBlock
            key={category.id}
            category={category}
            expandedCategoryId={expandedCategoryId}
            onExpandCategory={onExpandCategory}
            platform={platform}
            renderGroupRow={renderServiceGroupRow}
          />
        ))}
      </YStack>
    </BookingSection>
  );
}
