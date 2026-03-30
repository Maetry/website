"use client";

import { useEffect } from "react";

import {
  NextThemeProvider,
  type ThemeProviderProps,
  useRootTheme,
  useThemeSetting,
} from "@tamagui/next-theme";
import { TamaguiProvider } from "tamagui";

import tamaguiConfig from "@/lib/tamagui.config";

import { THEME_STORAGE_KEY } from "./theme";

function RootThemeBridge() {
  const settings = useThemeSetting();
  const resolvedTheme = settings?.resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.dataset.themeResolved = resolvedTheme;
  }, [resolvedTheme]);

  return null;
}

/** Root provider по модели Tamagui: NextThemeProvider управляет light/dark, Tamagui читает root theme из него. */
export function AppThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [rootTheme, setRootTheme] = useRootTheme({ fallback: "light" });

  return (
    <NextThemeProvider
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      onChangeTheme={(name) => {
        if (name === "dark" || name === "light") {
          setRootTheme(name);
        }
      }}
      storageKey={THEME_STORAGE_KEY}
      value={{
        dark: "t_dark",
        light: "t_light",
      }}
      {...props}
    >
      <TamaguiProvider config={tamaguiConfig} defaultTheme={rootTheme}>
        <RootThemeBridge />
        {children}
      </TamaguiProvider>
    </NextThemeProvider>
  );
}
