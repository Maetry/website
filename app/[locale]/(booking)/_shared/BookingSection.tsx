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
  headerAction?: ReactNode;
  platform: BookingPlatformVariant;
  title: string;
};

function BookingSectionLayout({
  children,
  description,
  footer,
  headerAction,
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
    <BookingSectionBody>
      <YStack gap={0} paddingHorizontal={inset}>
        <YStack
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          minHeight={44}
        >
          <SectionLabel color="$textSecondary" platform={platform}>
            {title}
          </SectionLabel>
          {headerAction}
        </YStack>
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
