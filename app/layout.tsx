import type { ReactNode } from "react";

import { Manrope } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";

import "@/styles/globals.css";
import { getThemeInitializationScript } from "@/shared/ui/theme-switcher/theme";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Middleware обрабатывает редирект на локализованные маршруты
  return (
    <html
      lang="en"
      className={manrope.className}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" sizes="16x16" href="/images/favicon.png" />
        <link rel="icon" sizes="32x32" href="/images/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getThemeInitializationScript(),
          }}
        />
      </head>
      <body className="dark:bg-dark-bg dark:text-dark-text flex flex-col relative">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
