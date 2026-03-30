import { Button, Text, YStack, styled } from "tamagui";

import {
  getBookingSurfaceStyle,
} from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

const androidSurface = getBookingSurfaceStyle("android");
const iosSurface = getBookingSurfaceStyle("ios");

export const BOOKING_MASTER_AVATAR_PX = iosSurface.master.avatarSize;
export const BOOKING_ROW_LEADING_GAP_PX = iosSurface.master.rowLeadingGap;

export function bookingSectionHeaderPaddingX(
  platform: BookingPlatformVariant,
): number {
  return getBookingSurfaceStyle(platform).section.headerPaddingX;
}

export const SheetRoot = styled(YStack, {
  backgroundColor: "$appBackground",
  flex: 1,
  width: "100%",
  variants: {
    platform: {
      android: {
        gap: androidSurface.layout.rootGap,
        padding: androidSurface.layout.rootPaddingUniform,
      },
      ios: {
        gap: iosSurface.layout.rootGap,
        paddingBottom: iosSurface.layout.rootPaddingBottom,
        paddingHorizontal: iosSurface.layout.rootPaddingHorizontal,
        paddingTop: iosSurface.layout.rootPaddingTop,
      },
    },
  } as const,
});

export const SectionLabel = styled(Text, {
  color: "$textSecondary",
  fontWeight: "600",
  letterSpacing: 0.2,
  textTransform: "uppercase",
  variants: {
    platform: {
      android: {
        fontSize: androidSurface.section.labelFontSize,
        lineHeight: androidSurface.section.labelLineHeight,
      },
      ios: {
        fontSize: iosSurface.section.labelFontSize,
        lineHeight: iosSurface.section.labelLineHeight,
      },
    },
  } as const,
});

/** Заголовок секции + карточка: вертикальный gap зависит от платформы. */
export const BookingSectionBody = styled(YStack, {
  width: "100%",
  variants: {
    platform: {
      android: {
        gap: androidSurface.section.bodyGapToken,
      },
      ios: {
        gap: iosSurface.section.bodyGapToken,
      },
    },
  } as const,
});

export const SectionCard = styled(YStack, {
  backgroundColor: "$cardBackground",
  overflow: "hidden",
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: androidSurface.section.cardRadius,
        elevation: androidSurface.section.shadowElevation,
        shadowColor: androidSurface.section.shadowColorToken,
        shadowOffset: {
          height: androidSurface.section.shadowOffsetHeight ?? 0,
          width: androidSurface.section.shadowOffsetWidth ?? 0,
        },
        shadowOpacity: androidSurface.section.shadowOpacity,
        shadowRadius: androidSurface.section.shadowRadius,
      },
      ios: {
        borderRadius: iosSurface.section.cardRadius,
        shadowColor: iosSurface.section.shadowColorToken,
        shadowOffset: {
          height: iosSurface.section.shadowOffsetHeight ?? 0,
          width: iosSurface.section.shadowOffsetWidth ?? 0,
        },
        shadowOpacity: iosSurface.section.shadowOpacity,
        shadowRadius: iosSurface.section.shadowRadius,
      },
    },
  } as const,
});

export const RowButton = styled(Button, {
  alignItems: "stretch",
  backgroundColor: "$cardBackground",
  borderRadius: 0,
  chromeless: true,
  justifyContent: "flex-start",
  width: "100%",
  variants: {
    platform: {
      android: {
        minHeight: androidSurface.row.buttonMinHeight,
        paddingHorizontal: androidSurface.row.buttonPaddingHorizontal,
        paddingVertical: androidSurface.row.buttonPaddingVertical,
        pressStyle: {
          backgroundColor: "$separator",
        },
      },
      ios: {
        minHeight: iosSurface.row.buttonMinHeight,
        paddingHorizontal: iosSurface.row.buttonPaddingHorizontal,
        paddingVertical: iosSurface.row.buttonPaddingVertical,
        pressStyle: {
          opacity: 0.74,
        },
      },
    },
    selected: {
      true: {
        backgroundColor: "$primarySoft",
      },
    },
  } as const,
});

export const PrimaryAction = styled(Button, {
  backgroundColor: "$primary",
  /** Не подменять на серый при disabled — остаётся синий primary с прозрачностью. */
  disabledStyle: {
    backgroundColor: "$primary",
    opacity: 0.42,
  },
  width: "100%",
  variants: {
    platform: {
      android: {
        borderRadius: androidSurface.action.buttonRadius,
        minHeight: androidSurface.action.buttonMinHeight,
      },
      ios: {
        borderRadius: iosSurface.action.buttonRadius,
        minHeight: iosSurface.action.buttonMinHeight,
        pressStyle: {
          opacity: iosSurface.action.pressOpacity,
        },
      },
    },
  } as const,
});
