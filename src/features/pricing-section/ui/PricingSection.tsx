"use client";

import { useMemo, useState } from "react";

import { useTranslations } from "next-intl";

type Plan = {
  key: "start" | "grow" | "scale";
  basePrice: number;
  additionalStaffPrice: number;
};

const plans: Plan[] = [
  { key: "start", basePrice: 29, additionalStaffPrice: 9 },
  { key: "grow", basePrice: 49, additionalStaffPrice: 14 },
  { key: "scale", basePrice: 89, additionalStaffPrice: 19 },
];

const formatPrice = (price: number) => `$${price}/mo`;

const PricingSection = () => {
  const t = useTranslations("pricing");
  const [staffCount, setStaffCount] = useState(5);

  const safeStaffCount = Number.isFinite(staffCount)
    ? Math.min(Math.max(staffCount, 1), 500)
    : 1;

  const estimatedPrices = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        totalPrice:
          plan.basePrice +
          Math.max(safeStaffCount - 1, 0) * plan.additionalStaffPrice,
      })),
    [safeStaffCount],
  );

  return (
    <section
      id="pricing"
      className="w-[93%] px-[3.5%] flex flex-col gap-y-[5vh] xl:gap-y-[8vh] scroll-mt-[100px]"
    >
      <div className="flex flex-col w-full">
        <p className="text-[4vw] xl:text-[1.333vw] dark:text-dark-text/40 text-lightText/40">
          {t("subtitle")}
        </p>
        <h1 className="text-[8.5vw] xl:text-[3.75vw] font-medium leading-none tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-3xl text-[4vw] xl:text-[1.167vw] font-light">
          {t("description")}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 w-full">
        {plans.map((plan) => (
          <article
            key={plan.key}
            className="relative overflow-hidden rounded-[21px] border border-black/10 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-[#1a1a22]"
          >
            <div className="absolute inset-0 opacity-70 dark:opacity-20">
              <div className="feature_gradient" />
            </div>
            <div className="relative z-10 flex h-full flex-col gap-6">
              <div className="space-y-3">
                <h2 className="text-3xl xl:text-[2vw] font-medium leading-none tracking-tight">
                  {t(`${plan.key}.name`)}
                </h2>
                <p className="text-2xl xl:text-[1.8vw] font-medium leading-none tracking-tight">
                  {t(`${plan.key}.from`, { price: plan.basePrice })}
                </p>
              </div>

              <div className="space-y-3 text-base xl:text-[1vw] font-light">
                <p>
                  {t(`${plan.key}.additional`, {
                    price: plan.additionalStaffPrice,
                  })}
                </p>
                <p className="text-lightText/60 dark:text-dark-text/60">
                  {t("volumeDiscounts")}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-[21px] border border-black/10 bg-[#faf8ff] p-6 shadow-lg dark:border-white/10 dark:bg-[#161620]">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl xl:text-[1.8vw] font-medium leading-none tracking-tight">
              {t("calculator.title")}
            </h3>
            <p className="text-sm xl:text-[0.95vw] font-light text-lightText/60 dark:text-dark-text/60">
              {t("calculator.note")}
            </p>
          </div>

          <div className="flex flex-col xl:flex-row gap-4 xl:items-end">
            <label className="flex flex-col gap-3 xl:max-w-[240px]">
              <span className="text-sm xl:text-[0.95vw] font-medium">
                {t("calculator.inputLabel")}
              </span>
              <input
                type="number"
                min={1}
                max={500}
                value={safeStaffCount}
                onChange={(event) => {
                  const nextValue = Number(event.target.value);
                  setStaffCount(Number.isNaN(nextValue) ? 1 : nextValue);
                }}
                className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-lg outline-none transition-colors focus:border-black/30 dark:border-white/10 dark:bg-[#111118] dark:focus:border-white/30"
              />
            </label>

            <input
              type="range"
              min={1}
              max={50}
              value={Math.min(safeStaffCount, 50)}
              onChange={(event) => setStaffCount(Number(event.target.value))}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {estimatedPrices.map((plan) => (
              <div
                key={plan.key}
                className="rounded-2xl border border-black/10 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111118]"
              >
                <p className="text-sm xl:text-[0.9vw] text-lightText/60 dark:text-dark-text/60">
                  {t(`${plan.key}.name`)}
                </p>
                <p className="mt-2 text-2xl xl:text-[1.7vw] font-medium leading-none tracking-tight">
                  {formatPrice(plan.totalPrice)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
