import { Separator, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import {
  BOOKING_MASTER_AVATAR_PX,
  BOOKING_ROW_LEADING_GAP_PX,
  bookingSectionHeaderPaddingX,
} from "./primitives";

function sectionSeparatorInsetLeading(
  platform: BookingPlatformVariant,
  variant: "default" | "form" | "withAvatar",
): number {
  const surface = getBookingSurfaceStyle(platform);
  const pad = bookingSectionHeaderPaddingX(platform);
  if (variant === "withAvatar") {
    return (
      pad +
      (surface.master.avatarSize ?? BOOKING_MASTER_AVATAR_PX) +
      (surface.master.rowLeadingGap ?? BOOKING_ROW_LEADING_GAP_PX)
    );
  }
  return pad;
}

type SectionSeparatorProps = {
  marginTop?: number | string;
  platform: BookingPlatformVariant;
  variant?: "default" | "form" | "withAvatar";
};

export function SectionSeparator({
  marginTop,
  platform,
  variant = "default",
}: SectionSeparatorProps) {
  const inset = sectionSeparatorInsetLeading(platform, variant);

  return (
    <YStack marginTop={marginTop} paddingLeft={inset} width="100%">
      <Separator backgroundColor="$separator" />
    </YStack>
  );
}
