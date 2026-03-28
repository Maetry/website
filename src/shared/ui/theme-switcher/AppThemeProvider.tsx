"use client";

import { ThemeProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

import { THEME_STORAGE_KEY } from "./theme";

/** Общий next-themes: тот же ключ localStorage, что и у ThemeSwitcher / theme-init */
export function AppThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
      {...props}
    >
      {children}
    </ThemeProvider>
  );
}
