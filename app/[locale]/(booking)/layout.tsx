import "@tamagui/core/reset.css";

import type { ReactNode } from "react";

import { BookingUiProvider } from "./BookingUiProvider";

export default function BookingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <BookingUiProvider>{children}</BookingUiProvider>;
}
