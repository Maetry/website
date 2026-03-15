export const THEME_STORAGE_KEY = "Theme";

export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export function normalizeThemePreference(
  value: string | null | undefined,
): ThemePreference {
  if (value === "light" || value === "dark") {
    return value;
  }

  return "system";
}

export function resolveThemePreference(
  preference: ThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === "system") {
    return prefersDark ? "dark" : "light";
  }

  return preference;
}

export function getStoredThemePreference(): ThemePreference {
  if (typeof window === "undefined") {
    return "system";
  }

  return normalizeThemePreference(window.localStorage.getItem(THEME_STORAGE_KEY));
}

export function persistThemePreference(preference: ThemePreference): void {
  if (typeof window === "undefined") {
    return;
  }

  if (preference === "system") {
    window.localStorage.removeItem(THEME_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, preference);
}

export function applyResolvedTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.themeResolved = theme;
}

export function getSystemResolvedTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getThemeInitializationScript(): string {
  return `
    (function () {
      try {
        var storageKey = "${THEME_STORAGE_KEY}";
        var stored = window.localStorage.getItem(storageKey);
        var preference = stored === "light" || stored === "dark" ? stored : "system";
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var resolved = preference === "system"
          ? (prefersDark ? "dark" : "light")
          : preference;
        var root = document.documentElement;
        root.classList.toggle("dark", resolved === "dark");
        root.dataset.themeResolved = resolved;
      } catch (error) {
        document.documentElement.classList.remove("dark");
        document.documentElement.dataset.themeResolved = "light";
      }
    })();
  `;
}
