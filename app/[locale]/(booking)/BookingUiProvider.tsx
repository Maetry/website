"use client";

import { useEffect, useMemo, type ReactNode, type SyntheticEvent } from "react";

import { TamaguiProvider, Theme } from "tamagui";

import tamaguiConfig from "@/lib/tamagui.config";
import {
  detectBookingAdaptivePlatform,
  getBookingThemeName,
} from "@/src/features/booking/utils/platform";

type BookingUiProviderProps = {
  children: ReactNode;
};

const themeDocumentBackgrounds = {
  booking_android: "#F5F5F5",
  booking_ios: "#F2F2F7",
  booking_web_android: "#F5F5F5",
  booking_web_ios: "#F2F2F7",
} as const;

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

export function BookingUiProvider({ children }: BookingUiProviderProps) {
  const themeName = useMemo(
    () => getBookingThemeName(detectBookingAdaptivePlatform()),
    [],
  );
  const documentBackground = themeDocumentBackgrounds[themeName];

  const handleSelectionBlock = (event: SyntheticEvent<HTMLDivElement>) => {
    if (shouldAllowNativeSelection(event.target)) {
      return;
    }

    event.preventDefault();
  };

  useEffect(() => {
    const { body, documentElement } = document;
    const previousHtmlBackground = documentElement.style.backgroundColor;
    const previousBodyBackground = body.style.backgroundColor;

    documentElement.style.backgroundColor = documentBackground;
    body.style.backgroundColor = documentBackground;

    return () => {
      documentElement.style.backgroundColor = previousHtmlBackground;
      body.style.backgroundColor = previousBodyBackground;
    };
  }, [documentBackground]);

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <Theme name={themeName}>
        <div
          className="booking-no-select"
          onDragStart={handleSelectionBlock}
          onMouseDown={handleSelectionBlock}
          style={{
            WebkitTouchCallout: "none",
            backgroundColor: documentBackground,
            boxSizing: "border-box",
            display: "flex",
            flex: 1,
            flexDirection: "column",
            minHeight: "100dvh",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            paddingLeft: "env(safe-area-inset-left, 0px)",
            paddingRight: "env(safe-area-inset-right, 0px)",
            paddingTop: "env(safe-area-inset-top, 0px)",
            width: "100%",
          }}
        >
          {children}
        </div>
      </Theme>
    </TamaguiProvider>
  );
}
