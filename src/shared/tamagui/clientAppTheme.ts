import { defaultConfig } from "@tamagui/config/v4";

import type { ClientPlatformVariant } from "@/src/shared/tamagui/clientPlatform";

export type ClientAppAppearance = "dark" | "light";
export type ClientAppThemeTokens = Record<string, string>;

type ClientAppSurfaceStyle = {
  action: {
    buttonMinHeight: number;
    buttonRadius: number;
    pressOpacity?: number;
    textFontSize: number;
    textLineHeight: number;
  };
  details: {
    helperFontSize: number;
    helperLineHeight: number;
    inputMinHeight: number;
  };
  header: {
    avatarSize: number;
    avatarToTextGap: number;
    initialsFontSize: number;
    subtitleFontSize: number;
    subtitleLineHeight: number;
    titleFontSize: number;
    titleFontWeight: "700" | "800";
    titleLineHeight: number;
    titleToSubtitleGap: number;
  };
  layout: {
    rootGap: number;
    rootPaddingBottom?: number;
    rootPaddingHorizontal?: number;
    rootPaddingTop?: number;
    rootPaddingUniform?: number;
    sectionGapToken: "$2" | "$2.5";
  };
  master: {
    avatarSize: number;
    rowLeadingGap: number;
  };
  row: {
    buttonMinHeight: number;
    buttonPaddingHorizontal: number;
    buttonPaddingVertical: number;
    ctaFontSize: number;
    indicatorFontSize: number;
    indicatorLineHeight: number;
    staticPaddingHorizontal: number;
    staticPaddingVertical: number;
    subtitleFontSize: number;
    subtitleLineHeight: number;
    titleFontSize: number;
    titleLineHeight: number;
    overlineFontSize: number;
    overlineLineHeight: number;
  };
  section: {
    bodyGapToken: "$2" | "$2.5";
    cardRadius: number;
    descriptionFontSize: number;
    descriptionLineHeight: number;
    headerPaddingX: number;
    labelFontSize: number;
    labelLineHeight: number;
    shadowColorToken: "$handleColor" | "$separator";
    shadowElevation?: number;
    shadowOffsetHeight?: number;
    shadowOffsetWidth?: number;
    shadowOpacity?: number;
    shadowRadius?: number;
  };
  state: {
    descriptionFontSize: number;
    descriptionLineHeight: number;
    paddingVertical: number;
    titleFontSize: number;
    titleLineHeight: number;
  };
  summary: {
    footerFontSize: number;
    footerLineHeight: number;
    rowPaddingVertical: number;
    totalFontSize: number;
    totalLineHeight: number;
  };
  time: {
    calendarDayButtonSize: number;
    calendarWeekChipWidth: number;
    emptyHintFontSize: number;
    emptyHintLineHeight: number;
    emptyTitleFontSize: number;
    monthTitleFontSize: number;
    monthTitleLineHeight: number;
    slotChipRadius: number;
  };
  visit: {
    cardRadius: number;
    handleHeight: number;
    handleWidth: number;
    headerButtonSize: number;
    iconBadgeRadius: number;
    iconBadgeSize: number;
  };
};

export const CLIENT_APP_THEME_COLOR_OVERRIDES = {
  android: {
    dark: {
      appBackground: "#131316",
      bookingCategoryExpanded: "#1E1E22",
      bookingCategoryShell: "#131316",
      bookingRowPressBackground: "rgba(255, 255, 255, 0.1)",
      bookingRowSurface: "#1E1E22",
      bookingSlotIdleBg: "rgba(255, 255, 255, 0.08)",
      cardBackground: "#1E1E22",
      chromeBackground: "rgba(30,30,34,0.92)",
      danger: "#FFB4AB",
      gradientEnd: "rgba(19,19,22,1)",
      gradientStart: "rgba(30,30,34,0.98)",
      handleColor: "rgba(202,196,208,0.24)",
      primary: "#0A84FF",
      primarySoft: "rgba(10,132,255,0.18)",
      separator: "#44474E",
      sheetBackground: "#131316",
      textPrimary: "#F3EFF4",
      textSecondary: "#CAC4D0",
      weekendAccent: "#FF5A5F",
    },
    light: {
      appBackground: "#F5F5F5",
      bookingCategoryExpanded: "#FFFFFF",
      bookingCategoryShell: "#F5F5F5",
      bookingRowPressBackground: "rgba(60, 60, 67, 0.12)",
      bookingRowSurface: "#FFFFFF",
      bookingSlotIdleBg: "#F1F5FC",
      cardBackground: "#FFFFFF",
      chromeBackground: "rgba(255,255,255,0.92)",
      danger: "#B3261E",
      gradientEnd: "rgba(232,222,248,1)",
      gradientStart: "rgba(245,245,245,0.98)",
      handleColor: "rgba(73,69,79,0.18)",
      primary: "#007AFF",
      primarySoft: "rgba(0,122,255,0.1)",
      separator: "#E0E0E0",
      sheetBackground: "#F5F5F5",
      textPrimary: "#1C1B1F",
      textSecondary: "#49454F",
      weekendAccent: "#B3261E",
    },
  },
  ios: {
    dark: {
      appBackground: "#000000",
      bookingCategoryExpanded: "#1C1C1E",
      bookingCategoryShell: "#000000",
      bookingRowPressBackground: "rgba(255, 255, 255, 0.12)",
      bookingRowSurface: "#1C1C1E",
      bookingSlotIdleBg: "rgba(255, 255, 255, 0.08)",
      cardBackground: "#1C1C1E",
      chromeBackground: "rgba(28,28,30,0.92)",
      danger: "#FF6961",
      gradientEnd: "rgba(10,10,12,1)",
      gradientStart: "rgba(28,28,30,0.96)",
      handleColor: "rgba(235,235,245,0.24)",
      primary: "#0A84FF",
      primarySoft: "rgba(10,132,255,0.18)",
      separator: "rgba(84,84,88,0.65)",
      sheetBackground: "#000000",
      textPrimary: "#FFFFFF",
      textSecondary: "rgba(235,235,245,0.6)",
      weekendAccent: "#FF5A5F",
    },
    light: {
      appBackground: "rgba(242,242,247,0.96)",
      bookingCategoryExpanded: "#FFFFFF",
      bookingCategoryShell: "rgba(242,242,247,0.96)",
      bookingRowPressBackground: "rgba(60, 60, 67, 0.12)",
      bookingRowSurface: "#FFFFFF",
      bookingSlotIdleBg: "#F1F5FC",
      cardBackground: "#FFFFFF",
      chromeBackground: "rgba(255,255,255,0.92)",
      danger: "#FF5A5F",
      gradientEnd: "rgba(233,233,238,1)",
      gradientStart: "rgba(242,242,247,0.96)",
      handleColor: "rgba(60,60,67,0.18)",
      primary: "#007AFF",
      primarySoft: "rgba(0,122,255,0.1)",
      separator: "rgba(60,60,67,0.29)",
      sheetBackground: "rgba(242,242,247,0.96)",
      textPrimary: "#000000",
      textSecondary: "rgba(60,60,67,0.6)",
      weekendAccent: "#FF5A5F",
    },
  },
} as const satisfies Record<
  ClientPlatformVariant,
  Record<ClientAppAppearance, ClientAppThemeTokens>
>;

const clientAppSurfaceStyles = {
  android: {
    action: {
      buttonMinHeight: 52,
      buttonRadius: 12,
      textFontSize: 17,
      textLineHeight: 22,
    },
    details: {
      helperFontSize: 12,
      helperLineHeight: 16,
      inputMinHeight: 44,
    },
    header: {
      avatarSize: 64,
      avatarToTextGap: 12,
      initialsFontSize: 18,
      subtitleFontSize: 14,
      subtitleLineHeight: 20,
      titleFontSize: 34,
      titleFontWeight: "800",
      titleLineHeight: 34,
      titleToSubtitleGap: 4,
    },
    layout: {
      rootGap: 12,
      rootPaddingUniform: 14,
      sectionGapToken: "$2",
    },
    master: {
      avatarSize: 40,
      rowLeadingGap: 12,
    },
    row: {
      buttonMinHeight: 58,
      buttonPaddingHorizontal: 14,
      buttonPaddingVertical: 12,
      ctaFontSize: 13,
      indicatorFontSize: 14,
      indicatorLineHeight: 16,
      overlineFontSize: 10,
      overlineLineHeight: 12,
      staticPaddingHorizontal: 12,
      staticPaddingVertical: 12,
      subtitleFontSize: 12,
      subtitleLineHeight: 16,
      titleFontSize: 16,
      titleLineHeight: 20,
    },
    section: {
      bodyGapToken: "$2",
      cardRadius: 12,
      descriptionFontSize: 12,
      descriptionLineHeight: 16,
      headerPaddingX: 14,
      labelFontSize: 10,
      labelLineHeight: 12,
      shadowColorToken: "$handleColor",
      shadowElevation: 2,
      shadowOffsetHeight: 2,
      shadowOffsetWidth: 0,
      shadowOpacity: 0.14,
      shadowRadius: 8,
    },
    state: {
      descriptionFontSize: 14,
      descriptionLineHeight: 18,
      paddingVertical: 28,
      titleFontSize: 20,
      titleLineHeight: 24,
    },
    summary: {
      footerFontSize: 12,
      footerLineHeight: 16,
      rowPaddingVertical: 14,
      totalFontSize: 16,
      totalLineHeight: 20,
    },
    time: {
      calendarDayButtonSize: 42,
      calendarWeekChipWidth: 44,
      emptyHintFontSize: 15,
      emptyHintLineHeight: 20,
      emptyTitleFontSize: 18,
      monthTitleFontSize: 16,
      monthTitleLineHeight: 20,
      slotChipRadius: 12,
    },
    visit: {
      cardRadius: 12,
      handleHeight: 5,
      handleWidth: 46,
      headerButtonSize: 44,
      iconBadgeRadius: 12,
      iconBadgeSize: 36,
    },
  },
  ios: {
    action: {
      buttonMinHeight: 50,
      buttonRadius: 999,
      pressOpacity: 0.82,
      textFontSize: 17,
      textLineHeight: 22,
    },
    details: {
      helperFontSize: 13,
      helperLineHeight: 18,
      inputMinHeight: 48,
    },
    header: {
      avatarSize: 56,
      avatarToTextGap: 12,
      initialsFontSize: 17,
      subtitleFontSize: 15,
      subtitleLineHeight: 20,
      titleFontSize: 34,
      titleFontWeight: "700",
      titleLineHeight: 41,
      titleToSubtitleGap: 4,
    },
    layout: {
      rootGap: 16,
      rootPaddingBottom: 18,
      rootPaddingHorizontal: 16,
      rootPaddingTop: 12,
      sectionGapToken: "$2.5",
    },
    master: {
      avatarSize: 40,
      rowLeadingGap: 12,
    },
    row: {
      buttonMinHeight: 64,
      buttonPaddingHorizontal: 18,
      buttonPaddingVertical: 16,
      ctaFontSize: 13,
      indicatorFontSize: 15,
      indicatorLineHeight: 18,
      overlineFontSize: 11,
      overlineLineHeight: 13,
      staticPaddingHorizontal: 16,
      staticPaddingVertical: 12,
      subtitleFontSize: 13,
      subtitleLineHeight: 18,
      titleFontSize: 17,
      titleLineHeight: 22,
    },
    section: {
      bodyGapToken: "$2.5",
      cardRadius: 22,
      descriptionFontSize: 13,
      descriptionLineHeight: 18,
      headerPaddingX: 18,
      labelFontSize: 11,
      labelLineHeight: 13,
      shadowColorToken: "$separator",
      shadowOffsetHeight: 1,
      shadowOffsetWidth: 0,
      shadowOpacity: 0.1,
      shadowRadius: 6,
    },
    state: {
      descriptionFontSize: 15,
      descriptionLineHeight: 20,
      paddingVertical: 36,
      titleFontSize: 22,
      titleLineHeight: 28,
    },
    summary: {
      footerFontSize: 13,
      footerLineHeight: 18,
      rowPaddingVertical: 16,
      totalFontSize: 17,
      totalLineHeight: 22,
    },
    time: {
      calendarDayButtonSize: 44,
      calendarWeekChipWidth: 46,
      emptyHintFontSize: 16,
      emptyHintLineHeight: 22,
      emptyTitleFontSize: 20,
      monthTitleFontSize: 17,
      monthTitleLineHeight: 22,
      slotChipRadius: 22,
    },
    visit: {
      cardRadius: 22,
      handleHeight: 5,
      handleWidth: 46,
      headerButtonSize: 44,
      iconBadgeRadius: 18,
      iconBadgeSize: 36,
    },
  },
} as const satisfies Record<ClientPlatformVariant, ClientAppSurfaceStyle>;

export function createClientAppTheme(
  platform: ClientPlatformVariant,
  appearance: ClientAppAppearance,
): ClientAppThemeTokens {
  return {
    ...defaultConfig.themes[appearance],
    ...CLIENT_APP_THEME_COLOR_OVERRIDES[platform][appearance],
  };
}

export function getClientAppSurfaceStyle(
  platform: ClientPlatformVariant,
): ClientAppSurfaceStyle {
  return clientAppSurfaceStyles[platform];
}

export function getClientAppThemeSubName(
  platform: ClientPlatformVariant,
): "client_android" | "client_ios" {
  return platform === "android" ? "client_android" : "client_ios";
}
