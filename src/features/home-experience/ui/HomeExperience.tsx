import Image from "next/image";

import { Header } from "@/features/header";
import logo from "@/public/images/logo.svg";
import { ThemeSwitcher } from "@/shared/ui";

import {
  BUSINESS_CONSOLE_URL,
  INSTAGRAM_URL,
  SUPPORT_EMAIL_HREF,
  TELEGRAM_URL,
  buildAppStoreUrl,
  getBusinessHref,
  getMarketingContent,
  normalizeMarketingLocale,
  type MarketingLocale,
  type SiteExperience,
} from "../model/content";

type HomeExperienceProps = {
  locale: string;
  experience: SiteExperience;
  host: string | null;
  routeVariant: "home" | "business-path" | "business-host";
};

const localeOptions: MarketingLocale[] = ["en", "ru", "es"];

function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

function ButtonLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <a
      href={href}
      target={href.startsWith("http") || href.startsWith("mailto:") ? "_blank" : undefined}
      rel={
        href.startsWith("http") || href.startsWith("mailto:")
          ? "noopener noreferrer"
          : undefined
      }
      className={cx(
        "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-transform duration-200 hover:-translate-y-0.5",
        variant === "primary"
          ? "bg-[#13131A] text-white shadow-[0_12px_36px_rgba(19,19,26,0.18)] dark:bg-white dark:text-[#13131A] dark:shadow-[0_12px_36px_rgba(0,0,0,0.28)]"
          : "border border-[#13131A]/12 bg-white text-[#13131A] dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12",
      )}
    >
      {label}
    </a>
  );
}

function getConsumerHomeHref(host: string | null, locale: string): string {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const normalizedHost = host?.toLowerCase() ?? "";
  const isLocal =
    normalizedHost.includes("localhost") || normalizedHost.includes("127.0.0.1");
  const isPreview =
    normalizedHost.includes("vercel.app") || normalizedHost.includes("vercel.live");

  if (isLocal || isPreview || !normalizedHost.includes("maetry.com")) {
    return `/${normalizedLocale}`;
  }

  return `https://maetry.com/${normalizedLocale}`;
}

function getLocaleHref(
  targetLocale: MarketingLocale,
  routeVariant: HomeExperienceProps["routeVariant"],
  host: string | null,
): string {
  if (routeVariant === "business-path") {
    return `/${targetLocale}/business`;
  }

  if (routeVariant === "business-host") {
    return `https://business.maetry.com/${targetLocale}`;
  }

  return getConsumerHomeHref(host, targetLocale);
}

export function HomeExperience({
  locale,
  experience,
  host,
  routeVariant,
}: HomeExperienceProps) {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const content = getMarketingContent(normalizedLocale);
  const isBusiness = experience === "business";
  const businessHref =
    routeVariant === "business-host"
      ? `https://business.maetry.com/${normalizedLocale}`
      : getBusinessHref(host, normalizedLocale);
  const consumerHref = getConsumerHomeHref(host, normalizedLocale);
  const appHref = buildAppStoreUrl(
    isBusiness ? "business_landing" : "consumer_home",
  );

  const hero = isBusiness ? content.business.hero : content.consumer.hero;
  const nav = isBusiness ? content.business.nav : content.consumer.nav;
  const headerNav = nav.map((item) => ({
    href: item.href,
    label: item.label,
  }));
  const headerPrimaryAction = isBusiness
    ? {
        href: BUSINESS_CONSOLE_URL,
        label: content.common.openConsoleLabel,
        tone: "primary" as const,
      }
    : {
        href: appHref,
        label: content.common.appStoreLabel,
        tone: "primary" as const,
      };
  const headerSecondaryAction = isBusiness
    ? {
        href: SUPPORT_EMAIL_HREF,
        label: content.common.contactLabel,
        tone: "secondary" as const,
      }
    : {
        href: businessHref,
        label: content.common.businessLabel,
        tone: "secondary" as const,
      };
  const logoHref = isBusiness ? businessHref : consumerHref;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(217,236,255,0.95),_rgba(255,248,243,0.88)_42%,_#ffffff_78%)] text-[#13131A] dark:bg-[radial-gradient(circle_at_top,_rgba(34,43,64,0.96),_rgba(15,18,31,0.98)_44%,_#0b0d12_82%)] dark:text-white">
      <Header
        nav={headerNav}
        primaryAction={headerPrimaryAction}
        secondaryAction={headerSecondaryAction}
        logoHref={logoHref}
      />

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:pb-24 lg:pt-16">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center rounded-full border border-[#13131A]/10 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#13131A]/60 dark:border-white/10 dark:bg-white/8 dark:text-white/60">
              {hero.eyebrow}
            </div>
            <h1 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-[4.5rem]">
              {hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-[#13131A]/72 dark:text-white/72 sm:text-lg">
              {hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink
                href={isBusiness ? BUSINESS_CONSOLE_URL : appHref}
                label={hero.primaryCta}
              />
              <ButtonLink
                href={isBusiness ? SUPPORT_EMAIL_HREF : businessHref}
                label={hero.secondaryCta}
                variant="secondary"
              />
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#13131A]/58 dark:text-white/58">
              {hero.note}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {hero.badges.map((badge) => (
                <div
                  key={badge}
                  className="rounded-full border border-[#13131A]/10 bg-white px-4 py-2 text-sm text-[#13131A]/72 shadow-[0_12px_30px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/8 dark:text-white/72 dark:shadow-[0_12px_30px_rgba(0,0,0,0.22)]"
                >
                  {badge}
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[32px] border border-[#13131A]/8 bg-[#13131A] p-6 text-white shadow-[0_30px_80px_rgba(19,19,26,0.18)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(83,158,255,0.32),_transparent_32%)]" />
            <div className="relative flex h-full flex-col">
              <div className="grid gap-4 sm:grid-cols-2">
                {(isBusiness
                  ? content.business.outcomes
                  : content.consumer.highlights
                ).map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm"
                  >
                    <h2 className="text-lg font-semibold">{item.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/72">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
              <div className="mt-4 flex-1 rounded-[26px] border border-white/10 bg-white/6 p-5">
                {!isBusiness ? (
                  <div className="grid h-full gap-4 md:grid-cols-[0.95fr_1.05fr]">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                        {content.consumer.coverageEyebrow}
                      </p>
                      <h2 className="mt-4 text-2xl font-semibold leading-tight">
                        {content.consumer.coverageTitle}
                      </h2>
                      <p className="mt-3 max-w-md text-sm leading-6 text-white/72">
                        {content.consumer.coverageDescription}
                      </p>
                    </div>
                    <div className="grid gap-3 self-end">
                      {content.consumer.coveragePoints.map((point, index) => (
                        <div
                          key={point.label}
                          className="rounded-[22px] border border-white/10 bg-black/15 p-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/12 text-sm font-semibold">
                              {index + 1}
                            </div>
                            <p className="text-sm font-semibold">{point.label}</p>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-white/68">
                            {point.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full gap-3 md:grid-cols-2">
                    {content.business.platformModules.map((module) => (
                      <article
                        key={module.title}
                        className="rounded-[22px] border border-white/10 bg-black/15 p-5"
                      >
                        <h2 className="text-lg font-semibold">{module.title}</h2>
                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {module.description}
                        </p>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {!isBusiness ? (
          <>
            <section
              id="discover"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="grid gap-5 md:grid-cols-3">
                {content.consumer.highlights.map((item) => (
                  <article
                    key={item.title}
                    className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                  >
                    <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                      {item.title}
                    </h2>
                    <p className="mt-4 text-sm leading-6 text-[#13131A]/68 dark:text-white/68">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="coverage"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="grid gap-8 rounded-[32px] border border-[#13131A]/8 bg-[#FFF8F3] p-6 shadow-[0_30px_80px_rgba(19,19,26,0.07)] dark:border-white/10 dark:bg-[linear-gradient(180deg,_rgba(24,28,40,0.98),_rgba(15,17,24,0.96))] dark:shadow-[0_30px_80px_rgba(0,0,0,0.22)] lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                    {content.consumer.coverageEyebrow}
                  </p>
                  <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    {content.consumer.coverageTitle}
                  </h2>
                  <p className="mt-4 max-w-lg text-base leading-7 text-[#13131A]/68 dark:text-white/68">
                    {content.consumer.coverageDescription}
                  </p>
                  <div className="mt-8 grid gap-3">
                    {content.consumer.coveragePoints.map((point) => (
                      <div
                        key={point.label}
                        className="rounded-[22px] border border-[#13131A]/8 bg-white p-5 dark:border-white/10 dark:bg-white/6"
                      >
                        <h3 className="text-base font-semibold">{point.label}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#13131A]/64 dark:text-white/64">
                          {point.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative min-h-[420px] overflow-hidden rounded-[28px] border border-[#13131A]/8 bg-[linear-gradient(180deg,_#13131A_0%,_#1D2840_100%)] p-6 text-white">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(92,201,255,0.24),_transparent_30%)]" />
                  <div className="relative h-full">
                    <div className="absolute left-[12%] top-[18%] h-4 w-4 rounded-full bg-[#A5D8FF] shadow-[0_0_0_12px_rgba(165,216,255,0.12)]" />
                    <div className="absolute left-[52%] top-[24%] h-4 w-4 rounded-full bg-[#F6C48F] shadow-[0_0_0_12px_rgba(246,196,143,0.12)]" />
                    <div className="absolute left-[28%] top-[52%] h-4 w-4 rounded-full bg-[#FFD7A8] shadow-[0_0_0_12px_rgba(255,215,168,0.12)]" />
                    <div className="absolute left-[68%] top-[60%] h-4 w-4 rounded-full bg-[#A5D8FF] shadow-[0_0_0_12px_rgba(165,216,255,0.12)]" />
                    <div className="absolute inset-x-[15%] top-[22%] h-px rotate-[12deg] bg-white/16" />
                    <div className="absolute inset-x-[24%] top-[50%] h-px rotate-[-9deg] bg-white/16" />
                    <div className="absolute bottom-5 left-5 right-5 grid gap-3">
                      <div className="rounded-[22px] border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/50">
                          {content.consumer.coveragePanelLabel}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/72">
                          {content.consumer.coveragePanelText}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {content.consumer.coveragePanelBullets.map((bullet) => (
                          <div
                            key={bullet}
                            className="rounded-[20px] border border-white/10 bg-black/15 p-4 text-sm text-white/72"
                          >
                            {bullet}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="grid gap-5 lg:grid-cols-[0.96fr_1.04fr]">
                <div className="rounded-[32px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)] lg:p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                    {content.consumer.bookingEyebrow}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                    {content.consumer.bookingTitle}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[#13131A]/68 dark:text-white/68">
                    {content.consumer.bookingDescription}
                  </p>
                </div>

                <div className="grid gap-4">
                  {content.consumer.bookingSteps.map((step) => (
                    <article
                      key={step.title}
                      className="rounded-[28px] border border-[#13131A]/8 bg-[#F7FAFF] p-6 dark:border-white/10 dark:bg-white/6"
                    >
                      <h3 className="text-xl font-semibold tracking-[-0.03em]">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-[#13131A]/66 dark:text-white/66">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="download"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="rounded-[32px] border border-[#13131A]/8 bg-[#13131A] px-6 py-8 text-white shadow-[0_30px_80px_rgba(19,19,26,0.14)] lg:px-10 lg:py-10">
                <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                      {content.consumer.businessBridgeEyebrow}
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                      {content.consumer.businessBridgeTitle}
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                      {content.consumer.businessBridgeDescription}
                    </p>
                    <ul className="mt-6 grid gap-3 md:grid-cols-3">
                      {content.consumer.businessBridgePoints.map((point) => (
                        <li
                          key={point}
                          className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/72"
                        >
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <ButtonLink href={appHref} label={content.common.appStoreLabel} />
                    <ButtonLink
                      href={businessHref}
                      label={content.common.businessLabel}
                      variant="secondary"
                    />
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          <>
            <section
              id="platform"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="mb-8 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                  {content.business.platformEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {content.business.platformTitle}
                </h2>
                <p className="mt-4 text-base leading-7 text-[#13131A]/68 dark:text-white/68">
                  {content.business.platformDescription}
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {content.business.platformModules.map((module) => (
                  <article
                    key={module.title}
                    className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                  >
                    <h3 className="text-xl font-semibold tracking-[-0.03em]">
                      {module.title}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#13131A]/66 dark:text-white/66">
                      {module.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="journey"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="grid gap-8 rounded-[32px] border border-[#13131A]/8 bg-[#FFF8F3] p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,_rgba(24,28,40,0.98),_rgba(15,17,24,0.96))] lg:grid-cols-[0.92fr_1.08fr] lg:p-10">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                    {content.business.journeyEyebrow}
                  </p>
                  <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                    {content.business.journeyTitle}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[#13131A]/68 dark:text-white/68">
                    {content.business.journeyDescription}
                  </p>
                </div>
                <div className="grid gap-4">
                  {content.business.journeySteps.map((step, index) => (
                    <article
                      key={step.title}
                      className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 dark:border-white/10 dark:bg-white/6"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#13131A] text-sm font-semibold text-white dark:bg-white dark:text-[#13131A]">
                          {index + 1}
                        </div>
                        <h3 className="text-xl font-semibold tracking-[-0.03em]">
                          {step.title}
                        </h3>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-[#13131A]/66 dark:text-white/66">
                        {step.description}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section
              id="pricing"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="mb-8 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                  {content.business.pricingEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {content.business.pricingTitle}
                </h2>
                <p className="mt-4 text-base leading-7 text-[#13131A]/68 dark:text-white/68">
                  {content.business.pricingDescription}
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {content.business.pricingPlans.map((plan) => (
                  <article
                    key={plan.name}
                    className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                      {plan.name}
                    </p>
                    <h3 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                      {plan.price}
                    </h3>
                    <p className="mt-4 text-sm leading-6 text-[#13131A]/66 dark:text-white/66">
                      {plan.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
              <div className="grid gap-5 lg:grid-cols-2">
                {content.business.quotes.map((quote) => (
                  <blockquote
                    key={quote.author}
                    className="rounded-[32px] border border-[#13131A]/8 bg-[#13131A] p-8 text-white shadow-[0_30px_80px_rgba(19,19,26,0.12)]"
                  >
                    <p className="text-2xl font-semibold leading-9 tracking-[-0.03em]">
                      “{quote.quote}”
                    </p>
                    <footer className="mt-6 text-sm text-white/70">
                      {quote.author} · {quote.role}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </section>

            <section
              id="faq"
              className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
            >
              <div className="mb-8 max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                  {content.business.faqEyebrow}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
                  {content.business.faqTitle}
                </h2>
              </div>
              <div className="grid gap-4">
                {content.business.faqs.map((faq) => (
                  <article
                    key={faq.question}
                    className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.05)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
                  >
                    <h3 className="text-lg font-semibold tracking-[-0.02em]">
                      {faq.question}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[#13131A]/66 dark:text-white/66">
                      {faq.answer}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-[#13131A]/8 bg-white dark:border-white/10 dark:bg-[#0f1118]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
          <div>
            <Image src={logo} alt="Maetry" width={112} height={22} className="h-auto w-[112px] dark:invert" />
            <p className="mt-4 max-w-2xl text-sm leading-6 text-[#13131A]/64 dark:text-white/64">
              {isBusiness
                ? content.business.footerTagline
                : content.consumer.footerTagline}
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-[#13131A]/62 dark:text-white/62">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#13131A] dark:hover:text-white">
                Telegram
              </a>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-[#13131A] dark:hover:text-white">
                Instagram
              </a>
              <a href={SUPPORT_EMAIL_HREF} className="hover:text-[#13131A] dark:hover:text-white">
                {content.common.contactLabel}
              </a>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                {content.common.productSectionLabel}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-[#13131A]/64 dark:text-white/64">
                <a href={consumerHref} className="hover:text-[#13131A] dark:hover:text-white">
                  {content.common.consumerLabel}
                </a>
                <a href={businessHref} className="hover:text-[#13131A] dark:hover:text-white">
                  {content.common.businessLabel}
                </a>
                <a href={appHref} target="_blank" rel="noopener noreferrer" className="hover:text-[#13131A] dark:hover:text-white">
                  {content.common.appStoreLabel}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                {content.common.legalSectionLabel}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-[#13131A]/64 dark:text-white/64">
                <a href="/privacy.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#13131A] dark:hover:text-white">
                  {content.common.privacyLabel}
                </a>
                <a href="/terms.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#13131A] dark:hover:text-white">
                  {content.common.termsLabel}
                </a>
                <a
                  href={`/${normalizedLocale}/ambassadors`}
                  className="hover:text-[#13131A] dark:hover:text-white"
                >
                  {content.common.partnershipLabel}
                </a>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
                {content.common.languageLabel}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {localeOptions.map((targetLocale) => (
                  <a
                    key={targetLocale}
                    href={getLocaleHref(targetLocale, routeVariant, host)}
                    className={cx(
                      "rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition-colors",
                      targetLocale === normalizedLocale
                        ? "border-[#13131A] bg-[#13131A] text-white dark:border-white dark:bg-white dark:text-[#13131A]"
                        : "border-[#13131A]/10 text-[#13131A]/64 hover:border-[#13131A]/22 hover:text-[#13131A] dark:border-white/12 dark:text-white/64 dark:hover:border-white/28 dark:hover:text-white",
                    )}
                  >
                    {targetLocale}
                  </a>
                ))}
                <div className="pt-2">
                  <ThemeSwitcher />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-[#13131A]/8 px-4 py-4 text-center text-sm text-[#13131A]/50 dark:border-white/10 dark:text-white/50 sm:px-6 lg:px-8">
          {content.common.footerRights}
        </div>
      </footer>
    </div>
  );
}
