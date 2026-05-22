"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { defaultLocale, isSupportedLocale } from "@/lib/config/i18n";

const copy = {
  en: {
    title: "Page not found",
    cta: "Go to the main page",
  },
  ru: {
    title: "Страница не найдена",
    cta: "Перейти на главную",
  },
  es: {
    title: "Página no encontrada",
    cta: "Ir a la página principal",
  },
} as const;

const NotFound = () => {
  const pathname = usePathname();
  const localeSegment = pathname.split("/")[1];
  const locale = isSupportedLocale(localeSegment) ? localeSegment : defaultLocale;
  const t = copy[locale];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black">
      <div className="flex max-w-md flex-col items-center gap-4">
        <Image
          src="/images/placeholder_error.svg"
          alt={t.title}
          width={280}
          height={280}
          priority
          className="h-auto w-full max-w-[280px]"
        />
        <p className="text-2xl font-semibold md:text-3xl">{t.title}</p>
      </div>
      <Link
        href={locale === defaultLocale ? "/" : `/${locale}`}
        className="rounded-full border border-black px-6 py-3 text-sm font-semibold uppercase tracking-wider transition hover:-translate-y-0.5"
      >
        {t.cta}
      </Link>
    </main>
  );
};

export default NotFound;
