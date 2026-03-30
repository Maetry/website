"use client";

import { useLocale, useTranslations } from "next-intl";
import { Button, Paragraph, Spinner, Text, XStack, YStack } from "tamagui";

import type { Procedure, SlotInterval, Step } from "@/lib/public-booking-screen";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingRow } from "../../_shared/BookingRow";
import { BookingSection } from "../../_shared/BookingSection";
import { BookingState } from "../../_shared/BookingState";
import {
  PrimaryAction,
  bookingSectionHeaderPaddingX,
} from "../../_shared/primitives";

import type { CalendarDay, SlotPeriod } from "./useBookingFlow";

type TimeStepProps = {
  currentVisualStep: Step;
  onDeselectSlot: () => void;
  onRetrySlots: () => void;
  onSelectDate: (key: string) => void;
  onSelectSlot: (slot: SlotInterval) => void;
  platform: BookingPlatformVariant;
  selectedDateKey: string | null;
  selectedProcedure: Procedure | null;
  selectedSlot: SlotInterval | null;
  selectedSlotDurationSubtitle: string | null;
  selectedSlotSummaryTitle: string | null;
  slotCalendarDays: CalendarDay[];
  slotMonthTitle: string;
  slotPeriods: SlotPeriod[];
  slotsError: string | null;
  slotsLoading: boolean;
};

function TimePickerBody({
  hasSlots,
  monthTitleDisplay,
  onSelectDate,
  onSelectSlot,
  platform,
  selectedDateKey,
  selectedSlot,
  slotCalendarDays,
  slotPeriods,
  slotsError,
  t,
  timeCardInnerPadX,
}: {
  hasSlots: boolean;
  monthTitleDisplay: string;
  onSelectDate: (key: string) => void;
  onSelectSlot: (slot: SlotInterval) => void;
  platform: BookingPlatformVariant;
  selectedDateKey: string | null;
  selectedSlot: SlotInterval | null;
  slotCalendarDays: CalendarDay[];
  slotPeriods: SlotPeriod[];
  slotsError: string | null;
  t: (key: string) => string;
  timeCardInnerPadX: number;
}) {
  const surface = getBookingSurfaceStyle(platform);
  const calendarWeekChipWidth = surface.time.calendarWeekChipWidth;
  const calendarDayButtonSize = surface.time.calendarDayButtonSize;

  return (
    <YStack gap="$3" paddingHorizontal="$4">
      <YStack gap={0}>
        <XStack
          alignItems="center"
          justifyContent="space-between"
          style={{ fontSize: 0 }}
        >
          <Text
            color="$textPrimary"
            fontSize={surface.time.monthTitleFontSize}
            fontWeight="600"
            lineHeight={surface.time.monthTitleLineHeight}
          >
            {monthTitleDisplay}
          </Text>
          <Button
            chromeless
            onPress={() => {
              const today = slotCalendarDays.find((day) => day.isToday);
              if (today) onSelectDate(today.key);
            }}
            padding={0}
          >
            <Text color="$primary" fontSize={13} fontWeight="600">
              {t("timeToday")}
            </Text>
          </Button>
        </XStack>

        <div
          className="booking-calendar-scroll"
          style={{
            marginBottom: -4,
            marginLeft: -timeCardInnerPadX,
            marginRight: -timeCardInnerPadX,
            marginTop: -4,
            msOverflowStyle: "none",
            overflowX: "auto",
            paddingBottom: 0,
            scrollPaddingInline: timeCardInnerPadX,
            scrollSnapType: "x proximity",
            scrollbarWidth: "none",
          }}
        >
          <XStack
            gap="$1"
            paddingHorizontal={timeCardInnerPadX}
            width="max-content"
          >
            {slotCalendarDays.map((day) => {
              const isSelected = selectedDateKey === day.key;
              return (
                <YStack
                  key={day.key}
                  alignItems="center"
                  gap={2}
                  minWidth={calendarWeekChipWidth}
                  style={{ scrollSnapAlign: "start" }}
                >
                  <Text
                    color={
                      day.isWeekend
                        ? "$weekendAccent"
                        : "$textSecondary"
                    }
                    fontSize={12}
                    fontWeight="500"
                  >
                    {day.weekdayLabel.replace(".", "")}
                  </Text>
                  <Button
                    alignItems="center"
                    backgroundColor={isSelected ? "$primary" : "transparent"}
                    borderRadius={999}
                    chromeless
                    height={calendarDayButtonSize}
                    justifyContent="center"
                    onPress={() => onSelectDate(day.key)}
                    width={calendarDayButtonSize}
                  >
                    <Text
                      color={isSelected ? "white" : "$textPrimary"}
                      fontSize={surface.row.titleFontSize}
                      fontWeight="500"
                    >
                      {day.dayLabel}
                    </Text>
                  </Button>
                </YStack>
              );
            })}
          </XStack>
        </div>
      </YStack>

      {!slotsError && !hasSlots ? (
        <YStack
          alignItems="center"
          gap="$3"
          paddingBottom="$5"
          paddingTop="$2"
        >
          <Text
            color="$textPrimary"
            fontSize={surface.time.emptyTitleFontSize}
            fontWeight="600"
            textAlign="center"
          >
            {t("timeEmptyTitle")}
          </Text>
          <Paragraph
            color="$textSecondary"
            fontSize={surface.time.emptyHintFontSize}
            lineHeight={surface.time.emptyHintLineHeight}
            maxWidth={320}
            textAlign="center"
          >
            {t("timeEmptyHint")}
          </Paragraph>
        </YStack>
      ) : null}

      {hasSlots
        ? slotPeriods.map((period) => (
            <YStack key={period.key} gap="$3">
              <Text
                color="$textSecondary"
                fontSize={12}
                fontWeight="500"
                letterSpacing={0.3}
                lineHeight={16}
                textTransform="uppercase"
              >
                {period.label}
              </Text>
              <div
                style={{
                  boxSizing: "border-box",
                  display: "grid",
                  gap: 8,
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  paddingBottom: 8,
                  width: "100%",
                }}
              >
                {period.slots.map((slot) => {
                  const isSelected =
                    selectedSlot?.start === slot.start &&
                    selectedSlot?.end === slot.end;

                  return (
                    <Button
                      key={slot.start}
                      backgroundColor={
                        isSelected ? "$primary" : "$bookingSlotIdleBg"
                      }
                      borderRadius={surface.time.slotChipRadius}
                      chromeless
                      justifyContent="center"
                      minWidth={0}
                      onPress={() =>
                        onSelectSlot({
                          start: slot.start,
                          end: slot.end,
                        })
                      }
                      paddingHorizontal={6}
                      paddingVertical={5}
                      width="100%"
                    >
                      <Text
                        color={isSelected ? "white" : "$textPrimary"}
                        fontSize={13}
                        fontWeight="500"
                        lineHeight={16}
                        textAlign="center"
                        width="100%"
                      >
                        {slot.label}
                      </Text>
                    </Button>
                  );
                })}
              </div>
            </YStack>
          ))
        : null}
    </YStack>
  );
}

export function TimeStep({
  currentVisualStep,
  onDeselectSlot,
  onRetrySlots,
  onSelectDate,
  onSelectSlot,
  platform,
  selectedDateKey,
  selectedProcedure,
  selectedSlot,
  selectedSlotDurationSubtitle,
  selectedSlotSummaryTitle,
  slotCalendarDays,
  slotMonthTitle,
  slotPeriods,
  slotsError,
  slotsLoading,
}: TimeStepProps) {
  const t = useTranslations("booking");
  const locale = useLocale();

  if (!selectedProcedure) return null;

  const surface = getBookingSurfaceStyle(platform);
  const sectionTitlePadding = bookingSectionHeaderPaddingX(platform);
  const timeCardInnerPadX = 16;

  const monthTitleDisplay =
    slotMonthTitle.length > 0
      ? slotMonthTitle.charAt(0).toLocaleUpperCase(locale) +
        slotMonthTitle.slice(1)
      : slotMonthTitle;

  const hasSlots = slotPeriods.some((p) => p.slots.length > 0);

  if (selectedSlot && currentVisualStep !== "time") {
    return (
      <YStack gap={0}>
        <BookingSection
         
          platform={platform}
          title={t("timeTitle")}
        >
          <BookingRow
            ctaLabel={t("changeSelectionShort")}
            onPress={onDeselectSlot}
            platform={platform}
            subtitle={selectedSlotDurationSubtitle ?? undefined}
            title={selectedSlotSummaryTitle ?? "—"}
          />
        </BookingSection>
        <Paragraph
          color="$textSecondary"
          fontSize={surface.section.descriptionFontSize}
          lineHeight={surface.section.descriptionLineHeight}
          paddingHorizontal={sectionTitlePadding}
          paddingTop={0}
          size="$3"
        >
          {t("timeHint")}
        </Paragraph>
      </YStack>
    );
  }

  return (
    <YStack gap={surface.layout.sectionGapToken}>
      <BookingSection platform={platform} title={t("timeTitle")}>
        {slotsLoading ? (
          <BookingState
            action={<Spinner />}
            embedded
            platform={platform}
            title={t("loading.slots")}
          />
        ) : slotsError ? (
          <BookingState
            action={
              <PrimaryAction onPress={onRetrySlots} platform={platform}>
                <Text
                  color="white"
                  fontSize={surface.action.textFontSize}
                  fontWeight="600"
                  lineHeight={surface.action.textLineHeight}
                >
                  {t("timeReload")}
                </Text>
              </PrimaryAction>
            }
            description={slotsError}
            embedded
            platform={platform}
            title={t("timeEmptyTitle")}
          />
        ) : (
          <TimePickerBody
            hasSlots={hasSlots}
            monthTitleDisplay={monthTitleDisplay}
            onSelectDate={onSelectDate}
            onSelectSlot={onSelectSlot}
            platform={platform}
            selectedDateKey={selectedDateKey}
            selectedSlot={selectedSlot}
            slotCalendarDays={slotCalendarDays}
            slotPeriods={slotPeriods}
            slotsError={slotsError}
            t={t}
            timeCardInnerPadX={timeCardInnerPadX}
          />
        )}
      </BookingSection>

      <Paragraph
        color="$textSecondary"
        fontSize={surface.section.descriptionFontSize}
        lineHeight={surface.section.descriptionLineHeight}
        paddingHorizontal={sectionTitlePadding}
        paddingTop={0}
        size="$3"
      >
        {t("timeHint")}
      </Paragraph>
    </YStack>
  );
}
