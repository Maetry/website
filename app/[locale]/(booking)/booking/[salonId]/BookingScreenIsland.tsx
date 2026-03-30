"use client";

import type { ComponentProps } from "react";

import dynamic from "next/dynamic";

const BookingScreen = dynamic(() => import("./BookingScreen"), {
  loading: () => <div style={{ minHeight: "100dvh", width: "100%" }} />,
  ssr: false,
});

export function BookingScreenIsland(
  props: ComponentProps<typeof BookingScreen>,
) {
  return <BookingScreen {...props} />;
}
