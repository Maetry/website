import "@tamagui/core/reset.css";

import type { Viewport } from "next";

import { BookingUiProvider } from "./BookingUiProvider";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BookingUiProvider>{children}</BookingUiProvider>;
}
