import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

const bookingIosTheme = {
  ...defaultConfig.themes.light,
  appBackground: "#F2F2F7",
  cardBackground: "#FFFFFF",
  primary: "#007AFF",
  separator: "rgba(60,60,67,0.29)",
  sheetBackground: "#F2F2F7",
  textPrimary: "#000000",
  textSecondary: "rgba(60,60,67,0.6)",
};

const bookingAndroidTheme = {
  ...defaultConfig.themes.light,
  appBackground: "#F5F5F5",
  cardBackground: "#FFFFFF",
  primary: "#6750A4",
  separator: "#E0E0E0",
  sheetBackground: "#F5F5F5",
  textPrimary: "#1C1B1F",
  textSecondary: "#49454F",
};

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  themes: {
    ...defaultConfig.themes,
    booking_android: bookingAndroidTheme,
    booking_ios: bookingIosTheme,
    booking_web_android: bookingAndroidTheme,
    booking_web_ios: bookingIosTheme,
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

export default tamaguiConfig;
