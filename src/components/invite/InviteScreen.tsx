"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import type { DirectLinkDTO, ShortLinkEventType } from "@/lib/api/shortLink";
import { sendFingerprint } from "@/lib/fingerprint/collectFingerprint";
import { detectPlatform } from "@/lib/userAgent/detectPlatform";
import logo from "@/public/images/logo.svg";
import phones from "@/public/images/phones_customer.png";

type InviteScreenProps = {
  data: DirectLinkDTO;
};

type CopyState = "idle" | "copied" | "error";

const defaultCopy = {
  salonInvite: {
    heading: "Вас пригласили присоединиться к салону",
    subheading: "Управляйте салоном и приглашайте мастеров",
  },
  employeeInvite: {
    heading: "Вас пригласили работать мастером",
    subheading: "Управляйте своей записью и расширяйте клиентскую базу",
  },
  clientInvite: {
    heading: "Вас пригласили стать клиентом салона",
    subheading: "Выбирайте мастеров и записывайтесь онлайн",
  },
} satisfies Record<ShortLinkEventType, { heading: string; subheading: string }>;

const resolveHeading = (eventType: ShortLinkEventType, override?: string) => {
  if (override) {
    return override;
  }

  return defaultCopy[eventType]?.heading ?? defaultCopy.clientInvite.heading;
};

const resolveSubheading = (eventType: ShortLinkEventType, override?: string) => {
  if (override) {
    return override;
  }

  return defaultCopy[eventType]?.subheading ?? defaultCopy.clientInvite.subheading;
};

const resolveStoreLink = (platform: ReturnType<typeof detectPlatform>, data: DirectLinkDTO): string | null => {
  if (platform === "ios" && data.appStoreLink) {
    return data.appStoreLink;
  }

  if (platform === "android" && (data.playStoreLink ?? data.appStoreLink)) {
    return data.playStoreLink ?? data.appStoreLink ?? null;
  }

  if (data.webFallbackLink) {
    return data.webFallbackLink;
  }

  return data.universalLink ?? null;
};

const platformCtaLabel: Record<ReturnType<typeof detectPlatform>, string> = {
  ios: "Открыть в App Store",
  android: "Открыть в Google Play",
  web: "Открыть ссылку",
};

const mapEventToBadge: Partial<Record<ShortLinkEventType, string>> = {
  salonInvite: "Приглашение для салона",
  employeeInvite: "Приглашение для мастера",
  clientInvite: "Приглашение для клиента",
};

const getBadgeLabel = (eventType: ShortLinkEventType) => mapEventToBadge[eventType] ?? mapEventToBadge.clientInvite!;

const descriptionFallback =
  "Скачайте приложение Maetry, авторизуйтесь и повторно откройте ссылку, чтобы завершить приглашение.";

const InviteScreen = ({ data }: InviteScreenProps) => {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const platform = detectPlatform();

  const heading = useMemo(() => resolveHeading(data.eventType, data.title), [data.eventType, data.title]);
  const subheading = useMemo(
    () => resolveSubheading(data.eventType, data.description),
    [data.eventType, data.description],
  );
  const description = useMemo(() => data.salon?.description ?? descriptionFallback, [data.salon?.description]);
  const badgeLabel = useMemo(() => getBadgeLabel(data.eventType), [data.eventType]);
  const storeLink = useMemo(() => resolveStoreLink(platform, data), [platform, data]);

  useEffect(() => {
    sendFingerprint(data.nanoId);
  }, [data.nanoId]);

  useEffect(() => {
    if (copyState === "copied" || copyState === "error") {
      const timer = window.setTimeout(() => setCopyState("idle"), 3000);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [copyState]);

  const handleOpenApp = useCallback(async () => {
    try {
      if (data.universalLink) {
        await navigator.clipboard?.writeText?.(data.universalLink);
        setCopyState("copied");
      }
    } catch (error) {
      setCopyState("error");
      if (process.env.NODE_ENV !== "production") {
        console.error("Не удалось скопировать ссылку", error);
      }
    }

    if (storeLink) {
      window.location.href = storeLink;
      return;
    }

    if (data.universalLink) {
      window.location.href = data.universalLink;
    }
  }, [data.universalLink, storeLink]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-black dark:bg-dark-bg dark:text-dark-text">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur dark:border-white/10 dark:bg-dark-bg/80">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold uppercase tracking-wide">
            <Image src={logo} alt="Maetry" className="h-7 w-auto dark:invert" priority />
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
            <h1 className="text-3xl font-semibold leading-tight md:text-4xl">{heading}</h1>
            <p className="text-base text-black/70 dark:text-white/70 md:text-lg">{subheading}</p>
          </div>

          <div className="rounded-2xl border border-black/5 bg-black/5 p-6 text-sm text-black/80 dark:border-white/10 dark:bg-white/5 dark:text-white/80 md:p-8 md:text-base">
            <h2 className="text-lg font-medium md:text-xl">{data.salon?.name ?? "Maetry"}</h2>
            <p className="mt-2 leading-relaxed">{description}</p>
          </div>

          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={handleOpenApp}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus-visible:ring-white dark:focus-visible:ring-offset-dark-bg"
            >
              {platformCtaLabel[platform]}
            </button>

            <Link
              href={data.universalLink ?? "#"}
              prefetch={false}
              className="text-sm font-medium text-black/60 underline-offset-4 hover:underline dark:text-white/70"
              target="_blank"
              rel="noreferrer"
            >
              Открыть универсальную ссылку
            </Link>

            {copyState === "copied" && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                Универсальная ссылка скопирована в буфер обмена
              </span>
            )}
            {copyState === "error" && (
              <span className="text-xs font-medium text-rose-600 dark:text-rose-400">
                Не удалось скопировать ссылку. Попробуйте вручную.
              </span>
            )}
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
          <span>© {new Date().getFullYear()} Maetry. Все права защищены.</span>
          <nav className="flex items-center gap-4">
            {data.webFallbackLink && (
              <Link
                href={data.webFallbackLink}
                className="underline-offset-4 hover:underline"
                prefetch={false}
                target="_blank"
                rel="noreferrer"
              >
                Перейти в веб-версию
              </Link>
            )}
            <Link href="https://maetry.com" className="underline-offset-4 hover:underline">
              maetry.com
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default InviteScreen;

