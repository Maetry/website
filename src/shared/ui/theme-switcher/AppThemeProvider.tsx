"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  applyResolvedTheme,
  getStoredThemePreference,
  getSystemResolvedTheme,
  persistThemePreference,
  resolveThemePreference,
  type ResolvedTheme,
  type ThemePreference,
} from "./theme";

type ThemeSettingValue = {
  current: ThemePreference;
  set: (next: ThemePreference) => void;
};

const ThemeSettingContext = createContext<ThemeSettingValue | null>(null);

export function useThemeSetting(): ThemeSettingValue | null {
  return useContext(ThemeSettingContext);
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const storedPreference = getStoredThemePreference();
    const systemResolvedTheme = getSystemResolvedTheme();

    setPreference(storedPreference);
    setResolvedTheme(
      resolveThemePreference(storedPreference, systemResolvedTheme === "dark"),
    );
  }, []);

  useEffect(() => {
    persistThemePreference(preference);
    setResolvedTheme(
      resolveThemePreference(preference, getSystemResolvedTheme() === "dark"),
    );
  }, [preference]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncResolvedTheme = () => {
      setResolvedTheme(
        resolveThemePreference(preference, mediaQuery.matches),
      );
    };

    syncResolvedTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncResolvedTheme);

      return () => {
        mediaQuery.removeEventListener("change", syncResolvedTheme);
      };
    }

    mediaQuery.addListener(syncResolvedTheme);

    return () => {
      mediaQuery.removeListener(syncResolvedTheme);
    };
  }, [preference]);

  const themeSetting = useMemo<ThemeSettingValue>(
    () => ({
      current: preference,
      set: setPreference,
    }),
    [preference],
  );

  useEffect(() => {
    applyResolvedTheme(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <ThemeSettingContext.Provider value={themeSetting}>
      {children}
    </ThemeSettingContext.Provider>
  );
}
