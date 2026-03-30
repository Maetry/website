"use client";

import { Text, YStack } from "tamagui";

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
  const values = [price, duration].filter(Boolean);

  if (!values.length) {
    return null;
  }

  return (
    <YStack alignItems="flex-end" gap="$1">
      {values.map((value) => (
        <Text
          key={value}
          color="$textPrimary"
          fontSize={surface.row.indicatorFontSize}
          fontWeight="400"
          lineHeight={surface.row.indicatorLineHeight}
          textAlign="right"
        >
          {value}
        </Text>
      ))}
    </YStack>
  );
}
