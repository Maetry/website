"use client";

import { useEffect, useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  calculateBillingBreakdown,
  getBillingOffer,
} from "@/lib/api/billing-pricing";
import type {
  BillingCatalog,
  BillingCatalogPlanItem,
  BillingPlanCodeValue,
  BillingPlanIntervalValue,
  BillingSummary,
} from "@/lib/api/maetry-contracts";
import logo from "@/public/images/logo.svg";
import { useAnalytics } from "@/shared/analytics/useAnalytics";

type BillingPageProps = {
  authorization: string;
  catalog: BillingCatalog;
  deviceId: string;
  initialRecipientEmail?: string | null;
  locale: string;
  summary: BillingSummary;
};

function isSelfServePlanCode(
  code: BillingCatalogPlanItem["code"],
): code is BillingPlanCodeValue {
  return code === "start" || code === "grow" || code === "scale";
}

function formatCurrency(
  amount?: number | null,
  currency?: string | null,
  locale?: string,
) {
  if (amount === null || amount === undefined || !currency) {
    return null;
  }

  try {
    return new Intl.NumberFormat(locale ?? "en", {
      currency,
      maximumFractionDigits: 2,
      style: "currency",
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function formatDate(value?: string | null, locale?: string) {
  if (!value) {
    return null;
  }

  try {
    return new Intl.DateTimeFormat(locale ?? "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function pickInitialPlanCode(
  catalog: BillingCatalog,
  summary: BillingSummary,
): BillingCatalogPlanItem["code"] {
  const currentPlanCode = summary.currentSubscription?.planCode;

  if (currentPlanCode && catalog.plans.some((plan) => plan.code === currentPlanCode)) {
    return currentPlanCode;
  }

  const anchorPlan =
    catalog.plans.find((plan) => plan.anchor) ??
    catalog.plans.find((plan) => plan.availability === "selfServe") ??
    catalog.plans[0];

  return anchorPlan?.code ?? "grow";
}

export default function BillingPage({
  authorization,
  catalog,
  deviceId,
  initialRecipientEmail,
  locale,
  summary,
}: BillingPageProps) {
  const { track } = useAnalytics();
  const [selectedInterval, setSelectedInterval] =
    useState<BillingPlanIntervalValue>(
      summary.currentSubscription?.interval ?? "monthly",
    );
  const [selectedPlanCode, setSelectedPlanCode] = useState<
    BillingCatalogPlanItem["code"]
  >(pickInitialPlanCode(catalog, summary));
  const [recipientEmail, setRecipientEmail] = useState(
    initialRecipientEmail ?? "",
  );
  const [requestingPlanCode, setRequestingPlanCode] = useState<string | null>(
    null,
  );
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const activeSeats = Math.max(summary.activeSeats, 1);

  useEffect(() => {
    track("billing_page_viewed", {
      activeSeats,
    });
  }, [activeSeats, track]);

  const orderedPlans = useMemo(() => {
    return [...catalog.plans].sort((left, right) => {
      if (left.anchor && !right.anchor) return -1;
      if (!left.anchor && right.anchor) return 1;
      return left.title.localeCompare(right.title);
    });
  }, [catalog.plans]);

  const currentSubscriptionLabel = summary.currentSubscription
    ? [
        summary.currentSubscription.title,
        formatDate(summary.currentSubscription.endDate, locale),
      ]
        .filter(Boolean)
        .join(" · renews ")
    : "No active paid subscription";

  const portalAvailable =
    summary.customerPortalAvailable && summary.currentSubscription !== null;

  const isEmailValid = /^\S+@\S+\.\S+$/.test(recipientEmail.trim());

  async function handleSendInstructions(plan: BillingCatalogPlanItem) {
    if (!isSelfServePlanCode(plan.code)) {
      return;
    }

    if (!isEmailValid) {
      setError("Enter a valid billing email.");
      setSuccess(null);
      return;
    }

    setSelectedPlanCode(plan.code);
    setRequestingPlanCode(plan.code);
    setError(null);
    setSuccess(null);

    track("billing_plan_selected", {
      interval: selectedInterval,
      planId: plan.code,
    });

    try {
      const response = await fetch("/api/billing/subscription-instructions", {
        body: JSON.stringify({
          interval: selectedInterval,
          plan: plan.code,
          recipientEmail: recipientEmail.trim(),
        }),
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          "Device-ID": deviceId,
          "Idempotency-Key":
            window.crypto?.randomUUID?.() ?? `${plan.code}-${Date.now()}`,
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "Failed to send billing instructions");
      }

      const data = (await response.json()) as { recipientEmail: string };
      setSuccess(`Payment instructions were sent to ${data.recipientEmail}.`);
      track("billing_checkout_started", {
        interval: selectedInterval,
        planId: plan.code,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to send billing instructions",
      );
    } finally {
      setRequestingPlanCode(null);
    }
  }

  async function handleOpenPortal() {
    setIsOpeningPortal(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/billing/portal-session", {
        headers: {
          Authorization: authorization,
          "Device-ID": deviceId,
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || "Failed to open billing portal");
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to open billing portal",
      );
      setIsOpeningPortal(false);
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(244,203,166,0.35),_transparent_40%),linear-gradient(180deg,_#fffaf5_0%,_#ffffff_48%,_#f8f6ff_100%)]">
      <header className="flex h-16 items-center justify-between px-[3.5%]">
        <Link href={`/${locale}`}>
          <Image src={logo} alt="Maetry" className="w-24 dark:invert" />
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-[3.5%] py-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(320px,0.68fr)]">
          <section className="space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#9B5C2F]">
                Billing & payments
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-[#13131A] sm:text-5xl">
                Choose the live plan for this workplace
              </h1>
              <p className="mt-4 max-w-2xl text-base text-[#13131A]/65">
                Website now reads the same billing catalog and summary as Maetry
                Console. Active seats are synced from the backend before pricing
                is shown.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {(["monthly", "yearly"] as const).map((interval) => (
                <button
                  key={interval}
                  type="button"
                  onClick={() => setSelectedInterval(interval)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selectedInterval === interval
                      ? "bg-[#13131A] text-white shadow-[0_12px_30px_rgba(19,19,26,0.18)]"
                      : "bg-white text-[#13131A]/70 ring-1 ring-[#13131A]/10 hover:ring-[#13131A]/20"
                  }`}
                >
                  {interval === "monthly" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <div className="grid gap-5 lg:grid-cols-2">
              {orderedPlans.map((plan) => {
                const offer = getBillingOffer(plan, selectedInterval);
                const breakdown = offer
                  ? calculateBillingBreakdown(offer, activeSeats)
                  : null;
                const isCurrentPlan =
                  summary.currentSubscription?.planCode === plan.code &&
                  summary.currentSubscription.interval === selectedInterval;
                const isSelected = selectedPlanCode === plan.code;
                const canSelfServe =
                  plan.availability === "selfServe" &&
                  offer &&
                  isSelfServePlanCode(plan.code);
                const amountLabel = breakdown
                  ? formatCurrency(
                      breakdown.totalPrice.amount,
                      breakdown.totalPrice.currency,
                      locale,
                    )
                  : null;

                return (
                  <article
                    key={plan.code}
                    className={`flex flex-col rounded-[28px] border p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] transition ${
                      isSelected
                        ? "border-[#13131A]/20 bg-white"
                        : "border-[#13131A]/8 bg-white/80"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#13131A]">
                            {plan.title}
                          </h2>
                          {isCurrentPlan && (
                            <span className="rounded-full bg-[#13131A] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white">
                              Current
                            </span>
                          )}
                          {plan.anchor && !isCurrentPlan && (
                            <span className="rounded-full bg-[#FCE7D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#9B5C2F]">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-[#13131A]/55">
                          {plan.headline}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#13131A]/6 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#13131A]/65">
                        {plan.availability === "selfServe"
                          ? "Self-serve"
                          : plan.availability === "contactSales"
                          ? "Contact sales"
                          : "Included"}
                      </span>
                    </div>

                    <div className="mt-6">
                      <p className="text-4xl font-semibold tracking-[-0.05em] text-[#13131A]">
                        {amountLabel ?? "Custom"}
                      </p>
                      <p className="mt-2 text-sm text-[#13131A]/55">
                        {offer
                          ? `${activeSeats} seats · ${offer.includedSeats} included`
                          : "Pricing handled outside self-serve checkout"}
                      </p>
                    </div>

                    <p className="mt-5 flex-1 text-sm leading-6 text-[#13131A]/66">
                      {plan.summary}
                    </p>

                    {breakdown && (
                      <div className="mt-5 rounded-2xl bg-[#F7F7FB] p-4 text-sm text-[#13131A]/68">
                        <div className="flex items-center justify-between">
                          <span>Base</span>
                          <span className="font-medium text-[#13131A]">
                            {formatCurrency(
                              breakdown.basePrice.amount,
                              breakdown.basePrice.currency,
                              locale,
                            )}
                          </span>
                        </div>
                        {breakdown.tierLines.map((line) => (
                          <div
                            key={line.rangeTitle}
                            className="mt-2 flex items-center justify-between"
                          >
                            <span>
                              {line.rangeTitle} · {line.seatCount} extra
                            </span>
                            <span className="font-medium text-[#13131A]">
                              {formatCurrency(
                                line.subtotal.amount,
                                line.subtotal.currency,
                                locale,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={
                        requestingPlanCode !== null ||
                        !canSelfServe ||
                        !isEmailValid ||
                        isCurrentPlan
                      }
                      onClick={() => void handleSendInstructions(plan)}
                      className="mt-6 w-full rounded-full bg-[#13131A] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {requestingPlanCode === plan.code
                        ? "Sending..."
                        : isCurrentPlan
                        ? "Current plan"
                        : canSelfServe
                        ? "Send payment link"
                        : "Contact sales"}
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <aside className="space-y-5 rounded-[32px] border border-[#13131A]/8 bg-white/92 p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#13131A]/45">
                Workplace Summary
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#13131A]">
                {currentSubscriptionLabel}
              </h2>
            </div>

            <dl className="grid gap-3 rounded-2xl bg-[#F7F7FB] p-4 text-sm text-[#13131A]/68">
              <div className="flex items-center justify-between gap-4">
                <dt>Active seats</dt>
                <dd className="font-semibold text-[#13131A]">{activeSeats}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt>SMS credits</dt>
                <dd className="font-semibold text-[#13131A]">
                  {summary.smsCreditBalance ?? 0}
                </dd>
              </div>
              {summary.currentSubscription?.price && (
                <div className="flex items-center justify-between gap-4">
                  <dt>Current billing</dt>
                  <dd className="font-semibold text-[#13131A]">
                    {formatCurrency(
                      summary.currentSubscription.price.amount,
                      summary.currentSubscription.price.currency,
                      locale,
                    )}
                  </dd>
                </div>
              )}
            </dl>

            <label className="block">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-[#13131A]/45">
                Billing Email
              </span>
              <input
                value={recipientEmail}
                onChange={(event) => setRecipientEmail(event.target.value)}
                type="email"
                autoComplete="email"
                placeholder="billing@company.com"
                className="mt-3 w-full rounded-2xl border border-[#13131A]/12 bg-white px-4 py-3 text-base text-[#13131A] outline-none transition focus:border-[#13131A]/28"
              />
              <span className="mt-2 block text-xs text-[#13131A]/48">
                Subscription instructions and payment link will be sent to this
                address.
              </span>
            </label>

            {portalAvailable && (
              <button
                type="button"
                onClick={() => void handleOpenPortal()}
                disabled={isOpeningPortal}
                className="w-full rounded-full border border-[#13131A]/14 bg-white px-6 py-3 text-sm font-semibold text-[#13131A] transition hover:border-[#13131A]/26 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {isOpeningPortal ? "Opening portal..." : "Open billing portal"}
              </button>
            )}

            <div className="rounded-2xl border border-dashed border-[#13131A]/12 p-4 text-sm text-[#13131A]/58">
              This page now expects an authenticated billing handoff from Maetry
              Console: `Authorization` and `Device-ID` are required for all live
              billing calls.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
