"use client";

import { useTranslations } from "next-intl";
import {
  Avatar,
  Button,
  Paragraph,
  Spinner,
  Text,
  useThemeName,
  XStack,
  YStack,
} from "tamagui";

import type {
  Procedure,
  ProcedureGroup,
  Step,
} from "@/lib/public-booking-screen";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingRowMeta } from "../../_shared/BookingRowMeta";
import { BookingSection } from "../../_shared/BookingSection";
import { BookingState } from "../../_shared/BookingState";
import { CurrencyDisplay } from "../../_shared/CurrencyDisplay";
import {
  formatCurrency,
  formatDuration,
  getInitials,
  toCurrencyValue,
  type CurrencyValue,
} from "../../_shared/formatting";
import { BOOKING_MASTER_AVATAR_PX } from "../../_shared/primitives";
import { SectionSeparator } from "../../_shared/SectionSeparator";

import { getProcedureSelectionKey } from "./date-utils";
import type { BookingServiceSection } from "./useBookingFlow";

type ServiceSelectionsStepProps = {
  canAddAnotherService: boolean;
  currentVisualStep: Step;
  locale: string;
  onAddService: () => void;
  onRequestSectionAction: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
  onSectionEditConfirm: (sectionId: string) => void;
  onSelectBundleProcedureMaster: (
    sectionId: string,
    procedureId: string,
    executionId: string | null,
  ) => void;
  onSelectGroup: (sectionId: string, group: ProcedureGroup) => void;
  onSelectProcedure: (sectionId: string, procedure: Procedure) => void;
  onToggleBundleProcedurePicker: (
    sectionId: string,
    procedureId: string,
  ) => void;
  onToggleDescription: (sectionId: string) => void;
  platform: BookingPlatformVariant;
  procedureGroups: ProcedureGroup[];
  proceduresError: string | null;
  proceduresLoading: boolean;
  sections: BookingServiceSection[];
};

function SectionFooter({
  collapseLabel,
  description,
  expandLabel,
  isDescriptionExpanded,
  platform,
  onToggleDescription,
}: {
  collapseLabel: string;
  description: string | null;
  expandLabel: string;
  isDescriptionExpanded: boolean;
  onToggleDescription?: (() => void) | null;
  platform: BookingPlatformVariant;
}) {
  const surface = getBookingSurfaceStyle(platform);
  const shouldClampDescription =
    !isDescriptionExpanded && (description?.length ?? 0) > 140;

  if (!description) {
    return null;
  }

  return (
    <YStack gap="$2" width="100%">
      <Paragraph
        color="$textSecondary"
        fontSize={surface.summary.footerFontSize}
        lineHeight={surface.summary.footerLineHeight}
        style={
          shouldClampDescription
            ? {
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                display: "-webkit-box",
                overflow: "hidden",
              }
            : undefined
        }
      >
        {description}
      </Paragraph>
      {description.length > 140 && onToggleDescription ? (
        <Button
          alignSelf="flex-start"
          chromeless
          onPress={onToggleDescription}
          padding={0}
        >
          <Text color="$primary" fontSize={13} fontWeight="600">
            {isDescriptionExpanded ? collapseLabel : expandLabel}
          </Text>
        </Button>
      ) : null}
    </YStack>
  );
}

function ServiceSummaryMeta({
  duration,
  locale,
  price,
}: {
  duration: string | null;
  locale: string;
  price: CurrencyValue | null;
}) {
  return (
    <YStack alignItems="flex-end" flexShrink={0} gap="$1">
      {price ? (
        <CurrencyDisplay
          color="$textPrimary"
          fontSize={16}
          fontWeight="600"
          lineHeight={20}
          locale={locale}
          textAlign="right"
          value={price}
        />
      ) : null}
      {duration ? (
        <Text
          color="$textSecondary"
          fontSize={locale.startsWith("ru") ? 14 : 13}
          lineHeight={18}
          textAlign="right"
        >
          {duration}
        </Text>
      ) : null}
    </YStack>
  );
}

function SectionActionMenu({
  changeLabel,
  chooseAnotherLabel,
  isOpen,
  onDelete,
  onOpenChange,
  onSelectEdit,
  platform,
  removeLabel,
}: {
  changeLabel: string;
  chooseAnotherLabel: string;
  isOpen: boolean;
  onDelete: () => void;
  onOpenChange: () => void;
  onSelectEdit: () => void;
  platform: BookingPlatformVariant;
  removeLabel: string;
}) {
  const surface = getBookingSurfaceStyle(platform);
  const themeName = useThemeName();
  const isDarkTheme = themeName.includes("dark");
  const useSectionLikeShadow = platform === "ios" && !isDarkTheme;
  const shadowOffsetHeight = surface.section.shadowOffsetHeight ?? 0;
  const shadowOpacity = surface.section.shadowOpacity ?? 0;
  const shadowRadius = surface.section.shadowRadius ?? 0;

  return (
    <YStack position="relative">
      <Button
        backgroundColor="transparent"
        borderWidth={0}
        chromeless
        height="auto"
        margin={0}
        minHeight={0}
        onPress={onOpenChange}
        padding={0}
        pressStyle={{ backgroundColor: "transparent", opacity: 1 }}
        hoverStyle={{ backgroundColor: "transparent" }}
        focusStyle={{ backgroundColor: "transparent" }}
      >
        <Text
          color="$primary"
          fontSize={surface.row.ctaFontSize}
          fontWeight="600"
        >
          {changeLabel}
        </Text>
      </Button>
      {isOpen ? (
        <YStack
          backgroundColor="$cardBackground"
          borderColor={useSectionLikeShadow ? "transparent" : "$separator"}
          borderRadius={16}
          borderWidth={useSectionLikeShadow ? 0 : 1}
          gap="$1"
          minWidth={172}
          padding="$1"
          position="absolute"
          right={0}
          shadowColor={
            useSectionLikeShadow ? "rgba(0,0,0,0.42)" : surface.section.shadowColorToken
          }
          shadowOffset={{
            width: surface.section.shadowOffsetWidth ?? 0,
            height: useSectionLikeShadow
              ? shadowOffsetHeight + 10
              : shadowOffsetHeight,
          }}
          shadowOpacity={
            useSectionLikeShadow
              ? Math.max(shadowOpacity * 2, 0.38)
              : shadowOpacity
          }
          shadowRadius={
            useSectionLikeShadow ? shadowRadius + 8 : shadowRadius
          }
          top="$6"
          zIndex={20}
        >
          <Button chromeless justifyContent="flex-start" onPress={onSelectEdit}>
            <Text color="$textPrimary" fontWeight="600" whiteSpace="nowrap">
              {chooseAnotherLabel}
            </Text>
          </Button>
          <Button chromeless justifyContent="flex-start" onPress={onDelete}>
            <Text color="$red10" fontWeight="600" whiteSpace="nowrap">
              {removeLabel}
            </Text>
          </Button>
        </YStack>
      ) : null}
    </YStack>
  );
}

export function ServiceSelectionsStep({
  canAddAnotherService,
  currentVisualStep,
  locale,
  onAddService,
  onRequestSectionAction,
  onSectionDelete,
  onSectionEditConfirm,
  onSelectBundleProcedureMaster,
  onSelectGroup,
  onSelectProcedure,
  onToggleBundleProcedurePicker,
  onToggleDescription,
  platform,
  procedureGroups,
  proceduresError,
  proceduresLoading,
  sections,
}: ServiceSelectionsStepProps) {
  const t = useTranslations("booking");
  const surface = getBookingSurfaceStyle(platform);

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

  const openSectionId =
    sections.find((section) => section.isActionMenuOpen)?.id ?? null;

  return (
    <YStack gap={surface.layout.sectionGapToken} position="relative">
      {openSectionId ? (
        <Button
          backgroundColor="transparent"
          borderWidth={0}
          chromeless
          onPress={() => onRequestSectionAction(openSectionId)}
          position="absolute"
          pressStyle={{ backgroundColor: "transparent", opacity: 1 }}
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={10}
        />
      ) : null}
      {sections.map((section, sectionIndex) => {
        const description = section.selectedGroup?.description?.trim() ?? null;
        const sectionNumber = sectionIndex + 1;
        const sectionTitle = !section.selectedGroup
          ? t("serviceSectionChooseTitle", { number: sectionNumber })
          : !section.selectedProcedure
            ? t("serviceSectionChooseMasterTitle", { number: sectionNumber })
            : t("serviceSectionSelectedTitle", { number: sectionNumber });

        return (
          <BookingSection
            headerAction={
              section.isComplete ? (
                <SectionActionMenu
                  changeLabel={t("editSelectionShort")}
                  chooseAnotherLabel={t("chooseAnotherSelectionShort")}
                  isOpen={section.isActionMenuOpen}
                  onDelete={() => onSectionDelete(section.id)}
                  onOpenChange={() => onRequestSectionAction(section.id)}
                  onSelectEdit={() => onSectionEditConfirm(section.id)}
                  platform={platform}
                  removeLabel={t("removeSelectionShort")}
                />
              ) : undefined
            }
            key={section.id}
            footer={
              section.selectedGroup ? (
                <SectionFooter
                  collapseLabel={t("serviceDescriptionCollapse")}
                  description={description}
                  expandLabel={t("serviceDescriptionExpand")}
                  isDescriptionExpanded={section.isDescriptionExpanded}
                  onToggleDescription={() => onToggleDescription(section.id)}
                  platform={platform}
                />
              ) : undefined
            }
            platform={platform}
            title={sectionTitle}
          >
            {!section.selectedGroup ? (
              <>
                {procedureGroups.map((group, index) => {
                  const groupPriceValue = formatCurrency(
                    group.minPrice,
                    group.currency,
                    locale,
                  );
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
                      .filter(
                        (duration): duration is number =>
                          typeof duration === "number",
                      ),
                  );
                  const groupDurationValue = formatDuration(
                    group.duration,
                    locale,
                  );
                  const durationLabel =
                    durationValues.size > 1 && groupDurationValue
                      ? t("serviceValueFrom", { value: groupDurationValue })
                      : groupDurationValue;

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
                        onPress={() => onSelectGroup(section.id, group)}
                        overline={
                          group.procedures[0]?.kind === "bundle"
                            ? t("complexLabel")
                            : undefined
                        }
                        overlineUppercase={false}
                        platform={platform}
                        subtitle={
                          group.procedures[0]?.kind === "bundle"
                            ? t("serviceSpecialistsCount", {
                                count:
                                  group.procedures[0].bundleSpecialistCount ??
                                  0,
                              })
                            : group.procedures.length > 1
                              ? t("serviceSpecialistsCount", {
                                  count: group.procedures.length,
                                })
                            : undefined
                        }
                        tall={group.procedures[0]?.kind === "bundle"}
                        title={group.title}
                      />
                      {index < procedureGroups.length - 1 ? (
                        <SectionSeparator platform={platform} />
                      ) : null}
                    </YStack>
                  );
                })}
              </>
            ) : section.selectedGroup.procedures[0]?.kind === "bundle" &&
              section.selectedProcedure?.kind === "bundle" ? (
              <YStack gap={0}>
                <YStack gap="$2.5" paddingHorizontal="$4" paddingVertical="$3">
                  <XStack
                    alignItems="flex-start"
                    gap="$3"
                    justifyContent="space-between"
                  >
                    <YStack flex={1} gap="$1">
                      <Text
                        color="$textSecondary"
                        fontSize={surface.row.overlineFontSize}
                        fontWeight="600"
                        lineHeight={surface.row.overlineLineHeight}
                      >
                        {t("complexLabel")}
                      </Text>
                      <Text
                        color="$textPrimary"
                        fontSize={surface.row.titleFontSize}
                        fontWeight="600"
                        lineHeight={surface.row.titleLineHeight}
                      >
                        {section.selectedGroup.title}
                      </Text>
                    </YStack>

                    <ServiceSummaryMeta
                      duration={section.footerDuration}
                      locale={locale}
                      price={section.footerPrice}
                    />
                  </XStack>
                </YStack>
                <SectionSeparator platform={platform} />
                {(section.selectedProcedure.bundleProcedureItems ?? []).map(
                  (bundleProcedure, procedureIndex) => {
                    const selectedMasterLabel =
                      bundleProcedure.selectedMasterOption?.masterNickname ??
                      t("masterNotRequired");
                    const isExpanded =
                      section.activeBundleProcedureId ===
                      bundleProcedure.procedureId;

                    return (
                      <YStack key={bundleProcedure.procedureId}>
                        <BookingRow
                          ctaLabel={t("chooseSelectionShort")}
                          onPress={() =>
                            onToggleBundleProcedurePicker(
                              section.id,
                              bundleProcedure.procedureId,
                            )
                          }
                          platform={platform}
                          subtitle={selectedMasterLabel}
                          title={bundleProcedure.title}
                        />
                        {isExpanded ? (
                          <YStack gap={0} paddingBottom="$2">
                            <BookingRow
                              onPress={() =>
                                onSelectBundleProcedureMaster(
                                  section.id,
                                  bundleProcedure.procedureId,
                                  null,
                                )
                              }
                              platform={platform}
                              selected={
                                bundleProcedure.selectedMasterOption == null
                              }
                              subtitle={t("masterNotRequired")}
                              title={t("masterAny")}
                            />
                            {bundleProcedure.masterOptions.map((option) => {
                              const optionPriceValue = toCurrencyValue(
                                option.price?.amount ?? null,
                                option.price?.currency ?? null,
                              );
                              const optionDuration = formatDuration(
                                option.duration ?? null,
                                locale,
                              );

                              return (
                                <BookingRow
                                  before={
                                    <Avatar
                                      circular
                                      size={BOOKING_MASTER_AVATAR_PX}
                                    >
                                      <Avatar.Image
                                        src={option.masterAvatar ?? undefined}
                                      />
                                      <Avatar.Fallback
                                        alignItems="center"
                                        justifyContent="center"
                                      >
                                        <Text
                                          fontSize={14}
                                          fontWeight="700"
                                          lineHeight={16}
                                        >
                                          {getInitials(
                                            option.masterNickname ??
                                              t("masterAny"),
                                          )}
                                        </Text>
                                      </Avatar.Fallback>
                                    </Avatar>
                                  }
                                  indicator={
                                    <BookingRowMeta
                                      duration={optionDuration}
                                      locale={locale}
                                      platform={platform}
                                      priceValue={optionPriceValue}
                                    />
                                  }
                                  key={
                                    option.executionId ??
                                    option.masterId ??
                                    "any"
                                  }
                                  onPress={() =>
                                    onSelectBundleProcedureMaster(
                                      section.id,
                                      bundleProcedure.procedureId,
                                      option.executionId ?? null,
                                    )
                                  }
                                  platform={platform}
                                  selected={
                                    (bundleProcedure.selectedMasterOption
                                      ?.executionId ?? null) ===
                                    (option.executionId ?? null)
                                  }
                                  subtitle={
                                    option.masterPosition?.trim() || undefined
                                  }
                                  title={
                                    option.masterNickname ?? t("masterAny")
                                  }
                                />
                              );
                            })}
                          </YStack>
                        ) : null}
                        {procedureIndex <
                        (section.selectedProcedure?.bundleProcedureItems
                          ?.length ?? 0) -
                          1 ? (
                          <SectionSeparator platform={platform} />
                        ) : null}
                      </YStack>
                    );
                  },
                )}
              </YStack>
            ) : !section.selectedProcedure ? (
              <YStack gap={0}>
                <BookingRow
                  ctaLabel={t("editSelectionShort")}
                  onPress={() => onSectionEditConfirm(section.id)}
                  platform={platform}
                  title={section.selectedGroup.title}
                />
                <SectionSeparator platform={platform} />
                {section.selectedGroup.procedures.map((procedure, index) => {
                  const priceValue = toCurrencyValue(
                    procedure.price?.amount ??
                      section.selectedGroup?.minPrice ??
                      null,
                    procedure.price?.currency ??
                      section.selectedGroup?.currency ??
                      null,
                  );
                  const durationLabel = formatDuration(
                    procedure.duration,
                    locale,
                  );

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
                              <Text
                                fontSize={14}
                                fontWeight="700"
                                lineHeight={16}
                              >
                                {getInitials(
                                  procedure.masterNickname ??
                                    procedure.alias ??
                                    t("masterAny"),
                                )}
                              </Text>
                            </Avatar.Fallback>
                          </Avatar>
                        }
                        indicator={
                          <BookingRowMeta
                            duration={durationLabel}
                            locale={locale}
                            platform={platform}
                            priceValue={priceValue}
                          />
                        }
                        onPress={() => onSelectProcedure(section.id, procedure)}
                        platform={platform}
                        title={
                          procedure.masterNickname ??
                          procedure.alias ??
                          t("masterAny")
                        }
                      />
                      {index < section.selectedGroup!.procedures.length - 1 ? (
                        <SectionSeparator
                          platform={platform}
                          variant="withAvatar"
                        />
                      ) : null}
                    </YStack>
                  );
                })}
              </YStack>
            ) : (
              <YStack gap="$2.5" paddingHorizontal="$4" paddingVertical="$3">
                <XStack
                  alignItems="flex-start"
                  gap="$3"
                  justifyContent="space-between"
                >
                  <YStack flex={1} gap="$1">
                    <Text
                      color="$textPrimary"
                      fontSize={surface.row.titleFontSize}
                      fontWeight="600"
                      lineHeight={surface.row.titleLineHeight}
                    >
                      {section.selectedGroup.title}
                    </Text>
                    <Paragraph
                      color="$textSecondary"
                      fontSize={surface.row.subtitleFontSize}
                      lineHeight={surface.row.subtitleLineHeight}
                    >
                      {section.selectedProcedure.masterNickname ??
                        section.selectedProcedure.alias ??
                        t("masterAny")}
                    </Paragraph>
                  </YStack>

                  <XStack alignItems="flex-start" gap="$3">
                    <ServiceSummaryMeta
                      duration={section.footerDuration}
                      locale={locale}
                      price={section.footerPrice}
                    />
                  </XStack>
                </XStack>
              </YStack>
            )}
          </BookingSection>
        );
      })}

      {canAddAnotherService ? (
        <Button
          backgroundColor="$cardBackground"
          borderRadius={surface.action.buttonRadius}
          minHeight={surface.action.buttonMinHeight}
          onPress={onAddService}
          pressStyle={{ opacity: surface.action.pressOpacity }}
        >
          <Text color="$textPrimary" fontWeight="600">
            {t("addAnotherService")}
          </Text>
        </Button>
      ) : null}
    </YStack>
  );
}
