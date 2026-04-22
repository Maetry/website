"use client";

import React, { useEffect, useRef, useState } from "react";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Link,
  SimpleGrid,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import {
  AlertCircle,
  ArrowRight,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  LifeBuoy,
  Mail,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { useAnalytics } from "@/shared/analytics/useAnalytics";
import { MarketingEyebrow } from "@/shared/chakra/marketing";

type SupportRole = "client" | "salon_owner" | "team_member" | "partner_other";
type SupportIssueType =
  | "booking"
  | "account"
  | "billing"
  | "technical"
  | "partnership"
  | "privacy";

type SupportFormState = {
  role: SupportRole;
  issueType: SupportIssueType;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  description: string;
  consent: boolean;
  bookingSubType: string;
  salonName: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  bookingReference: string;
  paymentAmount: string;
  accountEmail: string;
  affectedRole: string;
  accountProblemType: string;
  productOrPlan: string;
  businessName: string;
  chargeDate: string;
  chargeAmount: string;
  billingSubType: string;
  platform: string;
  appVersion: string;
  browser: string;
  reproductionSteps: string;
  occurredAt: string;
  severity: string;
  privacyRequestType: string;
  region: string;
  privacyDetails: string;
};

type SubmissionResult =
  | {
      bodyTruncated?: boolean;
      delivery: "mailto";
      email: string;
      mailtoHref: string;
    }
  | {
      delivery: "webhook";
      email: string;
    };

const FormEl = chakra("form");
const Label = chakra("label");
const InputEl = chakra("input");
const SelectEl = chakra("select");
const TextareaEl = chakra("textarea");
const ButtonEl = chakra("button");

const INITIAL_STATE: SupportFormState = {
  role: "client",
  issueType: "booking",
  fullName: "",
  email: "",
  phone: "",
  subject: "",
  description: "",
  consent: false,
  bookingSubType: "",
  salonName: "",
  appointmentDate: "",
  appointmentTime: "",
  location: "",
  bookingReference: "",
  paymentAmount: "",
  accountEmail: "",
  affectedRole: "",
  accountProblemType: "",
  productOrPlan: "",
  businessName: "",
  chargeDate: "",
  chargeAmount: "",
  billingSubType: "",
  platform: "",
  appVersion: "",
  browser: "",
  reproductionSteps: "",
  occurredAt: "",
  severity: "",
  privacyRequestType: "",
  region: "",
  privacyDetails: "",
};

function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Flex align="center" justify="space-between" mb={2}>
        <Label
          htmlFor={htmlFor}
          fontSize="sm"
          fontWeight="semibold"
          color="marketing.fg"
        >
          {label}
        </Label>
        {required ? (
          <Text fontSize="xs" color="marketing.fgSubtle">
            *
          </Text>
        ) : null}
      </Flex>
      {children}
      {error ? (
        <Text mt={2} fontSize="xs" color="#C53030">
          {error}
        </Text>
      ) : hint ? (
        <Text mt={2} fontSize="xs" color="marketing.fgSubtle">
          {hint}
        </Text>
      ) : null}
    </Box>
  );
}

function inputStyles(hasError: boolean) {
  return {
    w: "full",
    rounded: "xl",
    borderWidth: "1px",
    borderColor: hasError ? "#FC8181" : "marketing.border",
    bg: { base: "white", _dark: "rgba(255,255,255,0.03)" },
    color: "marketing.fg",
    px: 4,
    py: 3,
    fontSize: "sm",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s, background-color 0.2s",
    _focusVisible: {
      borderColor: "marketing.accent",
      boxShadow: "0 0 0 3px rgba(49,130,206,0.18)",
    },
    _placeholder: {
      color: "marketing.fgSubtle",
    },
  } as const;
}

export function SupportPageView({
  locale,
  supportMailHref,
  appHref,
  telegramHref,
  consumerHref,
  businessHref,
}: {
  locale: string;
  supportMailHref: string;
  appHref: string;
  telegramHref: string;
  consumerHref: string;
  businessHref: string;
}) {
  const t = useTranslations("support");
  const { track } = useAnalytics();
  const [form, setForm] = useState<SupportFormState>(INITIAL_STATE);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const startedRef = useRef(false);

  const prepItems = t.raw("prepare.items") as string[];
  const roleCards = [
    {
      description: t("hero.roleCards.client.description"),
      title: t("hero.roleCards.client.title"),
      value: "client" as const,
    },
    {
      description: t("hero.roleCards.salon.description"),
      title: t("hero.roleCards.salon.title"),
      value: "salon_owner" as const,
    },
  ];

  const quickActions = [
    { label: t("quickActions.booking"), value: "booking" as const },
    { label: t("quickActions.account"), value: "account" as const },
    { label: t("quickActions.billing"), value: "billing" as const },
  ];

  useEffect(() => {
    track("support_page_viewed", { locale });
  }, [locale, track]);

  function translateFieldError(key: string, code?: string) {
    if (!code) {
      return undefined;
    }

    if (code === "INVALID_EMAIL") {
      return t("form.errors.invalidEmail");
    }

    if (code === "INVALID_ROLE" || code === "INVALID_ISSUE_TYPE") {
      return t("form.errors.selection");
    }

    if (key === "consent") {
      return t("form.errors.consent");
    }

    return t("form.errors.required");
  }

  function markFormStarted() {
    if (startedRef.current) {
      return;
    }

    startedRef.current = true;
    track("support_form_started", {
      issue_type: form.issueType,
      locale,
      role: form.role,
    });
  }

  function updateField<K extends keyof SupportFormState>(key: K, value: SupportFormState[K]) {
    markFormStarted();
    setForm((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
    setServerError(null);
  }

  function pickRole(role: SupportRole) {
    markFormStarted();
    setForm((current) => ({ ...current, role }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.role;
      return next;
    });
    track("support_role_selected", { locale, role });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function pickIssueType(issueType: SupportIssueType) {
    markFormStarted();
    setForm((current) => ({ ...current, issueType }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next.issueType;
      return next;
    });
    track("support_issue_selected", { issue_type: issueType, locale, role: form.role });
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    markFormStarted();
    setIsSubmitting(true);
    setServerError(null);

    const payload = {
      consent: form.consent,
      description: form.description,
      email: form.email,
      fullName: form.fullName,
      issueType: form.issueType,
      locale,
      metadata: {
        accountEmail: form.accountEmail,
        accountProblemType: form.accountProblemType,
        affectedRole: form.affectedRole,
        appVersion:
          form.platform === "web" ? form.browser : form.appVersion,
        appointmentDate: form.appointmentDate,
        appointmentTime: form.appointmentTime,
        billingSubType: form.billingSubType,
        bookingReference: form.bookingReference,
        bookingSubType: form.bookingSubType,
        businessName: form.businessName,
        chargeAmount: form.chargeAmount,
        chargeDate: form.chargeDate,
        location: form.location,
        occurredAt: form.occurredAt,
        paymentAmount: form.paymentAmount,
        platform: form.platform,
        privacyDetails: form.privacyDetails,
        privacyRequestType: form.privacyRequestType,
        productOrPlan: form.productOrPlan,
        region: form.region,
        reproductionSteps: form.reproductionSteps,
        salonName: form.salonName,
        severity: form.severity,
      },
      phone: form.phone,
      role: form.role,
      subject: form.subject,
    };

    try {
      const response = await fetch("/api/support", {
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as
        | {
            error?: string;
            fieldErrors?: Record<string, string>;
            delivery?: "mailto" | "webhook";
            mailtoHref?: string;
            bodyTruncated?: boolean;
            attachmentCount?: number;
          }
        | undefined;

      if (!response.ok) {
        if (data?.fieldErrors) {
          const nextErrors = Object.fromEntries(
            Object.entries(data.fieldErrors).map(([key, code]) => [
              key,
              translateFieldError(key, code),
            ]),
          ) as Record<string, string>;
          setFieldErrors(nextErrors);
        } else {
          setServerError(t("form.errors.submit"));
        }
        return;
      }

      if (data?.delivery === "mailto" && data.mailtoHref) {
        track("support_form_submitted", {
          attachment_count: Number(data.attachmentCount ?? 0),
          delivery: "mailto",
          issue_type: form.issueType,
          locale,
          role: form.role,
        });
        track("support_email_fallback", {
          issue_type: form.issueType,
          locale,
          source: "submit",
        });
        setResult({
          bodyTruncated: Boolean(data.bodyTruncated),
          delivery: "mailto",
          email: form.email,
          mailtoHref: data.mailtoHref,
        });
        return;
      }

      track("support_form_submitted", {
        delivery: "webhook",
        issue_type: form.issueType,
        locale,
        role: form.role,
      });
      setResult({
        delivery: "webhook",
        email: form.email,
      });
      setForm(INITIAL_STATE);
      setFieldErrors({});
      startedRef.current = false;
    } catch {
      setServerError(t("form.errors.submit"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDirectEmailClick(source: "hero" | "self_serve" | "success") {
    track("support_email_fallback", {
      issue_type: form.issueType,
      locale,
      source,
    });
  }

  const issueTypeLabel = t(`form.issueTypes.${form.issueType}`);
  const showBookingFields = form.issueType === "booking";
  const showAccountFields = form.issueType === "account";
  const showBillingFields = form.issueType === "billing";
  const showTechnicalFields = form.issueType === "technical";
  const showPrivacyFields = form.issueType === "privacy";
  const showPartnershipFields = form.issueType === "partnership";

  if (result) {
    return (
      <Box as="main" py={{ base: 12, lg: 16 }}>
        <Container maxW="4xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack
            rounded="2xl"
            borderWidth="1px"
            borderColor="marketing.border"
            bg="marketing.surface"
            px={{ base: 6, lg: 10 }}
            py={{ base: 10, lg: 12 }}
            align="stretch"
            gap={6}
          >
            <Flex
              h={14}
              w={14}
              align="center"
              justify="center"
              rounded="full"
              bg="rgba(49,130,206,0.12)"
              color="marketing.accent"
            >
              <CircleCheckBig size={28} />
            </Flex>
            <Box>
              <MarketingEyebrow variant="section">{t("success.eyebrow")}</MarketingEyebrow>
              <Heading
                as="h1"
                mt={4}
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
                color="marketing.fg"
              >
                {result.delivery === "webhook"
                  ? t("success.submittedTitle")
                  : t("success.mailtoTitle")}
              </Heading>
              <Text mt={4} fontSize="lg" lineHeight={1.75} color="marketing.fgMuted">
                {result.delivery === "webhook"
                  ? t("success.submittedBody", { email: result.email })
                  : t("success.mailtoBody", { email: result.email })}
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
              <Box
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.04)" }}
                p={5}
              >
                <Text fontSize="sm" fontWeight="semibold" color="marketing.fg">
                  {t("success.nextTitle")}
                </Text>
                <VStack mt={4} gap={3} align="stretch">
                  <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                    {result.delivery === "webhook"
                      ? t("success.nextReply")
                      : t("success.nextMailto")}
                  </Text>
                  {result.delivery === "mailto" && result.bodyTruncated ? (
                    <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                      {t("success.truncatedHint")}
                    </Text>
                  ) : null}
                  <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                    {t("success.urgent")}
                  </Text>
                </VStack>
              </Box>

              <Box
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.cardDark"
                color="white"
                p={5}
              >
                <Text fontSize="sm" fontWeight="semibold" color="rgba(255,255,255,0.72)">
                  {t("success.otherWaysTitle")}
                </Text>
                <VStack mt={4} gap={3} align="stretch">
                  <Link
                    href={supportMailHref}
                    onClick={() => handleDirectEmailClick("success")}
                    color="white"
                    textDecoration="none"
                  >
                    <Flex align="center" justify="space-between">
                      <Text fontSize="sm">{supportMailHref.replace(/^mailto:/i, "")}</Text>
                      <ChevronRight size={16} />
                    </Flex>
                  </Link>
                  <Link href={consumerHref} color="rgba(255,255,255,0.72)" textDecoration="none">
                    <Flex align="center" justify="space-between">
                      <Text fontSize="sm">{t("success.homeLink")}</Text>
                      <ChevronRight size={16} />
                    </Flex>
                  </Link>
                  <Link href={businessHref} color="rgba(255,255,255,0.72)" textDecoration="none">
                    <Flex align="center" justify="space-between">
                      <Text fontSize="sm">{t("success.businessLink")}</Text>
                      <ChevronRight size={16} />
                    </Flex>
                  </Link>
                </VStack>
              </Box>
            </SimpleGrid>

            <Flex gap={3} flexWrap="wrap">
              <ButtonEl
                type="button"
                onClick={() => {
                  setResult(null);
                  setForm(INITIAL_STATE);
                  setFieldErrors({});
                  setServerError(null);
                }}
                rounded="full"
                bg="marketing.accent"
                px={6}
                py={3}
                fontSize="sm"
                fontWeight="semibold"
                color="white"
              >
                {t("success.newRequest")}
              </ButtonEl>
              {result.delivery === "mailto" ? (
                <Link
                  href={result.mailtoHref}
                  onClick={() => handleDirectEmailClick("success")}
                  rounded="full"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  px={6}
                  py={3}
                  fontSize="sm"
                  fontWeight="semibold"
                  color="marketing.fg"
                  textDecoration="none"
                >
                  {t("success.openDraft")}
                </Link>
              ) : (
                <Link
                  href={supportMailHref}
                  onClick={() => handleDirectEmailClick("success")}
                  rounded="full"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  px={6}
                  py={3}
                  fontSize="sm"
                  fontWeight="semibold"
                  color="marketing.fg"
                  textDecoration="none"
                >
                  {t("success.emailAction")}
                </Link>
              )}
            </Flex>
          </VStack>
        </Container>
      </Box>
    );
  }

  return (
    <Box as="main" w="full">
      <Box
        as="section"
        pt={{ base: 10, lg: 14 }}
        pb={{ base: 12, lg: 14 }}
        bg={{ base: "white", _dark: "#0b0d12" }}
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Grid templateColumns={{ base: "1fr", lg: "1.1fr 0.9fr" }} gap={{ base: 8, lg: 10 }}>
            <VStack align="stretch" gap={6}>
              <MarketingEyebrow variant="hero">{t("hero.eyebrow")}</MarketingEyebrow>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", sm: "5xl", lg: "4.5rem" }}
                lineHeight={1.02}
                letterSpacing="-0.05em"
                fontWeight="semibold"
                color="marketing.fg"
                maxW="5xl"
              >
                {t("hero.title")}
              </Heading>
              <Text maxW="3xl" fontSize={{ base: "md", sm: "lg" }} lineHeight={1.8} color="marketing.fgMuted">
                {t("hero.subtitle")}
              </Text>
              <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                <Box
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  bg="marketing.surface"
                  p={5}
                >
                  <Flex align="center" gap={3}>
                    <Clock3 size={18} />
                    <Text fontSize="sm" fontWeight="semibold" color="marketing.fg">
                      {t("hero.responseTitle")}
                    </Text>
                  </Flex>
                  <Text mt={3} fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                    {t("hero.responseBody")}
                  </Text>
                </Box>
                <Box
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  bg="marketing.cardDark"
                  color="white"
                  p={5}
                >
                  <Flex align="center" gap={3}>
                    <AlertCircle size={18} />
                    <Text fontSize="sm" fontWeight="semibold">
                      {t("hero.urgentTitle")}
                    </Text>
                  </Flex>
                  <Text mt={3} fontSize="sm" lineHeight={1.7} color="rgba(255,255,255,0.72)">
                    {t("hero.urgentBody")}
                  </Text>
                </Box>
              </SimpleGrid>
            </VStack>

            <Box
              rounded="2.25rem"
              borderWidth="1px"
              borderColor="marketing.border"
              bg="marketing.surface"
              p={{ base: 6, lg: 7 }}
              boxShadow="0 24px 80px rgba(19,19,26,0.08)"
            >
              <Text
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="marketing.accent"
              >
                {t("hero.cardEyebrow")}
              </Text>
              <VStack mt={5} gap={4} align="stretch">
                {[t("hero.cardPoints.one"), t("hero.cardPoints.two"), t("hero.cardPoints.three")].map(
                  (line) => (
                    <Flex
                      key={line}
                      gap={3}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor="marketing.border"
                      bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.03)" }}
                      px={4}
                      py={4}
                    >
                      <Box mt="2px" color="marketing.accent">
                        <CircleCheckBig size={16} />
                      </Box>
                      <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                        {line}
                      </Text>
                    </Flex>
                  ),
                )}
              </VStack>
              <Flex mt={6} gap={3} flexWrap="wrap">
                <Link
                  href={supportMailHref}
                  onClick={() => handleDirectEmailClick("hero")}
                  rounded="full"
                  bg="marketing.accent"
                  px={5}
                  py={3}
                  color="white"
                  fontSize="sm"
                  fontWeight="semibold"
                  textDecoration="none"
                >
                  {t("hero.emailAction")}
                </Link>
                <Link
                  href="#support-form"
                  rounded="full"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  px={5}
                  py={3}
                  color="marketing.fg"
                  fontSize="sm"
                  fontWeight="semibold"
                  textDecoration="none"
                >
                  {t("hero.formAction")}
                </Link>
              </Flex>
            </Box>
          </Grid>
        </Container>
      </Box>

      <Box as="section" id="roles" pb={{ base: 12, lg: 14 }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Flex align={{ base: "flex-start", lg: "center" }} justify="space-between" gap={6} direction={{ base: "column", lg: "row" }}>
            <Box maxW="2xl">
              <MarketingEyebrow variant="section">{t("roleSection.eyebrow")}</MarketingEyebrow>
              <Heading
                as="h2"
                mt={4}
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
                color="marketing.fg"
              >
                {t("roleSection.title")}
              </Heading>
            </Box>
            <Text maxW="2xl" fontSize="sm" lineHeight={1.75} color="marketing.fgMuted">
              {t("roleSection.body")}
            </Text>
          </Flex>

          <SimpleGrid columns={{ base: 1, md: 2 }} gap={5} mt={8}>
            {roleCards.map((card) => {
              const isActive =
                card.value === form.role ||
                (card.value === "salon_owner" && form.role === "team_member");

              return (
                <ButtonEl
                  key={card.value}
                  type="button"
                  onClick={() => pickRole(card.value)}
                  textAlign="left"
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor={isActive ? "marketing.accent" : "marketing.border"}
                  bg={isActive ? "rgba(49,130,206,0.08)" : "marketing.surface"}
                  p={{ base: 6, lg: 7 }}
                  transition="border-color 0.2s, transform 0.2s, background-color 0.2s"
                  _hover={{ transform: "translateY(-1px)" }}
                >
                  <Flex align="center" justify="space-between" gap={4}>
                    <Text fontSize="2xl" fontWeight="semibold" color="marketing.fg">
                      {card.title}
                    </Text>
                    <ArrowRight size={20} color="currentColor" />
                  </Flex>
                  <Text mt={4} fontSize="sm" lineHeight={1.8} color="marketing.fgMuted">
                    {card.description}
                  </Text>
                </ButtonEl>
              );
            })}
          </SimpleGrid>

          <Grid
            mt={{ base: 10, lg: 12 }}
            templateColumns={{ base: "1fr", xl: "0.9fr 1.1fr" }}
            gap={{ base: 8, xl: 10 }}
            alignItems="start"
          >
            <VStack align="stretch" gap={5}>
              <Box
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.cardDark"
                color="white"
                p={{ base: 6, lg: 7 }}
              >
                <MarketingEyebrow variant="section" color="rgba(255,255,255,0.55)">
                  {t("quickActions.eyebrow")}
                </MarketingEyebrow>
                <Heading
                  as="h2"
                  mt={4}
                  fontSize={{ base: "3xl", sm: "4xl" }}
                  fontWeight="semibold"
                  letterSpacing="-0.04em"
                >
                  {t("quickActions.title")}
                </Heading>
                <Text mt={4} fontSize="sm" lineHeight={1.75} color="rgba(255,255,255,0.72)">
                  {t("quickActions.body")}
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 3 }} gap={3} mt={7}>
                  {quickActions.map((item) => (
                    <ButtonEl
                      key={item.value}
                      type="button"
                      onClick={() => pickIssueType(item.value)}
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor={
                        form.issueType === item.value ? "white" : "rgba(255,255,255,0.14)"
                      }
                      bg={
                        form.issueType === item.value
                          ? "rgba(255,255,255,0.12)"
                          : "rgba(255,255,255,0.04)"
                      }
                      px={4}
                      py={5}
                      textAlign="left"
                    >
                      <Text fontSize="sm" fontWeight="semibold" color="white">
                        {item.label}
                      </Text>
                    </ButtonEl>
                  ))}
                </SimpleGrid>
              </Box>

              <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4}>
                {[
                  {
                    body: t("selfServe.emailBody"),
                    href: supportMailHref,
                    icon: Mail,
                    key: "email",
                    onClick: () => handleDirectEmailClick("self_serve"),
                    title: t("selfServe.emailTitle"),
                  },
                  {
                    body: t("selfServe.appBody"),
                    href: appHref,
                    icon: Sparkles,
                    key: "app",
                    title: t("selfServe.appTitle"),
                  },
                  {
                    body: t("selfServe.telegramBody"),
                    href: telegramHref,
                    icon: LifeBuoy,
                    key: "telegram",
                    title: t("selfServe.telegramTitle"),
                  },
                ].map((item) => (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={item.onClick}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    textDecoration="none"
                  >
                    <Box
                      rounded="2xl"
                      borderWidth="1px"
                      borderColor="marketing.border"
                      bg="marketing.surface"
                      p={5}
                      h="full"
                    >
                      <Box color="marketing.accent">
                        <item.icon size={18} />
                      </Box>
                      <Text mt={4} fontSize="sm" fontWeight="semibold" color="marketing.fg">
                        {item.title}
                      </Text>
                      <Text mt={2} fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                        {item.body}
                      </Text>
                    </Box>
                  </Link>
                ))}
              </SimpleGrid>

              <Box
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.04)" }}
                p={{ base: 6, lg: 7 }}
              >
                <Text fontSize="sm" fontWeight="semibold" letterSpacing="0.16em" textTransform="uppercase" color="marketing.accent">
                  {t("prepare.eyebrow")}
                </Text>
                <Heading
                  as="h2"
                  mt={4}
                  fontSize={{ base: "2xl", sm: "3xl" }}
                  fontWeight="semibold"
                  letterSpacing="-0.04em"
                  color="marketing.fg"
                >
                  {t("prepare.title")}
                </Heading>
                <VStack as="ul" mt={6} gap={3} align="stretch" listStyleType="none" pl={0}>
                  {prepItems.map((item) => (
                    <Flex
                      as="li"
                      key={item}
                      gap={3}
                      rounded="xl"
                      borderWidth="1px"
                      borderColor="marketing.border"
                      bg="marketing.surface"
                      px={4}
                      py={3}
                    >
                      <Box mt="2px" color="marketing.accent">
                        <CircleCheckBig size={16} />
                      </Box>
                      <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                        {item}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>

              <Box
                rounded="2xl"
                borderWidth="1px"
                borderColor="rgba(197,48,48,0.18)"
                bg={{ base: "rgba(197,48,48,0.04)", _dark: "rgba(197,48,48,0.10)" }}
                p={{ base: 6, lg: 7 }}
              >
                <Flex align="center" gap={3}>
                  <ShieldAlert size={18} color="#C53030" />
                  <Text fontSize="sm" fontWeight="semibold" color="marketing.fg">
                    {t("warning.title")}
                  </Text>
                </Flex>
                <Text mt={4} fontSize="sm" lineHeight={1.8} color="marketing.fgMuted">
                  {t("warning.body")}
                </Text>
              </Box>
            </VStack>

            <Box
              id="support-form"
              ref={formRef}
              rounded="2.25rem"
              borderWidth="1px"
              borderColor="marketing.border"
              bg="marketing.surface"
              p={{ base: 6, lg: 8 }}
              boxShadow="0 28px 90px rgba(19,19,26,0.09)"
              position={{ base: "static", xl: "sticky" }}
              top={{ xl: "96px" }}
            >
              <Text
                fontSize="xs"
                fontWeight="semibold"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="marketing.accent"
              >
                {t("form.eyebrow")}
              </Text>
              <Heading
                as="h2"
                mt={4}
                fontSize={{ base: "3xl", sm: "3.5xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
                color="marketing.fg"
              >
                {t("form.title")}
              </Heading>
              <Text mt={4} fontSize="sm" lineHeight={1.75} color="marketing.fgMuted">
                {t("form.intro", { issueType: issueTypeLabel })}
              </Text>

              {serverError ? (
                <Box
                  mt={5}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="rgba(197,48,48,0.18)"
                  bg={{ base: "rgba(197,48,48,0.04)", _dark: "rgba(197,48,48,0.10)" }}
                  px={4}
                  py={3}
                >
                  <Text fontSize="sm" color="marketing.fg">
                    {serverError}
                  </Text>
                </Box>
              ) : null}

              <FormEl mt={7} onSubmit={handleSubmit}>
                <VStack gap={5} align="stretch">
                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field
                      htmlFor="role"
                      label={t("form.fields.role")}
                      error={fieldErrors.role}
                      required
                    >
                      <SelectEl
                        id="role"
                        value={form.role}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                          pickRole(event.target.value as SupportRole)
                        }
                        {...inputStyles(Boolean(fieldErrors.role))}
                      >
                        <option value="client">{t("form.roles.client")}</option>
                        <option value="salon_owner">{t("form.roles.salon_owner")}</option>
                        <option value="team_member">{t("form.roles.team_member")}</option>
                        <option value="partner_other">{t("form.roles.partner_other")}</option>
                      </SelectEl>
                    </Field>
                    <Field
                      htmlFor="issueType"
                      label={t("form.fields.issueType")}
                      error={fieldErrors.issueType}
                      required
                    >
                      <SelectEl
                        id="issueType"
                        value={form.issueType}
                        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                          pickIssueType(event.target.value as SupportIssueType)
                        }
                        {...inputStyles(Boolean(fieldErrors.issueType))}
                      >
                        <option value="booking">{t("form.issueTypes.booking")}</option>
                        <option value="account">{t("form.issueTypes.account")}</option>
                        <option value="billing">{t("form.issueTypes.billing")}</option>
                        <option value="technical">{t("form.issueTypes.technical")}</option>
                        <option value="partnership">{t("form.issueTypes.partnership")}</option>
                        <option value="privacy">{t("form.issueTypes.privacy")}</option>
                      </SelectEl>
                    </Field>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field
                      htmlFor="fullName"
                      label={t("form.fields.fullName")}
                      error={fieldErrors.fullName}
                      required
                    >
                      <InputEl
                        id="fullName"
                        value={form.fullName}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateField("fullName", event.target.value)
                        }
                        placeholder={t("form.placeholders.fullName")}
                        {...inputStyles(Boolean(fieldErrors.fullName))}
                      />
                    </Field>
                    <Field
                      htmlFor="email"
                      label={t("form.fields.email")}
                      error={fieldErrors.email}
                      required
                    >
                      <InputEl
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateField("email", event.target.value)
                        }
                        placeholder={t("form.placeholders.email")}
                        {...inputStyles(Boolean(fieldErrors.email))}
                      />
                    </Field>
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    <Field htmlFor="phone" label={t("form.fields.phone")} hint={t("form.hints.phone")}>
                      <InputEl
                        id="phone"
                        value={form.phone}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateField("phone", event.target.value)
                        }
                        placeholder={t("form.placeholders.phone")}
                        {...inputStyles(false)}
                      />
                    </Field>
                    <Field
                      htmlFor="subject"
                      label={t("form.fields.subject")}
                      error={fieldErrors.subject}
                      required
                    >
                      <InputEl
                        id="subject"
                        value={form.subject}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateField("subject", event.target.value)
                        }
                        placeholder={t("form.placeholders.subject")}
                        {...inputStyles(Boolean(fieldErrors.subject))}
                      />
                    </Field>
                  </SimpleGrid>

                  {showBookingFields ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field
                        htmlFor="bookingSubType"
                        label={t("form.fields.bookingSubType")}
                        error={fieldErrors.bookingSubType}
                        required
                      >
                        <SelectEl
                          id="bookingSubType"
                          value={form.bookingSubType}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("bookingSubType", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.bookingSubType))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="confirmation">{t("form.bookingSubTypes.confirmation")}</option>
                          <option value="reschedule">{t("form.bookingSubTypes.reschedule")}</option>
                          <option value="cancellation">{t("form.bookingSubTypes.cancellation")}</option>
                          <option value="refund">{t("form.bookingSubTypes.refund")}</option>
                          <option value="other">{t("form.bookingSubTypes.other")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="salonName"
                        label={t("form.fields.salonName")}
                        error={fieldErrors.salonName}
                        required
                      >
                        <InputEl
                          id="salonName"
                          value={form.salonName}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("salonName", event.target.value)
                          }
                          placeholder={t("form.placeholders.salonName")}
                          {...inputStyles(Boolean(fieldErrors.salonName))}
                        />
                      </Field>
                      <Field
                        htmlFor="appointmentDate"
                        label={t("form.fields.appointmentDate")}
                        error={fieldErrors.appointmentDate}
                        required
                      >
                        <InputEl
                          id="appointmentDate"
                          type="date"
                          value={form.appointmentDate}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("appointmentDate", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.appointmentDate))}
                        />
                      </Field>
                      <Field
                        htmlFor="appointmentTime"
                        label={t("form.fields.appointmentTime")}
                        error={fieldErrors.appointmentTime}
                        required
                      >
                        <InputEl
                          id="appointmentTime"
                          type="time"
                          value={form.appointmentTime}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("appointmentTime", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.appointmentTime))}
                        />
                      </Field>
                      <Field
                        htmlFor="location"
                        label={t("form.fields.location")}
                        error={fieldErrors.location}
                        required
                      >
                        <InputEl
                          id="location"
                          value={form.location}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("location", event.target.value)
                          }
                          placeholder={t("form.placeholders.location")}
                          {...inputStyles(Boolean(fieldErrors.location))}
                        />
                      </Field>
                      <Field htmlFor="bookingReference" label={t("form.fields.bookingReference")}>
                        <InputEl
                          id="bookingReference"
                          value={form.bookingReference}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("bookingReference", event.target.value)
                          }
                          placeholder={t("form.placeholders.bookingReference")}
                          {...inputStyles(false)}
                        />
                      </Field>
                      <Field htmlFor="paymentAmount" label={t("form.fields.paymentAmount")}>
                        <InputEl
                          id="paymentAmount"
                          value={form.paymentAmount}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("paymentAmount", event.target.value)
                          }
                          placeholder={t("form.placeholders.paymentAmount")}
                          {...inputStyles(false)}
                        />
                      </Field>
                    </SimpleGrid>
                  ) : null}

                  {showAccountFields ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field
                        htmlFor="accountEmail"
                        label={t("form.fields.accountEmail")}
                        error={fieldErrors.accountEmail}
                        required
                      >
                        <InputEl
                          id="accountEmail"
                          type="email"
                          value={form.accountEmail}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("accountEmail", event.target.value)
                          }
                          placeholder={t("form.placeholders.accountEmail")}
                          {...inputStyles(Boolean(fieldErrors.accountEmail))}
                        />
                      </Field>
                      <Field
                        htmlFor="affectedRole"
                        label={t("form.fields.affectedRole")}
                        error={fieldErrors.affectedRole}
                        required
                      >
                        <SelectEl
                          id="affectedRole"
                          value={form.affectedRole}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("affectedRole", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.affectedRole))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="client">{t("form.roles.client")}</option>
                          <option value="salon">{t("form.accountRoles.salon")}</option>
                          <option value="staff">{t("form.accountRoles.staff")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="accountProblemType"
                        label={t("form.fields.accountProblemType")}
                        error={fieldErrors.accountProblemType}
                        required
                      >
                        <SelectEl
                          id="accountProblemType"
                          value={form.accountProblemType}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("accountProblemType", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.accountProblemType))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="login">{t("form.accountProblems.login")}</option>
                          <option value="verification">{t("form.accountProblems.verification")}</option>
                          <option value="wrong_email">{t("form.accountProblems.wrong_email")}</option>
                          <option value="phone_mismatch">{t("form.accountProblems.phone_mismatch")}</option>
                          <option value="account_blocked">{t("form.accountProblems.account_blocked")}</option>
                        </SelectEl>
                      </Field>
                    </SimpleGrid>
                  ) : null}

                  {showBillingFields ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field
                        htmlFor="billingSubType"
                        label={t("form.fields.billingSubType")}
                        error={fieldErrors.billingSubType}
                        required
                      >
                        <SelectEl
                          id="billingSubType"
                          value={form.billingSubType}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("billingSubType", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.billingSubType))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="failed_payment">{t("form.billingSubTypes.failed_payment")}</option>
                          <option value="duplicate_charge">{t("form.billingSubTypes.duplicate_charge")}</option>
                          <option value="cancel_subscription">{t("form.billingSubTypes.cancel_subscription")}</option>
                          <option value="invoice_copy">{t("form.billingSubTypes.invoice_copy")}</option>
                          <option value="refund">{t("form.billingSubTypes.refund")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="productOrPlan"
                        label={t("form.fields.productOrPlan")}
                        error={fieldErrors.productOrPlan}
                        required
                      >
                        <InputEl
                          id="productOrPlan"
                          value={form.productOrPlan}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("productOrPlan", event.target.value)
                          }
                          placeholder={t("form.placeholders.productOrPlan")}
                          {...inputStyles(Boolean(fieldErrors.productOrPlan))}
                        />
                      </Field>
                      <Field htmlFor="businessName" label={t("form.fields.businessName")}>
                        <InputEl
                          id="businessName"
                          value={form.businessName}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("businessName", event.target.value)
                          }
                          placeholder={t("form.placeholders.businessName")}
                          {...inputStyles(false)}
                        />
                      </Field>
                      <Field
                        htmlFor="chargeDate"
                        label={t("form.fields.chargeDate")}
                        error={fieldErrors.chargeDate}
                        required
                      >
                        <InputEl
                          id="chargeDate"
                          type="date"
                          value={form.chargeDate}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("chargeDate", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.chargeDate))}
                        />
                      </Field>
                      <Field htmlFor="chargeAmount" label={t("form.fields.chargeAmount")}>
                        <InputEl
                          id="chargeAmount"
                          value={form.chargeAmount}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("chargeAmount", event.target.value)
                          }
                          placeholder={t("form.placeholders.chargeAmount")}
                          {...inputStyles(false)}
                        />
                      </Field>
                    </SimpleGrid>
                  ) : null}

                  {showTechnicalFields ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field
                        htmlFor="platform"
                        label={t("form.fields.platform")}
                        error={fieldErrors.platform}
                        required
                      >
                        <SelectEl
                          id="platform"
                          value={form.platform}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("platform", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.platform))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="ios">{t("form.platforms.ios")}</option>
                          <option value="android">{t("form.platforms.android")}</option>
                          <option value="web">{t("form.platforms.web")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="severity"
                        label={t("form.fields.severity")}
                        error={fieldErrors.severity}
                        required
                      >
                        <SelectEl
                          id="severity"
                          value={form.severity}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("severity", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.severity))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="blocking">{t("form.severity.blocking")}</option>
                          <option value="degraded">{t("form.severity.degraded")}</option>
                          <option value="cosmetic">{t("form.severity.cosmetic")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="appVersion"
                        label={
                          form.platform === "web"
                            ? t("form.fields.browser")
                            : t("form.fields.appVersion")
                        }
                      >
                        <InputEl
                          id="appVersion"
                          value={form.platform === "web" ? form.browser : form.appVersion}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            if (form.platform === "web") {
                              updateField("browser", event.target.value);
                              return;
                            }
                            updateField("appVersion", event.target.value);
                          }}
                          placeholder={
                            form.platform === "web"
                              ? t("form.placeholders.browser")
                              : t("form.placeholders.appVersion")
                          }
                          {...inputStyles(false)}
                        />
                      </Field>
                      <Field
                        htmlFor="occurredAt"
                        label={t("form.fields.occurredAt")}
                        error={fieldErrors.occurredAt}
                        required
                      >
                        <InputEl
                          id="occurredAt"
                          type="datetime-local"
                          value={form.occurredAt}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("occurredAt", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.occurredAt))}
                        />
                      </Field>
                      <Box gridColumn={{ md: "1 / -1" }}>
                        <Field
                          htmlFor="reproductionSteps"
                          label={t("form.fields.reproductionSteps")}
                          error={fieldErrors.reproductionSteps}
                          required
                        >
                          <TextareaEl
                            id="reproductionSteps"
                            minH="120px"
                            resize="vertical"
                            value={form.reproductionSteps}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                              updateField("reproductionSteps", event.target.value)
                            }
                            placeholder={t("form.placeholders.reproductionSteps")}
                            {...inputStyles(Boolean(fieldErrors.reproductionSteps))}
                          />
                        </Field>
                      </Box>
                    </SimpleGrid>
                  ) : null}

                  {showPrivacyFields ? (
                    <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                      <Field
                        htmlFor="privacyRequestType"
                        label={t("form.fields.privacyRequestType")}
                        error={fieldErrors.privacyRequestType}
                        required
                      >
                        <SelectEl
                          id="privacyRequestType"
                          value={form.privacyRequestType}
                          onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                            updateField("privacyRequestType", event.target.value)
                          }
                          {...inputStyles(Boolean(fieldErrors.privacyRequestType))}
                        >
                          <option value="">{t("form.placeholders.select")}</option>
                          <option value="delete_account">{t("form.privacyTypes.delete_account")}</option>
                          <option value="export_data">{t("form.privacyTypes.export_data")}</option>
                          <option value="privacy_question">{t("form.privacyTypes.privacy_question")}</option>
                          <option value="legal_complaint">{t("form.privacyTypes.legal_complaint")}</option>
                        </SelectEl>
                      </Field>
                      <Field
                        htmlFor="privacyAccountEmail"
                        label={t("form.fields.accountEmail")}
                        error={fieldErrors.accountEmail}
                        required
                      >
                        <InputEl
                          id="privacyAccountEmail"
                          type="email"
                          value={form.accountEmail}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("accountEmail", event.target.value)
                          }
                          placeholder={t("form.placeholders.accountEmail")}
                          {...inputStyles(Boolean(fieldErrors.accountEmail))}
                        />
                      </Field>
                      <Field
                        htmlFor="region"
                        label={t("form.fields.region")}
                        error={fieldErrors.region}
                        required
                      >
                        <InputEl
                          id="region"
                          value={form.region}
                          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                            updateField("region", event.target.value)
                          }
                          placeholder={t("form.placeholders.region")}
                          {...inputStyles(Boolean(fieldErrors.region))}
                        />
                      </Field>
                      <Box gridColumn={{ md: "1 / -1" }}>
                        <Field htmlFor="privacyDetails" label={t("form.fields.privacyDetails")}>
                          <TextareaEl
                            id="privacyDetails"
                            minH="100px"
                            resize="vertical"
                            value={form.privacyDetails}
                            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                              updateField("privacyDetails", event.target.value)
                            }
                            placeholder={t("form.placeholders.privacyDetails")}
                            {...inputStyles(false)}
                          />
                        </Field>
                      </Box>
                    </SimpleGrid>
                  ) : null}

                  {showPartnershipFields ? (
                    <Box
                      rounded="xl"
                      borderWidth="1px"
                      borderColor="marketing.border"
                      bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.04)" }}
                      px={4}
                      py={4}
                    >
                      <Text fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                        {t("form.partnershipHint")}
                      </Text>
                    </Box>
                  ) : null}

                  <Field
                    htmlFor="description"
                    label={t("form.fields.description")}
                    error={fieldErrors.description}
                    required
                  >
                    <TextareaEl
                      id="description"
                      minH="150px"
                      resize="vertical"
                      value={form.description}
                      onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                        updateField("description", event.target.value)
                      }
                      placeholder={t("form.placeholders.description")}
                      {...inputStyles(Boolean(fieldErrors.description))}
                    />
                  </Field>

                  <Box
                    rounded="xl"
                    borderWidth="1px"
                    borderColor={fieldErrors.consent ? "#FC8181" : "marketing.border"}
                    bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.03)" }}
                    px={4}
                    py={4}
                  >
                    <Flex align="flex-start" gap={3}>
                      <InputEl
                        id="consent"
                        type="checkbox"
                        mt="3px"
                        checked={form.consent}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          updateField("consent", event.target.checked)
                        }
                      />
                      <Box>
                        <Label htmlFor="consent" fontSize="sm" lineHeight={1.7} color="marketing.fgMuted">
                          {t("form.fields.consent")}
                        </Label>
                        {fieldErrors.consent ? (
                          <Text mt={2} fontSize="xs" color="#C53030">
                            {fieldErrors.consent}
                          </Text>
                        ) : null}
                      </Box>
                    </Flex>
                  </Box>

                  <Flex gap={3} flexWrap="wrap" align="center">
                    <ButtonEl
                      type="submit"
                      disabled={isSubmitting}
                      rounded="full"
                      bg="marketing.accent"
                      px={6}
                      py={3}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="white"
                      opacity={isSubmitting ? 0.72 : 1}
                    >
                      {isSubmitting ? t("form.actions.submitting") : t("form.actions.submit")}
                    </ButtonEl>
                    <Link
                      href={supportMailHref}
                      onClick={() => handleDirectEmailClick("self_serve")}
                      fontSize="sm"
                      fontWeight="semibold"
                      color="marketing.fg"
                    >
                      {t("form.actions.directEmail")}
                    </Link>
                  </Flex>
                </VStack>
              </FormEl>
            </Box>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
