"use client";

import type { ReactNode } from "react";

import { Paragraph, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import {
  BookingSectionBody,
  SectionCard,
  SectionLabel,
  bookingSectionHeaderPaddingX,
} from "./primitives";

type BookingSectionSharedProps = {
  children: ReactNode;
  description?: string | null;
  footer?: ReactNode;
  platform: BookingPlatformVariant;
  title: string;
};

function BookingSectionLayout({
  children,
  description,
  footer,
  platform,
  title,
}: BookingSectionSharedProps) {
  const surface = getBookingSurfaceStyle(platform);
  const inset = bookingSectionHeaderPaddingX(platform);
  const cardBlock =
    footer != null ? (
      <YStack gap={0} width="100%">
        <SectionCard platform={platform}>{children}</SectionCard>
        <YStack paddingHorizontal={inset} paddingTop="$2" width="100%">
          {footer}
        </YStack>
      </YStack>
    ) : (
      <SectionCard platform={platform}>{children}</SectionCard>
    );

  return (
    <BookingSectionBody platform={platform}>
      <YStack gap="$1" paddingHorizontal={inset}>
        <SectionLabel color="$textSecondary" platform={platform}>
          {title}
        </SectionLabel>
        {description ? (
          <Paragraph
            color="$textSecondary"
            fontSize={surface.section.descriptionFontSize}
            lineHeight={surface.section.descriptionLineHeight}
            size="$3"
          >
            {description}
          </Paragraph>
        ) : null}
      </YStack>
      {cardBlock}
    </BookingSectionBody>
  );
}

export function BookingSection(props: BookingSectionSharedProps) {
  return <BookingSectionLayout {...props} />;
}

/**
 * Отдельный экспорт для явных plain-секций, но визуально он совпадает с базовой booking surface.
 */
export function BookingSectionPlain(props: BookingSectionSharedProps) {
  return <BookingSectionLayout {...props} />;
}
