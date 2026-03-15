import Link from "next/link";

import { getTranslations } from "next-intl/server";

const InviteNotFound = async () => {
  const t = await getTranslations("linkNotFound");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center text-black dark:bg-dark-bg dark:text-dark-text">
      <div className="flex max-w-lg flex-col gap-3">
        <h1 className="text-3xl font-semibold md:text-4xl">{t("title")}</h1>
        <p className="text-base text-black/70 dark:text-white/70">
          {t("description")}
        </p>
      </div>
      <Link
        href="https://maetry.com"
        className="rounded-full bg-black px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white transition hover:-translate-y-0.5 hover:bg-black/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 dark:bg-white dark:text-black dark:hover:bg-white/90 dark:focus-visible:ring-white dark:focus-visible:ring-offset-dark-bg"
      >
        {t("cta")}
      </Link>
    </main>
  );
};

export default InviteNotFound;
