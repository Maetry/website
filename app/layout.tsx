import { Manrope } from "next/font/google";

import "@/styles/globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Middleware обрабатывает редирект на локализованные маршруты
  return (
    <html className={manrope.className}>
      <head>
        <link rel="icon" sizes="16x16" href="/images/favicon.png" />
        <link rel="icon" sizes="32x32" href="/images/favicon.png" />
      </head>
      <body className="dark:bg-dark-bg dark:text-dark-text flex flex-col relative">
        {children}
      </body>
    </html>
  );
}
