import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { loadBillingHubData } from "@/lib/api/billing-server";
import { normalizeMaetrySdkError } from "@/lib/api/maetry-sdk.server";

import BillingPage from "./BillingPage";

type BillingPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    deviceId?: string;
    email?: string;
    token?: string;
  }>;
};

function normalizeAuthorization(token: string): string {
  return token.toLowerCase().startsWith("bearer ") ? token : `Bearer ${token}`;
}

function renderStateCard(title: string, message: string) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold text-[#13131A] dark:text-white">
          {title}
        </h1>
        <p className="mt-3 text-base text-[#13131A]/60 dark:text-white/60">
          {message}
        </p>
      </div>
    </div>
  );
}

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
      follow: false,
      index: false,
    },
  };
}

export default async function BillingRoute({
  params,
  searchParams,
}: BillingPageProps) {
  const { locale } = await params;
  const { token, deviceId, email } = await searchParams;

  if (!token || !deviceId) {
    return renderStateCard(
      "Invalid billing session",
      "This billing page now requires a secure session from Maetry Console. Open billing from the latest app version.",
    );
  }

  try {
    const authorization = normalizeAuthorization(token);
    const { catalog, summary } = await loadBillingHubData({
      authorization,
      deviceId,
    });

    return (
      <BillingPage
        authorization={authorization}
        catalog={catalog}
        deviceId={deviceId}
        initialRecipientEmail={email ?? null}
        locale={locale}
        summary={summary}
      />
    );
  } catch (error) {
    const normalized = normalizeMaetrySdkError(error);

    return renderStateCard(
      "Billing is unavailable",
      normalized.message ??
        "Maetry could not load the current billing data for this workplace.",
    );
  }
}
