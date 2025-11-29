import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

import { mapLanguageToLocale } from "@/lib/config/i18n";

export default async function LinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const acceptLanguage = headersList.get("accept-language");
  
  // Определяем локаль из Accept-Language заголовка
  const locale = mapLanguageToLocale(acceptLanguage);
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  );
}

