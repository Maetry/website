"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useTranslations } from "next-intl";

import { BentoGrid } from "@/features/ambassador-section";
import {
  SUPPORT_EMAIL,
  SUPPORT_EMAIL_HREF,
} from "@/features/home-experience/model/content";
import {
  MarketingButtonLink,
  MarketingEyebrow,
} from "@/shared/chakra/marketing";

export function AffiliateMarketingView({
  mailtoHref,
}: {
  mailtoHref: string;
}) {
  const t = useTranslations("ambassador");

  const statCards = [
    { label: t("offerLabel"), value: t("offerValue"), large: true },
    { label: t("benefit1Label"), value: t("benefit1Value") },
    { label: t("benefit2Label"), value: t("benefit2Value") },
  ];

  return (
    <Box as="main" w="full">
      <Box
        as="section"
        id="offer"
        pt={{ base: 10, lg: 14 }}
        pb={{ base: 12, lg: 16 }}
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack gap={6} textAlign="center" maxW="4xl" mx="auto" align="center">
            <MarketingEyebrow variant="hero">{t("eyebrow")}</MarketingEyebrow>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", sm: "5xl", lg: "4.25rem" }}
              fontWeight="semibold"
              lineHeight={1.05}
              letterSpacing="-0.04em"
              color="marketing.fg"
            >
              {t("title")}
            </Heading>
            <Text
              fontSize={{ base: "md", sm: "lg" }}
              lineHeight={1.75}
              color="marketing.fgMuted"
              maxW="3xl"
            >
              {t("subtitle")}
            </Text>
            <Flex gap={3} flexWrap="wrap" justify="center">
              <MarketingButtonLink href={mailtoHref} label={t("becomePartner")} />
              <MarketingButtonLink
                href="#partner-proof"
                label={t("gridHint")}
                variant="secondary"
              />
            </Flex>
            <Text
              fontSize="sm"
              lineHeight={1.6}
              color="marketing.fgSubtle"
              maxW="2xl"
            >
              {t("ctaNote")}
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} mt={{ base: 10, lg: 12 }}>
            {statCards.map((item, i) => (
              <Box
                key={i}
                as="article"
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.surface"
                p={6}
              >
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  textTransform="uppercase"
                  letterSpacing="0.2em"
                  color="marketing.accent"
                >
                  {item.label}
                </Text>
                <Text
                  mt={3}
                  fontSize={item.large ? "xl" : "base"}
                  fontWeight={item.large ? "semibold" : "normal"}
                  lineHeight={1.75}
                  letterSpacing={item.large ? "-0.02em" : undefined}
                  color={item.large ? "marketing.fg" : "marketing.fgMuted"}
                >
                  {item.value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box
        as="section"
        py={{ base: 12, lg: 16 }}
        bg={{ base: "marketing.sectionMuted", _dark: "#14161d" }}
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
            <Box
              as="article"
              rounded="2xl"
              bg="marketing.cardDark"
              color="white"
              p={{ base: 6, lg: 8 }}
            >
              <MarketingEyebrow variant="section" color="rgba(255,255,255,0.55)">
                {t("aboutTitle")}
              </MarketingEyebrow>
              <Heading
                as="h2"
                mt={4}
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
              >
                {t("readyToPartner")}
              </Heading>
              <Text
                mt={4}
                maxW="2xl"
                fontSize="base"
                lineHeight={1.75}
                color="rgba(255,255,255,0.68)"
              >
                {t("aboutDescription")}
              </Text>
              <VStack as="ul" gap={2} align="stretch" mt={6} pl={0} listStyleType="none">
                {[t("benefit1Value"), t("benefit2Value"), t("partnerDescription")].map(
                  (line) => (
                    <Text
                      key={line}
                      as="li"
                      rounded="xl"
                      borderWidth="1px"
                      borderColor="rgba(255,255,255,0.12)"
                      bg="rgba(255,255,255,0.06)"
                      px={4}
                      py={3}
                      fontSize="sm"
                      lineHeight={1.6}
                      color="rgba(255,255,255,0.72)"
                    >
                      {line}
                    </Text>
                  ),
                )}
              </VStack>
            </Box>

            <Box
              as="article"
              rounded="2xl"
              borderWidth="1px"
              borderColor="marketing.border"
              bg="marketing.surface"
              p={{ base: 6, lg: 8 }}
            >
              <MarketingEyebrow variant="section">{t("gridTitle")}</MarketingEyebrow>
              <Heading
                as="h2"
                mt={4}
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
              >
                Maetry
              </Heading>
              <Text mt={4} fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
                {t("gridDescription")}
              </Text>
              <SimpleGrid mt={8} columns={{ base: 1, md: 3 }} gap={4}>
                {[t("offerValue"), t("gridHint"), t("ctaNote")].map((text, idx) => (
                  <Box
                    key={idx}
                    rounded="2xl"
                    borderWidth="1px"
                    borderColor="marketing.border"
                    bg={{ base: "white", _dark: "rgba(255,255,255,0.04)" }}
                    px={5}
                    py={5}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="marketing.accent"
                      letterSpacing="0.12em"
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </Text>
                    <Text mt={3} fontSize="sm" lineHeight={1.6} color="marketing.fgMuted">
                      {text}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      <BentoGrid />

      <Box
        as="section"
        id="apply"
        py={{ base: 12, lg: 16 }}
        bg={{ base: "white", _dark: "#0b0d12" }}
      >
        <Container maxW="3xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack
            gap={6}
            rounded="2xl"
            bg="marketing.cardDark"
            color="white"
            px={{ base: 6, lg: 10 }}
            py={{ base: 10, lg: 12 }}
            textAlign="center"
            align="center"
          >
            <MarketingEyebrow variant="section" color="rgba(255,255,255,0.55)">
              {t("startEarning")}
            </MarketingEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
            >
              {t("readyToPartner")}
            </Heading>
            <Text
              maxW="2xl"
              fontSize="base"
              lineHeight={1.75}
              color="rgba(255,255,255,0.68)"
            >
              {t("partnerDescription")}
            </Text>
            <Flex gap={3} justify="center" flexWrap="wrap" pt={2}>
              <MarketingButtonLink href={mailtoHref} label={t("startEarning")} />
              <Link
                href={SUPPORT_EMAIL_HREF}
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                rounded="full"
                borderWidth="1px"
                borderColor="rgba(255,255,255,0.22)"
                bg="rgba(255,255,255,0.06)"
                px={6}
                py={3}
                fontSize="sm"
                fontWeight="semibold"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.12)" }}
              >
                {SUPPORT_EMAIL}
              </Link>
            </Flex>
            <Text fontSize="sm" lineHeight={1.6} color="rgba(255,255,255,0.5)">
              {t("ctaNote")}
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
