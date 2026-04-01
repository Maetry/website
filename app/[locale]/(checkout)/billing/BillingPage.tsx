"use client";

import { useEffect, useMemo, useState } from "react";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { Anchor, Button, Paragraph, Text, XStack, YStack, ZStack } from "tamagui";

import {
  PrimaryAction,
  SectionCard,
  SheetRoot,
} from "@/app/[locale]/(booking)/_shared/primitives";
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
  PublicSalonProfile,
} from "@/lib/api/maetry-contracts";
import { usePlatform } from "@/lib/userAgent/PlatformProvider";
import { useAnalytics } from "@/shared/analytics/useAnalytics";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

type BillingPageProps = {
  authorization: string;
  catalog: BillingCatalog;
  deviceId: string;
  locale: string;
  salonId?: string | null;
  salonProfile?: PublicSalonProfile | null;
  summary: BillingSummary;
};

type BillingPaywallTranslator = (
  key: string,
  values?: Record<string, string | number>,
) => string;

type BillingActionKind =
  | "hidden"
  | "managePortal"
  | "start"
  | "upgrade"
  | "downgrade"
  | "contactSales";

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

function planRank(code?: string | null) {
  switch (code) {
    case "free":
      return 0;
    case "start":
      return 1;
    case "grow":
      return 2;
    case "scale":
      return 3;
    case "enterprise":
      return 4;
    default:
      return Number.NEGATIVE_INFINITY;
  }
}

function resolveBillingActionKind({
  canOpenPortal,
  hasCurrentSubscription,
  hasStripeManagedSubscription,
  isExactCurrentSelection,
  isUpgradePlanChange,
  selectedPlanAvailability,
}: {
  canOpenPortal: boolean;
  hasCurrentSubscription: boolean;
  hasStripeManagedSubscription: boolean;
  isExactCurrentSelection: boolean;
  isUpgradePlanChange: boolean;
  selectedPlanAvailability: BillingCatalogPlanItem["availability"];
}): BillingActionKind {
  if (selectedPlanAvailability === "free") {
    return "hidden";
  }

  if (isExactCurrentSelection) {
    return canOpenPortal ? "managePortal" : "hidden";
  }

  if (selectedPlanAvailability === "contactSales") {
    return "contactSales";
  }

  if (selectedPlanAvailability === "selfServe") {
    if (!hasCurrentSubscription || !hasStripeManagedSubscription) {
      return "start";
    }

    return isUpgradePlanChange ? "upgrade" : "downgrade";
  }

  return "contactSales";
}

function resolveBillingActionLabel(
  kind: BillingActionKind,
  t: BillingPaywallTranslator,
) {
  switch (kind) {
    case "start":
      return t("startPlan");
    case "upgrade":
      return t("upgradePlan");
    case "downgrade":
      return t("downgradePlan");
    case "managePortal":
      return t("manageCurrentSubscription");
    case "contactSales":
      return t("contactSales");
    case "hidden":
    default:
      return null;
  }
}

function isRecommendedPlan(plan: BillingCatalogPlanItem) {
  return plan.anchor || plan.code === "grow";
}

function PaywallBadge({
  platform,
  tone,
  text,
}: {
  platform: BookingPlatformVariant;
  text: string;
  tone: "accent" | "neutral";
}) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <XStack
      alignItems="center"
      backgroundColor={tone === "accent" ? "$primarySoft" : "$chromeBackground"}
      borderRadius={999}
      paddingHorizontal="$2.5"
      paddingVertical="$1.5"
    >
      <Text
        color={tone === "accent" ? "$primary" : "$textSecondary"}
        fontSize={surface.row.overlineFontSize}
        fontWeight="700"
        lineHeight={surface.row.overlineLineHeight}
        textTransform="uppercase"
      >
        {text}
      </Text>
    </XStack>
  );
}

function SeatTierRow({
  locale,
  platform,
  tier,
}: {
  locale: string;
  platform: BookingPlatformVariant;
  tier: NonNullable<ReturnType<typeof getBillingOffer>>["seatTiers"][number];
}) {
  const surface = getBookingSurfaceStyle(platform);
  const title =
    tier.toSeat === null || tier.toSeat === undefined
      ? `${tier.fromSeat}+`
      : tier.fromSeat === tier.toSeat
        ? `${tier.fromSeat}`
        : `${tier.fromSeat}-${tier.toSeat}`;

  return (
    <XStack alignItems="center" justifyContent="space-between">
      <Text
        color="$textSecondary"
        fontSize={surface.row.subtitleFontSize}
        lineHeight={surface.row.subtitleLineHeight}
      >
        {title}
      </Text>
      <Text
        color="$textPrimary"
        fontSize={surface.row.subtitleFontSize}
        fontWeight="600"
        lineHeight={surface.row.subtitleLineHeight}
      >
        {formatCurrency(tier.seatPrice.amount, tier.seatPrice.currency, locale)}
      </Text>
    </XStack>
  );
}

function PlanPickerCard({
  breakdown,
  interval,
  isSelected,
  locale,
  onSelect,
  plan,
  platform,
  t,
}: {
  breakdown: ReturnType<typeof calculateBillingBreakdown> | null;
  interval: BillingPlanIntervalValue;
  isSelected: boolean;
  locale: string;
  onSelect: () => void;
  plan: BillingCatalogPlanItem;
  platform: BookingPlatformVariant;
  t: BillingPaywallTranslator;
}) {
  const surface = getBookingSurfaceStyle(platform);
  const recommended = isRecommendedPlan(plan);
  const price = breakdown
    ? formatCurrency(breakdown.totalPrice.amount, breakdown.totalPrice.currency, locale)
    : plan.availability === "free"
      ? t("freePlanPrice")
      : t("customPricingLabel");
  const subtitle =
    plan.availability === "contactSales"
      ? t("customPricingLabel")
      : interval === "monthly"
        ? t("perMonth")
        : t("perYear");

  return (
    <YStack
      flexShrink={0}
      minHeight={100}
      width={100}
      paddingTop={0}
      style={{ scrollSnapAlign: "start", scrollMarginLeft: 16 }}
    >
      <ZStack width="100%">
        <Button
          alignItems="stretch"
          backgroundColor={isSelected ? "$primarySoft" : "transparent"}
          borderColor={isSelected ? "$primary" : "$separator"}
          borderRadius={16}
          borderWidth={1}
          chromeless
          flexDirection="column"
          height="auto"
          justifyContent="flex-start"
          onPress={onSelect}
          paddingHorizontal="$2.5"
          paddingTop={recommended ? "$4" : "$2.5"}
          paddingBottom="$3"
          pressStyle={{ opacity: 0.9 }}
          width="100%"
        >
          <YStack
            alignItems="flex-start"
            gap="$1.5"
            minWidth={0}
            width="100%"
          >
            <Text
              color="$textPrimary"
              flexShrink={1}
              fontSize="$3"
              fontWeight="700"
              numberOfLines={2}
              width="100%"
            >
              {plan.title}
            </Text>
            <Text
              color="$textPrimary"
              flexShrink={1}
              fontSize="$4"
              fontWeight="800"
              numberOfLines={1}
              width="100%"
            >
              {price}
            </Text>
            <Text
              color="$textSecondary"
              flexShrink={1}
              fontSize="$1"
              fontWeight="600"
              numberOfLines={1}
              width="100%"
            >
              {subtitle}
            </Text>
          </YStack>
        </Button>

        {recommended ? (
          <XStack
            justifyContent="center"
            left={0}
            position="absolute"
            right={0}
            top={-4}
          >
            <XStack
              alignItems="center"
              backgroundColor="$chromeBackground"
              borderRadius={999}
              paddingHorizontal="$2"
              paddingVertical="$1"
            >
              <Text
                color="$textSecondary"
                fontSize={surface.row.overlineFontSize}
                fontWeight="700"
                lineHeight={surface.row.overlineLineHeight}
                numberOfLines={1}
                textTransform="uppercase"
              >
                {t("recommended")}
              </Text>
            </XStack>
          </XStack>
        ) : null}
      </ZStack>
    </YStack>
  );
}

export default function BillingPage({
  authorization,
  catalog,
  deviceId,
  locale,
  salonId,
  salonProfile,
  summary,
}: BillingPageProps) {
  const t = useTranslations("booking.paywall");
  const { track } = useAnalytics();
  const platformInfo = usePlatform();
  void salonProfile;
  const platform: BookingPlatformVariant = platformInfo.isAndroid ? "android" : "ios";
  const surface = getBookingSurfaceStyle(platform);
  const pagePaddingX = "$2";
  const [billingSummary, setBillingSummary] = useState(summary);
  const [selectedInterval, setSelectedInterval] =
    useState<BillingPlanIntervalValue>(
      summary.currentSubscription?.interval ?? "monthly",
    );
  const [selectedPlanCode, setSelectedPlanCode] = useState<
    BillingCatalogPlanItem["code"]
  >(pickInitialPlanCode(catalog, summary));
  const [requestingPlanCode, setRequestingPlanCode] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [seatPricingExpanded, setSeatPricingExpanded] = useState(false);

  const activeSeats = Math.max(billingSummary.activeSeats, 1);
  const orderedPlans = useMemo(
    () => [...catalog.plans].sort((left, right) => planRank(left.code) - planRank(right.code)),
    [catalog.plans],
  );
  const selectedPlan = useMemo(() => {
    return (
      orderedPlans.find((plan) => plan.code === selectedPlanCode) ??
      orderedPlans[0]
    );
  }, [orderedPlans, selectedPlanCode]);
  const currentPlan = useMemo(() => {
    const currentPlanCode = billingSummary.currentSubscription?.planCode;

    if (!currentPlanCode) {
      return null;
    }

    return orderedPlans.find((plan) => plan.code === currentPlanCode) ?? null;
  }, [billingSummary.currentSubscription?.planCode, orderedPlans]);
  const selectedOffer = selectedPlan
    ? getBillingOffer(selectedPlan, selectedInterval)
    : null;
  const currentOffer =
    currentPlan && billingSummary.currentSubscription
      ? getBillingOffer(currentPlan, billingSummary.currentSubscription.interval)
      : null;
  const selectedBreakdown =
    selectedOffer && selectedPlan
      ? calculateBillingBreakdown(selectedOffer, activeSeats)
      : null;
  const currentBreakdown =
    currentOffer && currentPlan
      ? calculateBillingBreakdown(currentOffer, activeSeats)
      : null;
  const hasCurrentSubscription = billingSummary.currentSubscription !== null;
  const hasStripeManagedSubscription = Boolean(
    billingSummary.currentSubscription?.stripeId,
  );
  const canOpenPortal =
    billingSummary.customerPortalAvailable &&
    billingSummary.currentSubscription !== null;
  const isExactCurrentSelection =
    billingSummary.currentSubscription?.planCode === selectedPlanCode &&
    billingSummary.currentSubscription?.interval === selectedInterval;
  const selectedSelfServePlan =
    selectedPlan && selectedPlan.availability === "selfServe"
      ? selectedPlan
      : null;
  const selectedPlanRank = planRank(selectedPlanCode);
  const currentPlanRank = planRank(billingSummary.currentSubscription?.planCode);
  const isUpgradePlanChange =
    hasStripeManagedSubscription &&
    !isExactCurrentSelection &&
    selectedSelfServePlan !== null &&
    (selectedPlanRank !== currentPlanRank
      ? selectedPlanRank > currentPlanRank
      : (() => {
          const selAmt = selectedBreakdown?.totalPrice.amount;
          const curAmt = currentBreakdown?.totalPrice.amount;
          if (selAmt == null || curAmt == null) return false;
          const selMonthly =
            selectedInterval === "yearly" ? selAmt / 12 : selAmt;
          const curMonthly =
            billingSummary.currentSubscription?.interval === "yearly"
              ? curAmt / 12
              : curAmt;
          return selMonthly >= curMonthly;
        })());
  const selectedActionKind = selectedPlan
    ? resolveBillingActionKind({
        canOpenPortal,
        hasCurrentSubscription,
        hasStripeManagedSubscription,
        isExactCurrentSelection,
        isUpgradePlanChange,
        selectedPlanAvailability: selectedPlan.availability,
      })
    : "hidden";
  const selectedActionLabel = resolveBillingActionLabel(selectedActionKind, t);
  const shouldShowPrimaryAction =
    selectedActionKind !== "hidden" && selectedActionLabel !== null;
  const selectedPlanPrice = selectedBreakdown
    ? formatCurrency(
        selectedBreakdown.totalPrice.amount,
        selectedBreakdown.totalPrice.currency,
        locale,
      )
    : selectedPlan?.availability === "free"
      ? t("freePlanPrice")
      : t("customPricingLabel");

  useEffect(() => {
    setBillingSummary(summary);
  }, [summary]);

  useEffect(() => {
    track("billing_page_viewed", {
      activeSeats,
      has_salon_context: salonId ? 1 : 0,
    });
  }, [activeSeats, salonId, track]);

  const handleIntervalSelect = (interval: BillingPlanIntervalValue) => {
    setSelectedInterval(interval);
    setError(null);
    setNotice(null);
  };

  const handlePlanSelect = (planCode: BillingCatalogPlanItem["code"]) => {
    setSelectedPlanCode(planCode);
    setError(null);
    setNotice(null);
  };

  async function handleStartCheckout() {
    if (!selectedSelfServePlan || !isSelfServePlanCode(selectedPlanCode)) {
      return;
    }

    setRequestingPlanCode(selectedSelfServePlan.code);
    setError(null);
    setNotice(null);

    track("billing_plan_selected", {
      activeSeats,
      interval: selectedInterval,
      planId: selectedSelfServePlan.code,
    });

    try {
      const response = await fetch("/api/billing/checkout-session", {
        body: JSON.stringify({
          interval: selectedInterval,
          plan: selectedSelfServePlan.code,
        }),
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          "Device-ID": deviceId,
          "Idempotency-Key":
            window.crypto?.randomUUID?.() ??
            `${selectedSelfServePlan.code}-${Date.now()}`,
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || t("startCheckoutFailed"));
      }

      const data = (await response.json()) as { url: string };
      track("billing_checkout_started", {
        activeSeats,
        interval: selectedInterval,
        planId: selectedSelfServePlan.code,
      });
      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : t("startCheckoutFailed"),
      );
    } finally {
      setRequestingPlanCode(null);
    }
  }

  async function handleChangePlan() {
    if (!selectedSelfServePlan || !isSelfServePlanCode(selectedPlanCode)) {
      return;
    }

    setRequestingPlanCode(selectedSelfServePlan.code);
    setError(null);
    setNotice(null);

    track("billing_plan_change_requested", {
      activeSeats,
      interval: selectedInterval,
      kind: isUpgradePlanChange ? "upgrade" : "downgrade",
      planId: selectedSelfServePlan.code,
    });

    try {
      const response = await fetch("/api/billing/change-plan", {
        body: JSON.stringify({
          interval: selectedInterval,
          plan: selectedSelfServePlan.code,
        }),
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
          "Device-ID": deviceId,
          "Idempotency-Key":
            window.crypto?.randomUUID?.() ??
            `${selectedSelfServePlan.code}-${selectedInterval}-${Date.now()}`,
        },
        method: "POST",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(data.message || t("changePlanFailed"));
      }

      const data = (await response.json()) as BillingSummary;
      setBillingSummary(data);
      setNotice(
        isUpgradePlanChange ? t("planUpdated") : t("planChangeScheduled"),
      );
      track("billing_plan_change_completed", {
        activeSeats,
        interval: selectedInterval,
        kind: isUpgradePlanChange ? "upgrade" : "downgrade",
        planId: selectedSelfServePlan.code,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("changePlanFailed"),
      );
    } finally {
      setRequestingPlanCode(null);
    }
  }

  async function handleOpenPortal() {
    setIsOpeningPortal(true);
    setError(null);
    setNotice(null);

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
        throw new Error(data.message || t("portalFailed"));
      }

      const data = (await response.json()) as { url: string };
      window.location.href = data.url;
    } catch (requestError) {
      setError(
        requestError instanceof Error ? requestError.message : t("portalFailed"),
      );
      setIsOpeningPortal(false);
    }
  }

  function handleContactSales() {
    window.open(`/${locale}`, "_blank", "noopener,noreferrer");
  }

  function handlePrimaryAction() {
    if (selectedActionKind === "hidden") {
      return;
    }

    if (selectedActionKind === "managePortal") {
      void handleOpenPortal();
      return;
    }

    if (selectedActionKind === "contactSales") {
      handleContactSales();
      return;
    }

    if (selectedSelfServePlan && isSelfServePlanCode(selectedPlanCode) && selectedOffer) {
      if (hasStripeManagedSubscription) {
        void handleChangePlan();
        return;
      }

      void handleStartCheckout();
      return;
    }

    handleContactSales();
  }

  const primaryActionLoadingLabel =
    selectedActionKind === "start"
      ? t("openingCheckout")
      : selectedActionKind === "upgrade" || selectedActionKind === "downgrade"
        ? t("updatingPlan")
        : selectedActionKind === "managePortal"
          ? t("openingPortal")
          : selectedActionLabel;

  return (
    <YStack backgroundColor="$appBackground" flex={1}>
      <YStack flex={1} style={{ overflowY: "auto" }}>
        <SheetRoot platform={platform}>
          <YStack
            alignSelf="center"
            gap="$2"
            maxWidth={560}
            paddingTop="$2"
            style={{
              paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))",
            }}
            width="100%"
          >
            {canOpenPortal ? (
              <YStack gap="$2">
                <YStack paddingHorizontal={pagePaddingX}>
                  <XStack alignItems="center" justifyContent="space-between" gap="$3">
                    <Text
                      color="$textSecondary"
                      fontSize={surface.row.overlineFontSize}
                      fontWeight="700"
                      lineHeight={surface.row.overlineLineHeight}
                      textTransform="uppercase"
                    >
                      {t("manageSubscriptionSection")}
                    </Text>

                    <Button
                      alignItems="center"
                      backgroundColor="transparent"
                      borderRadius={999}
                      borderColor="transparent"
                      borderWidth={0}
                      chromeless
                      cursor="pointer"
                      flexShrink={0}
                      justifyContent="center"
                      minHeight={28}
                      onPress={() => void handleOpenPortal()}
                      paddingHorizontal="$3"
                      paddingVertical="$1"
                      pressStyle={{ opacity: 0.72 }}
                    >
                      <XStack alignItems="center" gap="$1.5">
                        <Text color="$primary" fontSize="$2" fontWeight="700">
                          {isOpeningPortal
                            ? t("openingPortal")
                            : t("manageSubscriptionInlineAction")}
                        </Text>
                        <Text color="$primary">
                          <ArrowUpRight size={14} />
                        </Text>
                      </XStack>
                    </Button>
                  </XStack>
                </YStack>

                {selectedPlan ? (
                  <YStack paddingHorizontal={pagePaddingX}>
                    <YStack backgroundColor="$separator" height={1} width="100%" />
                  </YStack>
                ) : null}
              </YStack>
            ) : null}

            {selectedPlan ? (
              <YStack
                gap="$4"
                paddingHorizontal={pagePaddingX}
              >
                <YStack gap="$4">
                  <XStack alignItems="flex-start" justifyContent="space-between" gap="$3">
                    <YStack flex={1} gap="$2">
                      <XStack alignItems="center" flexWrap="wrap" gap="$2">
                        <Text color="$textPrimary" fontSize="$6" fontWeight="800">
                          {selectedPlan.title}
                        </Text>
                        {billingSummary.currentSubscription?.planCode === selectedPlan.code ? (
                          <PaywallBadge
                            platform={platform}
                            text={t("current")}
                            tone="accent"
                          />
                        ) : null}
                        {isRecommendedPlan(selectedPlan) &&
                        billingSummary.currentSubscription?.planCode !== selectedPlan.code ? (
                          <PaywallBadge
                            platform={platform}
                            text={t("recommended")}
                            tone="neutral"
                          />
                        ) : null}
                      </XStack>

                      <Paragraph
                        color="$textSecondary"
                        fontSize={surface.row.subtitleFontSize}
                        lineHeight={surface.row.subtitleLineHeight}
                      >
                        {selectedPlan.summary}
                      </Paragraph>
                    </YStack>

                    <YStack alignItems="flex-end" gap="$0.5">
                      <Text color="$primary" fontSize="$6" fontWeight="800" textAlign="right">
                        {selectedPlanPrice}
                      </Text>
                      <Text color="$textSecondary" fontSize="$2" fontWeight="600">
                        {selectedPlan.availability === "contactSales"
                          ? t("customPricingLabel")
                          : selectedInterval === "yearly"
                            ? t("perYear")
                            : t("perMonth")}
                      </Text>
                    </YStack>
                  </XStack>

                  {selectedOffer && selectedBreakdown ? (
                    <YStack gap="$1">
                      <XStack alignItems="center" justifyContent="space-between" gap="$3">
                        <Text color="$textSecondary" fontSize="$3" fontWeight="600">
                          {t("activeStaff")}
                        </Text>
                        <Text color="$textPrimary" fontSize="$3" fontWeight="600">
                          {`${activeSeats}+${selectedBreakdown.includedSeats}`}
                        </Text>
                      </XStack>
                      <XStack alignItems="center" justifyContent="space-between" gap="$3">
                        <Text color="$textSecondary" fontSize="$3" fontWeight="600">
                          {t("baseSubscription")}
                        </Text>
                        <Text color="$textPrimary" fontSize="$3" fontWeight="600">
                          {formatCurrency(
                            selectedOffer.basePrice.amount,
                            selectedOffer.basePrice.currency,
                            locale,
                          )}
                        </Text>
                      </XStack>

                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        gap="$3"
                        onPress={() => setSeatPricingExpanded((prev) => !prev)}
                        cursor="pointer"
                        pressStyle={{ opacity: 0.7 }}
                      >
                        <Text color="$textSecondary" fontSize="$3" fontWeight="600">
                          {t("seatPricingLabel")}
                        </Text>
                        <XStack alignItems="center" gap="$2">
                          <Text color="$textPrimary" fontSize="$3" fontWeight="600">
                            {selectedBreakdown.tierLines.length > 0
                              ? `${formatCurrency(
                                  selectedBreakdown.tierLines[0].unitPrice.amount,
                                  selectedBreakdown.tierLines[0].unitPrice.currency,
                                  locale,
                                )} ${t("perEach")}`
                              : t("includedSeats")}
                          </Text>
                          <Text
                            color="$textSecondary"
                            style={{
                              transform: seatPricingExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 160ms ease",
                            }}
                          >
                            <ChevronDown size={16} />
                          </Text>
                        </XStack>
                      </XStack>

                      {seatPricingExpanded ? (
                        <YStack gap="$2" paddingLeft="$2">
                          {selectedOffer.seatTiers.map((tier) => (
                            <SeatTierRow
                              key={`${tier.fromSeat}-${tier.toSeat ?? "plus"}`}
                              locale={locale}
                              platform={platform}
                              tier={tier}
                            />
                          ))}
                        </YStack>
                      ) : null}
                    </YStack>
                  ) : (
                    <Text
                      color="$textSecondary"
                      fontSize={surface.row.subtitleFontSize}
                      lineHeight={surface.row.subtitleLineHeight}
                    >
                      {selectedPlan.availability === "free"
                        ? t("freePlanTerms")
                        : t("customBillingTerms")}
                    </Text>
                  )}

                  {shouldShowPrimaryAction || selectedPlan.availability === "selfServe" ? (
                    <YStack gap="$2">
                      {shouldShowPrimaryAction ? (
                        <PrimaryAction
                          disabled={requestingPlanCode !== null || isOpeningPortal}
                          onPress={handlePrimaryAction}
                          platform={platform}
                        >
                          <Text
                            color="white"
                            fontSize={surface.action.textFontSize}
                            fontWeight="700"
                          >
                            {requestingPlanCode === selectedPlanCode || isOpeningPortal
                              ? primaryActionLoadingLabel
                              : selectedActionLabel}
                          </Text>
                        </PrimaryAction>
                      ) : null}

                      {selectedPlan.availability === "selfServe" ? (
                        <Button
                          backgroundColor="transparent"
                          borderColor="transparent"
                          borderRadius={999}
                          borderWidth={0}
                          chromeless
                          minHeight={50}
                          onPress={() =>
                            handleIntervalSelect(
                              selectedInterval === "monthly" ? "yearly" : "monthly",
                            )
                          }
                          pressStyle={{ opacity: 0.88 }}
                          width="100%"
                        >
                          <Text
                            alignSelf="center"
                            color="$primary"
                            fontSize={surface.action.textFontSize}
                            fontWeight="700"
                            textAlign="center"
                          >
                            {selectedInterval === "monthly"
                              ? `${t("switchToYearly")} · ${t("annualBadge")}`
                              : t("switchToMonthly")}
                          </Text>
                        </Button>
                      ) : null}
                    </YStack>
                  ) : null}
                </YStack>
              </YStack>
            ) : null}

            <YStack paddingHorizontal={pagePaddingX}>
              <Text
                color="$textSecondary"
                fontSize={surface.row.overlineFontSize}
                fontWeight="700"
                lineHeight={surface.row.overlineLineHeight}
                textTransform="uppercase"
              >
                {t("choosePlanSection")}
              </Text>
            </YStack>

            <YStack
              alignSelf="center"
              style={{
                marginLeft: "calc(50% - 50vw)",
                marginRight: "calc(50% - 50vw)",
                width: "100vw",
              }}
            >
              <XStack
                alignItems="flex-end"
                gap="$3"
                style={{
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingTop: 4,
                  paddingBottom: 0,
                  overflowX: "auto",
                  overflowY: "hidden",
                  overscrollBehaviorX: "contain",
                  overscrollBehaviorY: "none",
                  scrollSnapType: "x proximity",
                  touchAction: "pan-x",
                  WebkitOverflowScrolling: "touch",
                  scrollbarWidth: "none",
                }}
              >
                {orderedPlans.map((plan) => {
                  const offer = getBillingOffer(plan, selectedInterval);
                  const breakdown =
                    offer ? calculateBillingBreakdown(offer, activeSeats) : null;

                  return (
                    <PlanPickerCard
                      key={plan.code}
                      breakdown={breakdown}
                      interval={selectedInterval}
                      isSelected={selectedPlanCode === plan.code}
                      locale={locale}
                      onSelect={() => handlePlanSelect(plan.code)}
                      plan={plan}
                      platform={platform}
                      t={t}
                    />
                  );
                })}
              </XStack>
            </YStack>

            <YStack paddingHorizontal={pagePaddingX}>
              <Paragraph color="$textSecondary" fontSize="$3" textAlign="center">
                {t("billingLegalPrefix")}{" "}
                <Anchor
                  color="$primary"
                  fontSize="$3"
                  href="/terms.html"
                  hoverStyle={{ opacity: 0.72 }}
                  pressStyle={{ opacity: 0.72 }}
                  rel="noopener noreferrer"
                  target="_blank"
                  textDecorationLine="none"
                >
                  {t("termsAndConditions")}
                </Anchor>{" "}
                {t("billingConsentAnd")}{" "}
                <Anchor
                  color="$primary"
                  fontSize="$3"
                  href="/billing-addendum.html"
                  hoverStyle={{ opacity: 0.72 }}
                  pressStyle={{ opacity: 0.72 }}
                  rel="noopener noreferrer"
                  target="_blank"
                  textDecorationLine="none"
                >
                  {t("billingAddendumLink")}
                </Anchor>
                .
              </Paragraph>
            </YStack>

            {error ? (
              <SectionCard
                borderColor="$danger"
                borderWidth={1}
                platform={platform}
                padding="$3"
              >
                <Text color="$danger" fontSize="$3" fontWeight="600">
                  {error}
                </Text>
              </SectionCard>
            ) : null}

            {notice ? (
              <SectionCard
                borderColor="$primary"
                borderWidth={1}
                platform={platform}
                padding="$3"
              >
                <Text color="$primary" fontSize="$3" fontWeight="600">
                  {notice}
                </Text>
              </SectionCard>
            ) : null}
          </YStack>
        </SheetRoot>
      </YStack>
    </YStack>
  );
}
