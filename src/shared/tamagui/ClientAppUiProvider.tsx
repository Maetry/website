"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { Theme, useTheme } from "tamagui";

import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { getClientAppThemeSubName } from "@/src/shared/tamagui/clientAppTheme";
import {
  detectClientAdaptivePlatform,
  getClientPlatformVariant,
  type ClientPlatformVariant,
} from "@/src/shared/tamagui/clientPlatform";

type ClientAppUiProviderProps = {
  children: ReactNode;
};

const clientAppSurfaceBaseStyle = {
  WebkitTouchCallout: "none" as const,
  boxSizing: "border-box" as const,
  display: "flex",
  flex: 1,
  flexDirection: "column" as const,
  minHeight: "100dvh",
  paddingLeft: "env(safe-area-inset-left, 0px)",
  paddingRight: "env(safe-area-inset-right, 0px)",
  paddingTop: "env(safe-area-inset-top, 0px)",
  width: "100%",
};

function shouldAllowNativeSelection(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return Boolean(
    target.closest(
      'input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"]',
    ),
  );
}

function ClientAppSurfaceChrome({ children }: ClientAppUiProviderProps) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const documentBackground =
    theme.sheetBackground?.val ?? theme.background?.val ?? "#FFFFFF";

  const handleSelectionBlock = (event: SyntheticEvent<HTMLDivElement>) => {
    if (shouldAllowNativeSelection(event.target)) {
      return;
    }

    event.preventDefault();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    const { body, documentElement } = document;
    const previousHtmlBackground = documentElement.style.backgroundColor;
    const previousBodyBackground = body.style.backgroundColor;

    documentElement.style.backgroundColor = documentBackground;
    body.style.backgroundColor = documentBackground;

    return () => {
      documentElement.style.backgroundColor = previousHtmlBackground;
      body.style.backgroundColor = previousBodyBackground;
    };
  }, [documentBackground, mounted]);

  return (
    <div
      className="booking-no-select"
      onDragStart={handleSelectionBlock}
      onMouseDown={handleSelectionBlock}
      style={
        mounted
          ? {
              ...clientAppSurfaceBaseStyle,
              backgroundColor: documentBackground,
            }
          : clientAppSurfaceBaseStyle
      }
    >
      {children}
    </div>
  );
}

export function ClientAppUiProvider({ children }: ClientAppUiProviderProps) {
  const platformInfo = usePlatform();
  const ssrPlatform: ClientPlatformVariant = platformInfo.isAndroid
    ? "android"
    : "ios";

  const platform = useMemo(
    () =>
      typeof window === "undefined"
        ? ssrPlatform
        : getClientPlatformVariant(detectClientAdaptivePlatform()),
    [ssrPlatform],
  );

  return (
    <Theme name={getClientAppThemeSubName(platform)}>
      <ClientAppSurfaceChrome>{children}</ClientAppSurfaceChrome>
    </Theme>
  );
}
