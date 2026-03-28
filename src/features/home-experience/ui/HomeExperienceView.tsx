"use client";

import type { ReactNode } from "react";

import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Calendar, Link2, MapPin, Search, Star } from "lucide-react";

import {
  MarketingButtonLink,
  MarketingEyebrow,
} from "@/shared/chakra/marketing";

import {
  BUSINESS_CONSOLE_URL,
  SUPPORT_EMAIL_HREF,
  type LocaleContent,
} from "../model/content";

export type HomeExperienceViewProps = {
  content: LocaleContent;
  isBusiness: boolean;
  businessHref: string;
  appHref: string;
};

function stripStepNumberPrefix(title: string): string {
  return title.replace(/^\d+\.\s*/, "");
}

const highlightIcons = [Search, Star, Calendar] as const;
const howClientsIcons = [MapPin, Link2] as const;
const outcomeIcons = [Search, Star, Calendar] as const;

function BusinessSectionEyebrow({ children }: { children: ReactNode }) {
  return <MarketingEyebrow variant="section">{children}</MarketingEyebrow>;
}

export function HomeExperienceView({
  content,
  isBusiness,
  businessHref,
  appHref,
}: HomeExperienceViewProps) {
  const hero = isBusiness ? content.business.hero : content.consumer.hero;

  if (!isBusiness) {
    const c = content.consumer;
    return (
      <Box as="main">
        <Box as="section" pt={{ base: 10, lg: 14 }} pb={{ base: 12, lg: 16 }}>
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack gap={6} textAlign="center" maxW="4xl" mx="auto" align="center">
              <MarketingEyebrow variant="hero">{hero.eyebrow}</MarketingEyebrow>
              <Heading
                as="h1"
                fontSize={{ base: "4xl", sm: "5xl", lg: "4.25rem" }}
                fontWeight="semibold"
                lineHeight={1.05}
                letterSpacing="-0.04em"
                color="marketing.fg"
              >
                {hero.title}
              </Heading>
              <Text
                fontSize={{ base: "md", sm: "lg" }}
                lineHeight={1.75}
                color="marketing.fgMuted"
                maxW="3xl"
              >
                {hero.description}
              </Text>
              <MarketingButtonLink href={appHref} label={hero.primaryCta} />
              <Text
                fontSize="sm"
                lineHeight={1.6}
                color="marketing.fgSubtle"
                maxW="2xl"
              >
                {hero.note}
              </Text>
              <Flex gap={2} flexWrap="wrap" justify="center" pt={2}>
                {hero.badges.map((badge) => (
                  <Box
                    key={badge}
                    rounded="full"
                    bg={{
                      base: "marketing.sectionMuted",
                      _dark: "rgba(255,255,255,0.1)",
                    }}
                    px={4}
                    py={2}
                    fontSize="sm"
                    color="marketing.fgMuted"
                  >
                    {badge}
                  </Box>
                ))}
              </Flex>
            </VStack>
          </Container>
        </Box>

        <Box
          as="section"
          id="discover"
          py={{ base: 12, lg: 16 }}
          bg={{ base: "white", _dark: "#0b0d12" }}
        >
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={5} alignItems="stretch">
              {c.highlights.map((item, index) => {
                const Icon = highlightIcons[index] ?? Search;
                return (
                  <Box
                    key={item.title}
                    as="article"
                    rounded="2xl"
                    bg="marketing.cardDark"
                    color="white"
                    p={{ base: 6, lg: 8 }}
                  >
                    <Flex
                      align="center"
                      justify="center"
                      h={11}
                      w={11}
                      rounded="lg"
                      borderWidth="2px"
                      borderColor="marketing.accent"
                      color="marketing.accent"
                      mb={5}
                    >
                      <Icon size={22} strokeWidth={1.75} aria-hidden />
                    </Flex>
                    <Heading as="h2" fontSize="xl" fontWeight="semibold" lineHeight="snug">
                      {item.title}
                    </Heading>
                    <Text
                      mt={4}
                      fontSize="sm"
                      lineHeight={1.65}
                      color="rgba(255,255,255,0.68)"
                    >
                      {item.description}
                    </Text>
                  </Box>
                );
              })}
            </SimpleGrid>
          </Container>
        </Box>

        <Box
          as="section"
          id="coverage"
          py={{ base: 12, lg: 16 }}
          bg="marketing.sectionMuted"
        >
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <Grid
              templateColumns={{ base: "1fr", lg: "1fr 1fr" }}
              gap={{ base: 10, lg: 12 }}
              alignItems="start"
            >
              <Box>
                <MarketingEyebrow variant="section">{c.coverageEyebrow}</MarketingEyebrow>
                <Heading
                  as="h2"
                  mt={4}
                  fontSize={{ base: "3xl", sm: "4xl" }}
                  fontWeight="semibold"
                  letterSpacing="-0.04em"
                >
                  {c.coverageTitle}
                </Heading>
                <Text
                  mt={4}
                  fontSize="base"
                  lineHeight={1.75}
                  color="marketing.fgMuted"
                  maxW="lg"
                >
                  {c.coverageDescription}
                </Text>
              </Box>
              <VStack gap={4} align="stretch">
                {c.coveragePoints.map((point, index) => (
                  <Box
                    key={point.label}
                    rounded="2xl"
                    bg="marketing.cardDark"
                    color="white"
                    p={6}
                  >
                    <Flex align="flex-start" gap={4}>
                      <Flex
                        flexShrink={0}
                        h={10}
                        w={10}
                        align="center"
                        justify="center"
                        rounded="full"
                        bg="marketing.accent"
                        color="white"
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {index + 1}
                      </Flex>
                      <Box>
                        <Text fontWeight="semibold" fontSize="md">
                          {point.label}
                        </Text>
                        <Text
                          fontSize="sm"
                          lineHeight={1.6}
                          color="rgba(255,255,255,0.68)"
                        >
                          {point.description}
                        </Text>
                      </Box>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </Grid>
          </Container>
        </Box>

        <Box
          as="section"
          py={{ base: 12, lg: 16 }}
          bg={{ base: "white", _dark: "#0b0d12" }}
        >
          <Container maxW="3xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack gap={6} textAlign="center" align="center">
              <MarketingEyebrow variant="section">{c.coveragePanelLabel}</MarketingEyebrow>
              <Heading
                as="h2"
                fontSize={{ base: "2xl", sm: "3xl" }}
                fontWeight="semibold"
                letterSpacing="-0.03em"
                lineHeight="snug"
              >
                {c.coveragePanelText}
              </Heading>
              <VStack gap={4} align="stretch" w="full" pt={4}>
                {c.coveragePanelBullets.map((bullet, index) => {
                  const Icon = howClientsIcons[index] ?? MapPin;
                  return (
                    <Flex
                      key={bullet}
                      gap={4}
                      align="flex-start"
                      textAlign="left"
                    >
                      <Flex
                        flexShrink={0}
                        mt={0.5}
                        color={{ base: "gray.500", _dark: "rgba(255,255,255,0.5)" }}
                      >
                        <Icon size={20} strokeWidth={2} aria-hidden />
                      </Flex>
                      <Text fontSize="md" lineHeight={1.65} color="marketing.fgMuted">
                        {bullet}
                      </Text>
                    </Flex>
                  );
                })}
              </VStack>
            </VStack>
          </Container>
        </Box>

        <Box
          as="section"
          id="booking"
          py={{ base: 12, lg: 16 }}
          bg="marketing.sectionMuted"
        >
          <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack gap={4} textAlign="center" maxW="3xl" mx="auto" mb={10}>
              <MarketingEyebrow variant="section">{c.bookingEyebrow}</MarketingEyebrow>
              <Heading
                as="h2"
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
              >
                {c.bookingTitle}
              </Heading>
              <Text fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
                {c.bookingDescription}
              </Text>
            </VStack>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
              {c.bookingSteps.map((step, index) => (
                <Box
                  key={step.title}
                  as="article"
                  rounded="2xl"
                  borderWidth="1px"
                  borderColor="marketing.border"
                  bg={{ base: "white", _dark: "rgba(255,255,255,0.06)" }}
                  p={6}
                >
                  <Flex
                    h={10}
                    w={10}
                    align="center"
                    justify="center"
                    rounded="full"
                    bg="marketing.accent"
                    color="white"
                    fontSize="sm"
                    fontWeight="bold"
                    mb={5}
                  >
                    {index + 1}
                  </Flex>
                  <Heading
                    as="h3"
                    fontSize="lg"
                    fontWeight="semibold"
                    letterSpacing="-0.02em"
                  >
                    {stripStepNumberPrefix(step.title)}
                  </Heading>
                  <Text
                    mt={3}
                    fontSize="sm"
                    lineHeight={1.6}
                    color={{
                      base: "rgba(19,19,26,0.66)",
                      _dark: "rgba(255,255,255,0.66)",
                    }}
                  >
                    {step.description}
                  </Text>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>

        <Box
          as="section"
          id="download"
          py={{ base: 12, lg: 16 }}
          bg={{ base: "white", _dark: "#0b0d12" }}
        >
          <Container maxW="3xl" px={{ base: 4, sm: 6, lg: 8 }}>
            <VStack gap={6} textAlign="center" align="center">
              <MarketingEyebrow variant="section">
                {c.businessBridgeEyebrow}
              </MarketingEyebrow>
              <Heading
                as="h2"
                fontSize={{ base: "3xl", sm: "4xl" }}
                fontWeight="semibold"
                letterSpacing="-0.04em"
              >
                {c.businessBridgeTitle}
              </Heading>
              <Text
                fontSize="base"
                lineHeight={1.75}
                color="marketing.fgMuted"
                maxW="2xl"
              >
                {c.businessBridgeDescription}
              </Text>
              <VStack as="ul" gap={2} align="stretch" w="full" maxW="xl" pt={2} pl={0}>
                {c.businessBridgePoints.map((point) => (
                  <Text
                    key={point}
                    as="li"
                    fontSize="sm"
                    lineHeight={1.6}
                    color="marketing.fgSubtle"
                    textAlign="left"
                    listStyleType="none"
                  >
                    {point}
                  </Text>
                ))}
              </VStack>
              <Flex gap={3} flexWrap="wrap" justify="center" pt={4}>
                <MarketingButtonLink
                  href={BUSINESS_CONSOLE_URL}
                  label={content.common.openConsoleLabel}
                />
                <MarketingButtonLink
                  href={businessHref}
                  label={content.common.businessLabel}
                  variant="secondary"
                />
              </Flex>
            </VStack>
          </Container>
        </Box>
      </Box>
    );
  }

  const b = content.business;
  return (
    <Box as="main">
      <Box as="section" pt={{ base: 10, lg: 14 }} pb={{ base: 12, lg: 16 }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack gap={6} textAlign="center" maxW="4xl" mx="auto" align="center">
            <MarketingEyebrow variant="hero">{hero.eyebrow}</MarketingEyebrow>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", sm: "5xl", lg: "4.25rem" }}
              fontWeight="semibold"
              lineHeight={1.05}
              letterSpacing="-0.04em"
              color="marketing.fg"
            >
              {hero.title}
            </Heading>
            <Text
              fontSize={{ base: "md", sm: "lg" }}
              lineHeight={1.75}
              color="marketing.fgMuted"
              maxW="3xl"
            >
              {hero.description}
            </Text>
            <Flex gap={3} flexWrap="wrap" justify="center">
              <MarketingButtonLink
                href={BUSINESS_CONSOLE_URL}
                label={hero.primaryCta}
              />
              <MarketingButtonLink
                href={SUPPORT_EMAIL_HREF}
                label={hero.secondaryCta}
                variant="secondary"
              />
            </Flex>
            <Text
              fontSize="sm"
              lineHeight={1.6}
              color="marketing.fgSubtle"
              maxW="2xl"
            >
              {hero.note}
            </Text>
            <Flex gap={2} flexWrap="wrap" justify="center" pt={2}>
              {hero.badges.map((badge) => (
                <Box
                  key={badge}
                  rounded="full"
                  bg={{
                    base: "marketing.sectionMuted",
                    _dark: "rgba(255,255,255,0.1)",
                  }}
                  px={4}
                  py={2}
                  fontSize="sm"
                  color="marketing.fgMuted"
                >
                  {badge}
                </Box>
              ))}
            </Flex>
          </VStack>
        </Container>
      </Box>

      <Box
        as="section"
        py={{ base: 12, lg: 16 }}
        bg={{ base: "marketing.sectionMuted", _dark: "#14161d" }}
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {b.outcomes.map((item, index) => {
              const Icon = outcomeIcons[index] ?? Search;
              return (
                <Box
                  key={item.title}
                  as="article"
                  rounded="2xl"
                  bg="marketing.cardDark"
                  color="white"
                  p={{ base: 6, lg: 8 }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    h={11}
                    w={11}
                    rounded="lg"
                    borderWidth="2px"
                    borderColor="marketing.accent"
                    color="marketing.accent"
                    mb={5}
                  >
                    <Icon size={22} strokeWidth={1.75} aria-hidden />
                  </Flex>
                  <Heading as="h2" fontSize="xl" fontWeight="semibold" lineHeight="snug">
                    {item.title}
                  </Heading>
                  <Text
                    mt={4}
                    fontSize="sm"
                    lineHeight={1.65}
                    color="rgba(255,255,255,0.68)"
                  >
                    {item.description}
                  </Text>
                </Box>
              );
            })}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" id="platform" py={{ base: 12, lg: 16 }} bg={{ base: "white", _dark: "#0b0d12" }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Box mb={8} maxW="3xl">
            <BusinessSectionEyebrow>{b.platformEyebrow}</BusinessSectionEyebrow>
            <Heading
              as="h2"
              mt={4}
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
            >
              {b.platformTitle}
            </Heading>
            <Text mt={4} fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
              {b.platformDescription}
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} gap={5}>
            {b.platformModules.map((module) => (
              <Box
                key={module.title}
                as="article"
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.surface"
                p={6}
              >
                <Heading
                  as="h3"
                  fontSize="xl"
                  fontWeight="semibold"
                  letterSpacing="-0.03em"
                >
                  {module.title}
                </Heading>
                <Text
                  mt={4}
                  fontSize="sm"
                  lineHeight={1.6}
                  color={{
                    base: "rgba(19,19,26,0.66)",
                    _dark: "rgba(255,255,255,0.66)",
                  }}
                >
                  {module.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box
        as="section"
        id="journey"
        py={{ base: 12, lg: 16 }}
        bg="marketing.sectionMuted"
      >
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <VStack gap={4} textAlign="center" maxW="3xl" mx="auto" mb={10}>
            <BusinessSectionEyebrow>{b.journeyEyebrow}</BusinessSectionEyebrow>
            <Heading
              as="h2"
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
            >
              {b.journeyTitle}
            </Heading>
            <Text fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
              {b.journeyDescription}
            </Text>
          </VStack>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {b.journeySteps.map((step, index) => (
              <Box
                key={step.title}
                as="article"
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg={{ base: "white", _dark: "rgba(255,255,255,0.06)" }}
                p={6}
              >
                <Flex
                  h={10}
                  w={10}
                  align="center"
                  justify="center"
                  rounded="full"
                  bg="marketing.accent"
                  color="white"
                  fontSize="sm"
                  fontWeight="bold"
                  mb={5}
                >
                  {index + 1}
                </Flex>
                <Heading
                  as="h3"
                  fontSize="lg"
                  fontWeight="semibold"
                  letterSpacing="-0.02em"
                >
                  {stripStepNumberPrefix(step.title)}
                </Heading>
                <Text
                  mt={3}
                  fontSize="sm"
                  lineHeight={1.6}
                  color={{
                    base: "rgba(19,19,26,0.66)",
                    _dark: "rgba(255,255,255,0.66)",
                  }}
                >
                  {step.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" id="pricing" py={{ base: 12, lg: 16 }} bg={{ base: "white", _dark: "#0b0d12" }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Box mb={8} maxW="3xl">
            <BusinessSectionEyebrow>{b.pricingEyebrow}</BusinessSectionEyebrow>
            <Heading
              as="h2"
              mt={4}
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
            >
              {b.pricingTitle}
            </Heading>
            <Text mt={4} fontSize="base" lineHeight={1.75} color="marketing.fgMuted">
              {b.pricingDescription}
            </Text>
          </Box>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={5}>
            {b.pricingPlans.map((plan) => (
              <Box
                key={plan.name}
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
                  {plan.name}
                </Text>
                <Heading
                  as="h3"
                  mt={4}
                  fontSize="3xl"
                  fontWeight="semibold"
                  letterSpacing="-0.04em"
                >
                  {plan.price}
                </Heading>
                <Text
                  mt={4}
                  fontSize="sm"
                  lineHeight={1.6}
                  color={{
                    base: "rgba(19,19,26,0.66)",
                    _dark: "rgba(255,255,255,0.66)",
                  }}
                >
                  {plan.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" py={{ base: 12, lg: 16 }} bg="marketing.sectionMuted">
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={5}>
            {b.quotes.map((quote) => (
              <Box
                key={quote.author}
                as="blockquote"
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.cardDark"
                p={8}
                color="white"
              >
                <Text
                  fontSize="2xl"
                  fontWeight="semibold"
                  lineHeight={1.35}
                  letterSpacing="-0.03em"
                >
                  “{quote.quote}”
                </Text>
                <Box as="footer" mt={6} fontSize="sm" color="rgba(255,255,255,0.7)">
                  {quote.author} · {quote.role}
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" id="faq" py={{ base: 12, lg: 16 }} bg={{ base: "white", _dark: "#0b0d12" }}>
        <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
          <Box mb={8} maxW="3xl">
            <BusinessSectionEyebrow>{b.faqEyebrow}</BusinessSectionEyebrow>
            <Heading
              as="h2"
              mt={4}
              fontSize={{ base: "3xl", sm: "4xl" }}
              fontWeight="semibold"
              letterSpacing="-0.04em"
            >
              {b.faqTitle}
            </Heading>
          </Box>
          <SimpleGrid gap={4}>
            {b.faqs.map((faq) => (
              <Box
                key={faq.question}
                as="article"
                rounded="2xl"
                borderWidth="1px"
                borderColor="marketing.border"
                bg="marketing.surface"
                p={6}
              >
                <Heading
                  as="h3"
                  fontSize="lg"
                  fontWeight="semibold"
                  letterSpacing="-0.02em"
                >
                  {faq.question}
                </Heading>
                <Text
                  mt={3}
                  fontSize="sm"
                  lineHeight={1.6}
                  color={{
                    base: "rgba(19,19,26,0.66)",
                    _dark: "rgba(255,255,255,0.66)",
                  }}
                >
                  {faq.answer}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>
    </Box>
  );
}
