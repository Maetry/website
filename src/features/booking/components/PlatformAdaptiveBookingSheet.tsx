"use client";

import { useMemo } from "react";

import {
  Button,
  Paragraph,
  Separator,
  Spinner,
  Text,
  Theme,
  XStack,
  YStack,
  styled,
} from "tamagui";

import {
  detectBookingAdaptivePlatform,
  getBookingPlatformVariant,
  getBookingThemeName,
} from "@/src/features/booking/utils/platform";
import type {
  BookingAdaptivePlatform as AdaptivePlatform,
  BookingPlatformVariant as PlatformVariant,
} from "@/src/features/booking/utils/platform";

type BookingOption = {
  id: string;
  label: string;
  subtitle?: string;
};

type BookingServiceInfo = {
  duration?: string;
  price?: string;
  specialist?: string;
  title: string;
};

type PlatformAdaptiveBookingSheetProps = {
  confirmLabel: string;
  dateOptions: BookingOption[];
  loading?: boolean;
  onConfirm: () => void;
  onSelectDate: (dateId: string) => void;
  onSelectTime: (timeId: string) => void;
  selectedDateId?: string | null;
  selectedTimeId?: string | null;
  service: BookingServiceInfo;
  timeOptions: BookingOption[];
};

const SheetRoot = styled(YStack, {
  name: "BookingSheetRoot",
  backgroundColor: "$sheetBackground",
  minHeight: "100%",
  width: "100%",
  variants: {
    platform: {
      android: {
        gap: 12,
        padding: 14,
      },
      ios: {
        gap: 16,
        padding: 18,
      },
    },
  } as const,
});

const SectionBlock = styled(YStack, {
  name: "BookingSectionBlock",
  width: "100%",
  variants: {
    platform: {
      android: {
        gap: 10,
      },
      ios: {
        gap: 12,
      },
    },
  } as const,
});

const SectionCard = styled(YStack, {
  name: "BookingSectionCard",
  backgroundColor: "$cardBackground",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        elevation: 3,
        shadowColor: "$separator",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.24,
        shadowRadius: 8,
      },
      ios: {
        borderRadius: 16,
        shadowColor: "$separator",
        shadowOffset: { height: 1, width: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
    },
  } as const,
});

const SectionTitle = styled(Text, {
  name: "BookingSectionTitle",
  color: "$textPrimary",
  fontWeight: "700",
  variants: {
    platform: {
      android: {
        fontSize: 18,
      },
      ios: {
        fontSize: 20,
      },
    },
  } as const,
});

const PrimaryText = styled(Text, {
  name: "BookingPrimaryText",
  color: "$textPrimary",
});

const SecondaryText = styled(Paragraph, {
  name: "BookingSecondaryText",
  color: "$textSecondary",
});

const SelectorButton = styled(Button, {
  name: "BookingSelectorButton",
  alignItems: "center",
  backgroundColor: "$cardBackground",
  chromeless: true,
  justifyContent: "space-between",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderColor: "$separator",
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 12,
        pressStyle: {
          backgroundColor: "$separator",
        },
      },
      ios: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        pressStyle: {
          opacity: 0.7,
        },
      },
    },
    selected: {
      true: {
        backgroundColor: "$appBackground",
        borderColor: "$primary",
        shadowColor: "$primary",
        shadowOffset: { height: 2, width: 0 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
    },
  } as const,
});

const ConfirmButton = styled(Button, {
  name: "BookingConfirmButton",
  backgroundColor: "$primary",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: 8,
        elevation: 2,
        minHeight: 52,
      },
      ios: {
        borderRadius: 14,
        minHeight: 56,
        pressStyle: {
          opacity: 0.82,
        },
      },
    },
  } as const,
});

const OptionSeparator = styled(Separator, {
  name: "BookingOptionSeparator",
  backgroundColor: "$separator",
  variants: {
    platform: {
      android: {
        display: "none",
      },
      ios: {
        marginLeft: 16,
      },
    },
  } as const,
});

function renderSelectorRow(
  option: BookingOption,
  selected: boolean,
  onPress: () => void,
  platform: PlatformVariant,
) {
  return (
    <YStack key={option.id}>
      <SelectorButton
        onPress={onPress}
        platform={platform}
        selected={selected}
      >
        <XStack alignItems="center" justifyContent="space-between" width="100%">
          <YStack flex={1} gap={4}>
            <PrimaryText
              color={selected ? "$primary" : "$textPrimary"}
              fontSize={16}
              fontWeight="600"
            >
              {option.label}
            </PrimaryText>
            {option.subtitle ? (
              <SecondaryText size="$3">{option.subtitle}</SecondaryText>
            ) : null}
          </YStack>
          {selected ? (
            <PrimaryText color="$primary" fontSize={15} fontWeight="700">
              Selected
            </PrimaryText>
          ) : null}
        </XStack>
      </SelectorButton>
      <OptionSeparator platform={platform} />
    </YStack>
  );
}

export function PlatformAdaptiveBookingSheet({
  confirmLabel,
  dateOptions,
  loading = false,
  onConfirm,
  onSelectDate,
  onSelectTime,
  selectedDateId,
  selectedTimeId,
  service,
  timeOptions,
}: PlatformAdaptiveBookingSheetProps) {
  const adaptivePlatform = useMemo(detectBookingAdaptivePlatform, []);
  const platformVariant = getBookingPlatformVariant(adaptivePlatform);
  const themeName = getBookingThemeName(adaptivePlatform);
  const confirmDisabled = loading || !selectedDateId || !selectedTimeId;

  return (
    <Theme name={themeName}>
      <SheetRoot platform={platformVariant}>
        <SectionBlock platform={platformVariant}>
          <SectionTitle platform={platformVariant}>Service</SectionTitle>
          <SectionCard platform={platformVariant}>
            <YStack gap={platformVariant === "ios" ? 14 : 10} padding={16}>
              <PrimaryText fontSize={18} fontWeight="700">
                {service.title}
              </PrimaryText>
              {service.specialist ? (
                <SecondaryText size="$4">{service.specialist}</SecondaryText>
              ) : null}
              <XStack justifyContent="space-between">
                {service.duration ? (
                  <SecondaryText size="$3">{service.duration}</SecondaryText>
                ) : <YStack />}
                {service.price ? (
                  <PrimaryText color="$primary" fontSize={16} fontWeight="700">
                    {service.price}
                  </PrimaryText>
                ) : null}
              </XStack>
            </YStack>
          </SectionCard>
        </SectionBlock>

        <SectionBlock platform={platformVariant}>
          <SectionTitle platform={platformVariant}>Date</SectionTitle>
          <SectionCard platform={platformVariant}>
            {dateOptions.map((option) =>
              renderSelectorRow(
                option,
                option.id === selectedDateId,
                () => onSelectDate(option.id),
                platformVariant,
              ),
            )}
          </SectionCard>
        </SectionBlock>

        <SectionBlock platform={platformVariant}>
          <SectionTitle platform={platformVariant}>Time</SectionTitle>
          <SectionCard platform={platformVariant}>
            {timeOptions.map((option) =>
              renderSelectorRow(
                option,
                option.id === selectedTimeId,
                () => onSelectTime(option.id),
                platformVariant,
              ),
            )}
          </SectionCard>
        </SectionBlock>

        <ConfirmButton
          disabled={confirmDisabled}
          onPress={onConfirm}
          platform={platformVariant}
        >
          <XStack alignItems="center" gap={10}>
            {loading ? <Spinner color="$cardBackground" /> : null}
            <Text color="$cardBackground" fontSize={16} fontWeight="700">
              {loading ? "Loading..." : confirmLabel}
            </Text>
          </XStack>
        </ConfirmButton>
      </SheetRoot>
    </Theme>
  );
}

export type {
  AdaptivePlatform,
  BookingOption,
  BookingServiceInfo,
  PlatformAdaptiveBookingSheetProps,
};
