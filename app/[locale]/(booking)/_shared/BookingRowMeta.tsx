"use client";

import { Text, YStack, useThemeName } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

type BookingRowMetaProps = {
  duration?: string | null;
  platform: BookingPlatformVariant;
  price?: string | null;
};

export function BookingRowMeta({
  duration,
  platform,
  price,
}: BookingRowMetaProps) {
  const surface = getBookingSurfaceStyle(platform);
  const themeName = useThemeName();
  const priceAccentColor = themeName.includes("dark") ? "#32D74B" : "#34C759";

  if (!price && !duration) {
    return null;
  }

  return (
    <YStack alignItems="flex-end" gap="$1">
      {price ? (
        <Text
          color={priceAccentColor}
          fontSize={surface.row.indicatorFontSize}
          fontWeight="600"
          lineHeight={surface.row.indicatorLineHeight}
          textAlign="right"
        >
          {price}
        </Text>
      ) : null}
      {duration ? (
        <Text
          color="$textSecondary"
          fontSize={surface.row.indicatorFontSize}
          fontWeight="400"
          lineHeight={surface.row.indicatorLineHeight}
          textAlign="right"
        >
          {duration}
        </Text>
      ) : null}
    </YStack>
  );
}
