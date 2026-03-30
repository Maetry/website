"use client";

import type { ReactNode } from "react";

import { Paragraph, Text, XStack, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { RowButton } from "./primitives";

type BookingRowProps = {
  before?: ReactNode;
  ctaLabel?: string | null;
  indicator?: ReactNode;
  onPress?: () => void;
  overline?: string | null;
  platform: BookingPlatformVariant;
  selected?: boolean;
  subtitle?: string | null;
  title: string;
};

export function BookingRow({
  before,
  ctaLabel,
  indicator,
  onPress,
  overline,
  platform,
  selected = false,
  subtitle,
  title,
}: BookingRowProps) {
  const surface = getBookingSurfaceStyle(platform);

  const content = (
    <XStack
      alignItems="center"
      gap="$3"
      justifyContent="space-between"
      width="100%"
    >
      <XStack alignItems="center" flex={1} gap="$3">
        {before}
        <YStack flex={1} gap="$1">
          {overline ? (
            <Text
              color="$textSecondary"
              fontSize={surface.row.overlineFontSize}
              fontWeight="600"
              lineHeight={surface.row.overlineLineHeight}
              textTransform="uppercase"
            >
              {overline}
            </Text>
          ) : null}
          <Text
            color="$textPrimary"
            fontSize={surface.row.titleFontSize}
            fontWeight="600"
            lineHeight={surface.row.titleLineHeight}
          >
            {title}
          </Text>
          {subtitle ? (
            <Paragraph
              color="$textSecondary"
              fontSize={surface.row.subtitleFontSize}
              lineHeight={surface.row.subtitleLineHeight}
            >
              {subtitle}
            </Paragraph>
          ) : null}
        </YStack>
      </XStack>
      {indicator ? (
        <XStack alignItems="center" justifyContent="flex-end">
          {indicator}
        </XStack>
      ) : ctaLabel ? (
        <Text color="$primary" fontSize={surface.row.ctaFontSize} fontWeight="600">
          {ctaLabel}
        </Text>
      ) : null}
    </XStack>
  );

  if (!onPress) {
    return (
      <YStack
        paddingHorizontal={surface.row.staticPaddingHorizontal}
        paddingVertical={surface.row.staticPaddingVertical}
      >
        {content}
      </YStack>
    );
  }

  return (
    <RowButton
      backgroundColor="$bookingRowSurface"
      onPress={onPress}
      platform={platform}
      pressStyle={{ backgroundColor: "$bookingRowPressBackground" }}
      selected={selected}
    >
      {content}
    </RowButton>
  );
}
