import "@tamagui/core/reset.css";

import type { Viewport } from "next";

import { ClientAppUiProvider } from "@/src/shared/tamagui/ClientAppUiProvider";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientAppUiProvider>{children}</ClientAppUiProvider>;
}
