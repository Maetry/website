import { defaultConfig } from "@tamagui/config/v4";
import { createTamagui } from "tamagui";

import { createClientAppTheme } from "@/src/shared/tamagui/clientAppTheme";

const tamaguiConfig = createTamagui({
  ...defaultConfig,
  settings: {
    ...defaultConfig.settings,
    styleCompat: "react-native",
  },
  themes: {
    ...defaultConfig.themes,
    light_client_android: createClientAppTheme("android", "light"),
    dark_client_android: createClientAppTheme("android", "dark"),
    light_client_ios: createClientAppTheme("ios", "light"),
    dark_client_ios: createClientAppTheme("ios", "dark"),
  },
});

export type AppTamaguiConfig = typeof tamaguiConfig;

export default tamaguiConfig;
