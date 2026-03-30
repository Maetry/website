import type { ReactNode } from "react";

import { Paragraph, Text, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

type BookingStateProps = {
  action?: ReactNode;
  description?: string | null;
  /** Внутри BookingSection — без второй светлой плитки; цвета текста из текущей Tamagui-темы. */
  embedded?: boolean;
  platform: BookingPlatformVariant;
  title: string;
};

export function BookingState({
  action,
  description,
  embedded = false,
  platform,
  title,
}: BookingStateProps) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <YStack
      alignItems="center"
      backgroundColor={embedded ? "transparent" : "$cardBackground"}
      borderRadius={embedded ? 0 : surface.section.cardRadius}
      gap="$3"
      justifyContent="center"
      paddingHorizontal="$4"
      paddingVertical={surface.state.paddingVertical}
      width="100%"
    >
      <Text
        color="$textPrimary"
        fontSize={surface.state.titleFontSize}
        fontWeight="700"
        lineHeight={surface.state.titleLineHeight}
        textAlign="center"
      >
        {title}
      </Text>
      {description ? (
        <Paragraph
          color="$textSecondary"
          fontSize={surface.state.descriptionFontSize}
          lineHeight={surface.state.descriptionLineHeight}
          maxWidth={420}
          textAlign="center"
        >
          {description}
        </Paragraph>
      ) : null}
      {action}
    </YStack>
  );
}
