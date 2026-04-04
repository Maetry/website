"use client";

import type { ReactNode } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Spinner, Text, XStack, YStack } from "tamagui";

import type { Procedure, ProcedureGroup, Step } from "@/lib/public-booking-screen";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingRowMeta } from "../../_shared/BookingRowMeta";
import { BookingSection } from "../../_shared/BookingSection";
import { BookingState } from "../../_shared/BookingState";
import { formatCurrency, formatDuration } from "../../_shared/formatting";
import { RowButton } from "../../_shared/primitives";
import { SectionSeparator } from "../../_shared/SectionSeparator";


import { BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID } from "./date-utils";
import { resolveServiceCategoryLucideIcon } from "./serviceCategoryLucideIcon";
import type { ProcedureCategoryGroup } from "./useBookingFlow";

function ProcedureCategoryBlock({
  category,
  expandedCategoryIds,
  onToggleCategory,
  platform,
  renderGroupRow,
}: {
  category: ProcedureCategoryGroup;
  expandedCategoryIds: string[];
  onToggleCategory: (categoryId: string) => void;
  platform: BookingPlatformVariant;
  renderGroupRow: (
    group: ProcedureGroup,
    index: number,
    arrayLength: number,
  ) => ReactNode;
}) {
  const surface = getBookingSurfaceStyle(platform);
  const isExpanded = expandedCategoryIds.includes(category.id);
  const iconBadgeSize = surface.visit.iconBadgeSize;
  const CategoryIcon = resolveServiceCategoryLucideIcon(category.id);

  return (
    <YStack overflow="hidden" width="100%">
      <RowButton
        backgroundColor="transparent"
        borderRadius={0}
        onPress={() => onToggleCategory(category.id)}
        platform={platform}
        pressStyle={{ backgroundColor: "$bookingRowPressBackground" }}
        width="100%"
      >
        <XStack alignItems="center" gap="$3" justifyContent="space-between" width="100%">
          <XStack alignItems="center" flex={1} gap="$3">
            <XStack
              alignItems="center"
              backgroundColor="$primarySoft"
              borderRadius={iconBadgeSize / 2}
              height={iconBadgeSize}
              justifyContent="center"
              width={iconBadgeSize}
            >
              <Text color="$primary">
                <CategoryIcon size={20} strokeWidth={2.25} />
              </Text>
            </XStack>
            <Text
              color="$textPrimary"
              flex={1}
              fontSize="$5"
              fontWeight="600"
              lineHeight={22}
            >
              {category.title}
            </Text>
          </XStack>
          <Text color="$primary">
            {isExpanded ? (
              <ChevronDown size={22} strokeWidth={2.25} />
            ) : (
              <ChevronRight size={22} strokeWidth={2.25} />
            )}
          </Text>
        </XStack>
      </RowButton>

      {isExpanded ? (
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
  expandedCategoryIds: string[];
  locale: string;
  onDeselectGroup: () => void;
  onToggleCategory: (categoryId: string) => void;
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
  expandedCategoryIds,
  locale,
  onDeselectGroup,
  onToggleCategory,
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
    procedureCategories.some((category) => category.grouping === "tag") ||
    (procedureCategories.length > 1 &&
      procedureCategories.some(
        (category) => category.id !== BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID,
      ));

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
      <YStack gap={0} width="100%">
        {procedureCategories.map((category, categoryIndex) => (
          <YStack key={category.id} width="100%">
            {categoryIndex > 0 ? <SectionSeparator platform={platform} /> : null}
            <ProcedureCategoryBlock
              category={category}
              expandedCategoryIds={expandedCategoryIds}
              onToggleCategory={onToggleCategory}
              platform={platform}
              renderGroupRow={renderServiceGroupRow}
            />
          </YStack>
        ))}
      </YStack>
    </BookingSection>
  );
}
