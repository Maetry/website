"use client";

import { useEffect, useState } from "react";

import { useThemeSetting } from "./AppThemeProvider";
import type { ThemePreference } from "./theme";

type ThemeSwitcherProps = {
  variant?: "default" | "onDark";
};

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ variant = "default" }) => {
  const onDark = variant === "onDark";
  const themeSetting = useThemeSetting();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = (next: ThemePreference) => {
    themeSetting?.set(next);
  };

  if (!mounted) {
    return (
      <div
        className={`flex h-9 min-w-[120px] items-center rounded-md p-0.5 ${
          onDark ? "border border-white/20 bg-white/10" : "rounded-lg bg-gray-100 dark:bg-gray-800"
        }`}
      />
    );
  }

  const currentTheme = (themeSetting?.current ?? "system") as ThemePreference;

  const shellClass = onDark
    ? "flex items-center rounded-md border border-white/20 bg-white/10 p-0.5"
    : "flex items-center rounded-lg bg-gray-100 p-0.5 dark:bg-gray-800";

  const inactiveBtn = onDark
    ? "text-white/60 hover:text-white"
    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white";

  const activeBtn = onDark
    ? "bg-white/20 text-white shadow-sm"
    : "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white";

  return (
    <div className={shellClass}>
      <button
        type="button"
        onClick={() => handleThemeChange("system")}
        className={`rounded-md p-2 transition-colors ${
          currentTheme === "system" ? activeBtn : inactiveBtn
        }`}
        title="System"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v1h12v-1l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        className={`rounded-md p-2 transition-colors ${
          currentTheme === "light" ? activeBtn : inactiveBtn
        }`}
        title="Light"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        className={`rounded-md p-2 transition-colors ${
          currentTheme === "dark" ? activeBtn : inactiveBtn
        }`}
        title="Dark"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
        </svg>
      </button>
    </div>
  );
};

export default ThemeSwitcher;
