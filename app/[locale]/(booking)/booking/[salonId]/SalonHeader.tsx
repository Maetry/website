"use client";

import { useTranslations } from "next-intl";
import { Anchor, Avatar, Paragraph, Text, XStack, YStack, useTheme } from "tamagui";

import type { PublicSalonProfile } from "@/lib/api/public-booking";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { getInitials } from "../../_shared/formatting";

type SalonHeaderSkeletonProps = {
  platform: BookingPlatformVariant;
};

export function SalonHeaderSkeleton({ platform }: SalonHeaderSkeletonProps) {
  const t = useTranslations("booking");
  const theme = useTheme();
  const surface = getBookingSurfaceStyle(platform);
  const avatarSize = surface.header.avatarSize;
  const rowGap = surface.header.avatarToTextGap;
  const titleGap = surface.header.titleToSubtitleGap;
  const titleH = surface.header.titleLineHeight;
  const subH = surface.header.subtitleLineHeight;
  const track = theme.handleColor?.val;

  return (
    <XStack
      alignItems="center"
      aria-busy
      aria-label={t("loading.salon")}
      gap={rowGap}
      role="status"
      width="100%"
    >
      <YStack
        backgroundColor={track}
        borderRadius={999}
        height={avatarSize}
        width={avatarSize}
      />
      <YStack flex={1} gap={titleGap}>
        <YStack
          backgroundColor={track}
          borderRadius={6}
          height={titleH}
          maxWidth="78%"
          width="100%"
        />
        <YStack
          backgroundColor={track}
          borderRadius={6}
          height={subH}
          maxWidth="100%"
          width="100%"
        />
      </YStack>
    </XStack>
  );
}

type SalonHeaderProps = {
  mapAddressUrl: string | null;
  platform: BookingPlatformVariant;
  salonAddress: string | undefined;
  salonName: string;
  salonProfile: PublicSalonProfile | null;
};

export function SalonHeader({
  mapAddressUrl,
  platform,
  salonAddress,
  salonName,
  salonProfile,
}: SalonHeaderProps) {
  const t = useTranslations("booking");
  const surface = getBookingSurfaceStyle(platform);

  return (
    <XStack
      alignItems="center"
      gap={surface.header.avatarToTextGap}
    >
      <Avatar
        circular
        size={surface.header.avatarSize}
      >
        <Avatar.Image src={salonProfile?.logo ?? undefined} />
        <Avatar.Fallback alignItems="center" justifyContent="center">
          <Text
            color="$primary"
            fontSize={surface.header.initialsFontSize}
            fontWeight="700"
          >
            {getInitials(salonName)}
          </Text>
        </Avatar.Fallback>
      </Avatar>

      <YStack
        flex={1}
        gap={surface.header.titleToSubtitleGap}
      >
        <Text
          color="$textPrimary"
          fontSize={surface.header.titleFontSize}
          fontWeight={surface.header.titleFontWeight}
          lineHeight={surface.header.titleLineHeight}
        >
          {salonName}
        </Text>
        {mapAddressUrl ? (
          <Anchor
            alignSelf="flex-start"
            color="$textSecondary"
            display="block"
            fontSize={surface.header.subtitleFontSize}
            href={mapAddressUrl}
            hoverStyle={{ opacity: 0.72 }}
            lineHeight={surface.header.subtitleLineHeight}
            pressStyle={{ opacity: 0.72 }}
            rel="noopener noreferrer"
            target="_blank"
            textDecorationLine="none"
          >
            {salonAddress}
          </Anchor>
        ) : (
          <Paragraph
            color="$textSecondary"
            fontSize={surface.header.subtitleFontSize}
            lineHeight={surface.header.subtitleLineHeight}
          >
            {salonAddress ?? t("subtitle")}
          </Paragraph>
        )}
      </YStack>
    </XStack>
  );
}
