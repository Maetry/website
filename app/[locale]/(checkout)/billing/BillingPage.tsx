"use client";

import { useCallback, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import logo from "@/public/images/logo.svg";
import { useAnalytics } from "@/shared/analytics/useAnalytics";

type Plan = {
  id: string;
  name: string;
  pricePerSpecialist: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
};

const PLANS: Plan[] = [
  {
    id: "start",
    name: "Start",
    pricePerSpecialist: 29,
    currency: "USD",
    interval: "month",
    features: [
      "Online booking",
      "Staff schedules",
      "Client reminders",
    ],
  },
  {
    id: "grow",
    name: "Grow",
    pricePerSpecialist: 49,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Start",
      "Analytics dashboard",
      "Multi-location support",
    ],
  },
  {
    id: "scale",
    name: "Scale",
    pricePerSpecialist: 79,
    currency: "USD",
    interval: "month",
    features: [
      "Everything in Grow",
      "Priority support",
      "Custom integrations",
    ],
  },
];

type BillingPageProps = {
  salonId: string;
  staffCount: number;
  locale: string;
};

export default function BillingPage({
  salonId,
  staffCount,
  locale,
}: BillingPageProps) {
  const { track } = useAnalytics();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  track("billing_page_viewed", { salonId, staffCount });

  const handleSelectPlan = useCallback(
    async (plan: Plan) => {
      setLoading(plan.id);
      setError(null);

      track("billing_plan_selected", {
        planId: plan.id,
        salonId,
        staffCount,
      });

      try {
        const response = await fetch("/api/billing/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            salonId,
            staffCount,
            planId: plan.id,
          }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(
            (data as { message?: string }).message || "Failed to create checkout session",
          );
        }

        const { checkoutUrl } = (await response.json()) as {
          checkoutUrl: string;
        };

        track("billing_checkout_started", {
          planId: plan.id,
          salonId,
        });

        window.location.href = checkoutUrl;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(null);
      }
    },
    [salonId, staffCount, track],
  );

  return (
    <div className="min-h-screen bg-white dark:bg-dark-bg">
      <header className="flex h-16 items-center justify-between px-[3.5%]">
        <Link href={`/${locale}`}>
          <Image
            src={logo}
            alt="Maetry"
            className="w-24 dark:invert"
          />
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-[3.5%] py-12">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#13131A] dark:text-white sm:text-4xl">
            Choose your plan
          </h1>
          <p className="mt-3 text-base text-[#13131A]/60 dark:text-white/60">
            {staffCount} team {staffCount === 1 ? "member" : "members"}
          </p>
        </div>

        {error && (
          <div className="mx-auto mt-6 max-w-md rounded-xl border border-red-200 bg-red-50 p-4 text-center text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {PLANS.map((plan) => {
            const estimate = plan.pricePerSpecialist * staffCount;
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className="flex flex-col rounded-[24px] border border-[#13131A]/8 bg-white p-6 shadow-[0_24px_70px_rgba(19,19,26,0.06)] dark:border-white/10 dark:bg-white/5"
              >
                <h2 className="text-lg font-semibold text-[#13131A] dark:text-white">
                  {plan.name}
                </h2>
                <p className="mt-2 text-2xl font-bold tracking-[-0.02em] text-[#13131A] dark:text-white">
                  ${estimate}
                  <span className="text-sm font-normal text-[#13131A]/50 dark:text-white/50">
                    /mo
                  </span>
                </p>
                <p className="mt-1 text-xs text-[#13131A]/45 dark:text-white/45">
                  ${plan.pricePerSpecialist}/specialist × {staffCount}
                </p>

                <ul className="mt-5 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="text-sm text-[#13131A]/70 dark:text-white/70"
                    >
                      ✓ {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading !== null}
                  className="mt-6 w-full rounded-full bg-[#13131A] px-6 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-[#13131A]"
                >
                  {isLoading ? "Loading..." : "Select plan"}
                </button>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
