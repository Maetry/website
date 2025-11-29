"use client";

import Image from "next/image";
import Link from "next/link";

import { useTranslations } from "next-intl";

import type { LinkKind } from "@/lib/api/shortLink";
import { useTracking } from "@/lib/tracking/useTracking";
import appstore from "@/public/images/appstore.svg";
import logo from "@/public/images/logo.svg";
import phones from "@/public/images/phones_customer.png";

type InviteScreenProps = {
  kind: LinkKind;
};

const APP_STORE_BASE_URL = "https://apps.apple.com/app/id6746678571";

// Формирует URL App Store с UTM параметрами
function buildAppStoreUrl(utm?: {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}): string {
  if (!utm || Object.keys(utm).length === 0) {
    return APP_STORE_BASE_URL;
  }

  const url = new URL(APP_STORE_BASE_URL);

  if (utm.source) url.searchParams.set("utm_source", utm.source);
  if (utm.medium) url.searchParams.set("utm_medium", utm.medium);
  if (utm.campaign) url.searchParams.set("utm_campaign", utm.campaign);
  if (utm.term) url.searchParams.set("utm_term", utm.term);
  if (utm.content) url.searchParams.set("utm_content", utm.content);

  return url.toString();
}

const InviteScreen = ({ kind }: InviteScreenProps) => {
  const t = useTranslations("invite");
  const tracking = useTracking();

  // Используем lastTouch UTM параметры, если есть, иначе firstTouch
  const utm = tracking?.lastTouch?.utm || tracking?.firstTouch?.utm;

  // Получаем локализованные тексты
  const headingKey =
    kind === "employeeInvite" || kind === "clientInvite" ? kind : "default";
  const heading = t(`heading.${headingKey}`);
  const subheading = t(`subheading.${headingKey}`);
  const badgeLabel = t(`badgeLabel.${headingKey}`);
  const downloadTitle = t("downloadTitle");
  const downloadDescription = t("downloadDescription");
  const appStoreButtonTitle = t("appStoreButtonTitle");
  const footerCopyright = t("footerCopyright");

  const handleAppStoreClick = async () => {
    // Копируем текущий URL в буфер обмена
    try {
      const currentUrl = window.location.href;
      await navigator.clipboard.writeText(currentUrl);
    } catch (err) {
      console.error("Не удалось скопировать ссылку:", err);
    }

    // Переходим в App Store с UTM параметрами
    const appStoreUrl = buildAppStoreUrl(utm);
    window.location.href = appStoreUrl;
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-black dark:bg-dark-bg dark:text-dark-text">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-dark-bg/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold uppercase tracking-wide"
          >
            <Image
              src={logo}
              alt="Maetry"
              className="h-7 w-auto dark:invert"
              priority
            />
            <span className="sr-only">Maetry</span>
          </Link>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-black/70 dark:bg-white/10 dark:text-white/70">
            {badgeLabel}
          </span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-10 md:flex-row md:items-center md:gap-16 md:py-16">
        <section className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
              {heading}
            </h1>
            <p className="text-base text-black/70 dark:text-white/70 md:text-lg">
              {subheading}
            </p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-black/5 p-6 text-sm text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80 md:p-8 md:text-base">
            <h2 className="text-lg font-medium md:text-xl">{downloadTitle}</h2>
            <p className="mt-2 leading-relaxed">{downloadDescription}</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleAppStoreClick}
              className="inline-flex items-center justify-center transition active:scale-105 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:focus-visible:ring-white dark:focus-visible:ring-offset-dark-bg"
              title={appStoreButtonTitle}
            >
              <Image
                src={appstore}
                alt={appStoreButtonTitle}
                className="h-[50px] w-auto"
              />
            </button>
          </div>
        </section>

        <aside className="relative flex flex-1 justify-center md:justify-end">
          <div className="relative h-[320px] w-[320px] md:h-[380px] md:w-[380px]">
            <Image
              src={phones}
              alt="Maetry App Preview"
              priority
              fill
              sizes="(max-width: 768px) 75vw, 380px"
              className="object-contain"
            />
          </div>
        </aside>
      </main>

      <footer className="border-t border-black/5 bg-white/80 px-6 py-6 text-center text-xs text-black/50 backdrop-blur dark:border-white/10 dark:bg-dark-bg/80 dark:text-white/50">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Maetry. {footerCopyright}
          </span>
          <nav className="flex items-center gap-4">
            <Link
              href="https://maetry.com"
              className="underline-offset-4 hover:underline"
            >
              maetry.com
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default InviteScreen;
