"use client";

import { useEffect } from "react";

import { setTheme } from "@/entities/theme";
import { useAppDispatch } from "@/lib/hooks";

import {
  THEME_STORAGE_KEY,
  applyResolvedTheme,
  getStoredThemePreference,
  resolveThemePreference,
} from "./theme";

const ThemeBootstrap = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncTheme = () => {
      const preference = getStoredThemePreference();
      const resolved = resolveThemePreference(preference, mediaQuery.matches);

      applyResolvedTheme(resolved);
      dispatch(setTheme(resolved === "dark"));
    };

    const handleSystemThemeChange = () => {
      if (getStoredThemePreference() === "system") {
        syncTheme();
      }
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === null || event.key === THEME_STORAGE_KEY) {
        syncTheme();
      }
    };

    syncTheme();
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [dispatch]);

  return null;
};

export default ThemeBootstrap;
