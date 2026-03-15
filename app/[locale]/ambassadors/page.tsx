import { getLocale, getTranslations } from "next-intl/server";

import { BentoGrid } from "@/features/ambassador-section";
import { Footer } from "@/features/footer";
import { Header } from "@/features/header";

const AmbassadorPage = async () => {
  const locale = await getLocale();
  const t = await getTranslations("ambassador");
  const emailSubject = encodeURIComponent(t("email.subject"));
  const emailBody = encodeURIComponent(t("email.body"));
  const mailtoHref = `mailto:info@maetry.com?subject=${emailSubject}&body=${emailBody}`;
  const headerNav = [
    { href: "#offer", label: t("offerLabel") },
    { href: "#partner-proof", label: t("gridTitle") },
    { href: "#apply", label: t("startEarning") },
  ];

  return (
    <>
      <Header
        nav={headerNav}
        primaryAction={{ href: mailtoHref, label: t("becomePartner"), tone: "primary" }}
        secondaryAction={{ href: `/${locale}`, label: "Maetry", tone: "secondary" }}
        logoHref={`/${locale}`}
      />
      <main className="w-full bg-white pt-4 text-[#13131A] dark:bg-dark-bg dark:text-white">
        <section id="offer" className="mx-auto grid max-w-7xl gap-8 px-[3.5%] pb-12 pt-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:pb-16">
          <div className="relative overflow-hidden rounded-[32px] border border-[#13131A]/8 bg-[linear-gradient(135deg,_rgba(255,248,243,0.98),_rgba(226,239,255,0.92))] p-8 shadow-[0_30px_90px_rgba(19,19,26,0.08)] dark:border-white/10 dark:bg-[linear-gradient(135deg,_rgba(30,33,48,0.98),_rgba(19,19,26,0.94))] lg:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.52),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(83,158,255,0.22),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(83,158,255,0.24),_transparent_36%)]" />
            <div className="relative">
              <div className="inline-flex rounded-full border border-[#13131A]/10 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#13131A]/60 dark:border-white/10 dark:bg-white/10 dark:text-white/60">
                {t("eyebrow")}
              </div>
              <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-5xl lg:text-[4.5rem]">
                {t("title")}
              </h1>
              <p className="mt-6 max-w-3xl text-base leading-7 text-[#13131A]/72 dark:text-white/72 sm:text-lg">
                {t("subtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={mailtoHref}
                  className="inline-flex items-center justify-center rounded-full bg-[#13131A] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(19,19,26,0.18)] transition-transform duration-200 hover:-translate-y-0.5 dark:bg-white dark:text-[#13131A]"
                >
                  {t("becomePartner")}
                </a>
                <a
                  href="#partner-proof"
                  className="inline-flex items-center justify-center rounded-full border border-[#13131A]/10 bg-white/80 px-6 py-3 text-sm font-semibold text-[#13131A] transition-colors hover:bg-white dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
                >
                  {t("gridHint")}
                </a>
              </div>
              <p className="mt-4 text-sm leading-6 text-[#13131A]/56 dark:text-white/56">
                {t("ctaNote")}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
            <article className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                {t("offerLabel")}
              </p>
              <p className="mt-3 text-xl font-semibold tracking-[-0.03em]">
                {t("offerValue")}
              </p>
            </article>
            <article className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                {t("benefit1Label")}
              </p>
              <p className="mt-3 text-base leading-7 text-[#13131A]/72 dark:text-white/72">
                {t("benefit1Value")}
              </p>
            </article>
            <article className="rounded-[28px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                {t("benefit2Label")}
              </p>
              <p className="mt-3 text-base leading-7 text-[#13131A]/72 dark:text-white/72">
                {t("benefit2Value")}
              </p>
            </article>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-5 px-[3.5%] py-8 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[32px] border border-[#13131A]/8 bg-[#13131A] p-8 text-white shadow-[0_30px_80px_rgba(19,19,26,0.14)] dark:border-white/10 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
              {t("aboutTitle")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {t("readyToPartner")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
              {t("aboutDescription")}
            </p>
            <ul className="mt-6 grid gap-3">
              <li className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/72">
                {t("benefit1Value")}
              </li>
              <li className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/72">
                {t("benefit2Value")}
              </li>
              <li className="rounded-[22px] border border-white/10 bg-white/8 px-4 py-4 text-sm text-white/72">
                {t("partnerDescription")}
              </li>
            </ul>
          </article>

          <article className="rounded-[32px] border border-[#13131A]/8 bg-[#FFF8F3] p-8 shadow-[0_30px_80px_rgba(19,19,26,0.07)] dark:border-white/10 dark:bg-white/5 lg:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#13131A]/42 dark:text-white/42">
              {t("gridTitle")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Maetry
            </h2>
            <p className="mt-4 text-base leading-7 text-[#13131A]/68 dark:text-white/68">
              {t("gridDescription")}
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] border border-[#13131A]/8 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                  01
                </p>
                <p className="mt-3 text-sm leading-6 text-[#13131A]/68 dark:text-white/68">
                  {t("offerValue")}
                </p>
              </div>
              <div className="rounded-[24px] border border-[#13131A]/8 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                  02
                </p>
                <p className="mt-3 text-sm leading-6 text-[#13131A]/68 dark:text-white/68">
                  {t("gridHint")}
                </p>
              </div>
              <div className="rounded-[24px] border border-[#13131A]/8 bg-white px-5 py-5 dark:border-white/10 dark:bg-white/5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#13131A]/45 dark:text-white/45">
                  03
                </p>
                <p className="mt-3 text-sm leading-6 text-[#13131A]/68 dark:text-white/68">
                  {t("ctaNote")}
                </p>
              </div>
            </div>
          </article>
        </section>

        <section id="partner-proof" className="py-8">
          <BentoGrid />
        </section>

        <section id="apply" className="mx-auto max-w-5xl px-[3.5%] py-14">
          <div className="rounded-[32px] border border-[#13131A]/8 bg-[linear-gradient(135deg,_rgba(19,19,26,0.98),_rgba(35,56,97,0.96))] px-8 py-10 text-center text-white shadow-[0_30px_80px_rgba(19,19,26,0.16)] lg:px-12 lg:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
              {t("startEarning")}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              {t("readyToPartner")}
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-7 text-white/72">
              {t("partnerDescription")}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={mailtoHref}
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#13131A] transition-transform duration-200 hover:-translate-y-0.5"
              >
                {t("startEarning")}
              </a>
              <a
                href="mailto:support@maetry.com"
                className="inline-flex items-center justify-center rounded-full border border-white/14 bg-white/8 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/14"
              >
                support@maetry.com
              </a>
            </div>
            <p className="mt-4 text-sm leading-6 text-white/56">{t("ctaNote")}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AmbassadorPage;
