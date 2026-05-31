"use client";

import {
  useEffect,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from "react";

import { TamaguiProvider, Theme, useTheme } from "tamagui";

import tamaguiConfig from "@/lib/tamagui.config";
import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import {
  getClientAppThemeName,
  type ClientAppAppearance,
} from "@/src/shared/tamagui/clientAppTheme";
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

function getSystemAppearance(): ClientAppAppearance {
  if (typeof window === "undefined") {
    return "light";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
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
  const [platform, setPlatform] = useState<ClientPlatformVariant>(ssrPlatform);
  const [appearance, setAppearance] = useState<ClientAppAppearance>(
    getSystemAppearance,
  );

  useEffect(() => {
    const clientPlatform = getClientPlatformVariant(detectClientAdaptivePlatform());

    setPlatform((currentPlatform) =>
      currentPlatform === clientPlatform ? currentPlatform : clientPlatform,
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const syncAppearance = () => {
      setAppearance(mediaQuery.matches ? "dark" : "light");
    };

    syncAppearance();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncAppearance);

      return () => {
        mediaQuery.removeEventListener("change", syncAppearance);
      };
    }

    mediaQuery.addListener(syncAppearance);

    return () => {
      mediaQuery.removeListener(syncAppearance);
    };
  }, []);

  const themeName = getClientAppThemeName(platform, appearance);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={appearance}>
      <Theme name={themeName}>
        <ClientAppSurfaceChrome>{children}</ClientAppSurfaceChrome>
      </Theme>
    </TamaguiProvider>
  );
}
