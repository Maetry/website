import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import {
  loadBillingHubData,
  loadBillingSalonProfile,
  resolveBillingSessionContext,
} from "@/lib/api/billing-server";
import { normalizeMaetrySdkError } from "@/lib/api/maetry-sdk.server";
import { loadBillingPlanFeatureTitles } from "@/lib/billing-plan-features";

import BillingPage from "./BillingPage";

type BillingPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    deviceId?: string;
    salonId?: string;
    token?: string;
    session?: string;
  }>;
};

type BillingMetadataProps = {
  params: Promise<{ locale: string }>;
};

function normalizeAuthorization(token: string): string {
  const normalized = token.trim();
  return normalized.toLowerCase().startsWith("bearer ")
    ? normalized
    : `Bearer ${normalized}`;
}

function normalizeQueryValue(value?: string): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function renderStateCard(title: string, message: string) {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-6"
      style={{ background: "rgba(242,242,247,0.96)" }}
    >
      <div
        className="max-w-md rounded-[28px] border border-[rgba(60,60,67,0.16)] bg-white px-6 py-7 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)]"
      >
        <h1 className="text-2xl font-semibold text-[#13131A]">
          {title}
        </h1>
        <p className="mt-3 text-base text-[#13131A]/60">
          {message}
        </p>
      </div>
    </div>
  );
}

export async function generateMetadata({
  params,
}: BillingMetadataProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking.paywall" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
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
  const rawSearchParams = await searchParams;
  const session = normalizeQueryValue(rawSearchParams.session);
  const token = normalizeQueryValue(rawSearchParams.token);
  const deviceId = normalizeQueryValue(rawSearchParams.deviceId);
  const salonId = normalizeQueryValue(rawSearchParams.salonId);
  const t = await getTranslations({ locale, namespace: "booking.paywall" });

  if (!session && (!token || !deviceId)) {
    return renderStateCard(
      t("invalidSessionTitle"),
      t("invalidSessionMessage"),
    );
  }

  try {
    const sessionAuthorization = session
      ? normalizeAuthorization(session)
      : token
        ? normalizeAuthorization(token)
        : null;
    if (!sessionAuthorization) {
      return renderStateCard(
        t("invalidSessionTitle"),
        t("invalidSessionMessage"),
      );
    }
    const resolvedSession = session
      ? await resolveBillingSessionContext(session)
      : {
          deviceId,
          salonId: salonId ?? null,
        };
    const resolvedDeviceId = resolvedSession.deviceId ?? deviceId;
    if (!resolvedDeviceId) {
      return renderStateCard(
        t("invalidSessionTitle"),
        t("invalidSessionMessage"),
      );
    }

    const resolvedSalonId = resolvedSession.salonId ?? salonId ?? null;
    const billingDataPromise = loadBillingHubData({
      authorization: sessionAuthorization,
      deviceId: resolvedDeviceId,
    });
    const planFeatureTitlesPromise = loadBillingPlanFeatureTitles();
    const salonProfilePromise = resolvedSalonId
      ? loadBillingSalonProfile(resolvedSalonId, locale).catch(() => null)
      : Promise.resolve(null);
    const [{ catalog, summary }, planFeatureTitlesByCode, salonProfile] = await Promise.all([
      billingDataPromise,
      planFeatureTitlesPromise,
      salonProfilePromise,
    ]);

    return (
      <BillingPage
        authorization={sessionAuthorization}
        catalog={catalog}
        deviceId={resolvedDeviceId}
        locale={locale}
        planFeatureTitlesByCode={planFeatureTitlesByCode}
        salonId={resolvedSalonId}
        salonProfile={salonProfile}
        summary={summary}
      />
    );
  } catch (error) {
    const normalized = normalizeMaetrySdkError(error);

    return renderStateCard(
      t("unavailableTitle"),
      normalized.message ?? t("unavailableMessage"),
    );
  }
}
