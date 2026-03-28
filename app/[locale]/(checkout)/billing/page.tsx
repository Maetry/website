import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BillingPage from "./BillingPage";

type BillingPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ salonId?: string; staffCount?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  return {
    title: `Maetry — ${t("title")}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function BillingRoute({
  params,
  searchParams,
}: BillingPageProps) {
  const { locale } = await params;
  const { salonId, staffCount } = await searchParams;

  const parsedStaffCount = staffCount ? parseInt(staffCount, 10) : null;
  const isValid =
    salonId &&
    salonId.length > 0 &&
    salonId.length <= 200 &&
    parsedStaffCount !== null &&
    !isNaN(parsedStaffCount) &&
    parsedStaffCount > 0 &&
    parsedStaffCount <= 1000;

  if (!isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold text-[#13131A] dark:text-white">
            Invalid billing link
          </h1>
          <p className="mt-3 text-base text-[#13131A]/60 dark:text-white/60">
            Please open this page from the Maetry app to select a plan.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BillingPage
      salonId={salonId}
      staffCount={parsedStaffCount}
      locale={locale}
    />
  );
}
