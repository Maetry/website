"use client";

import NextImage from "next/image";
import NextLink from "next/link";

import {
  Box,
  Flex,
  Grid,
  HStack,
  Link as ChakraLink,
  Text,
  VStack,
} from "@chakra-ui/react";

import type { MarketingLocale } from "@/features/home-experience/model/content";
import logo from "@/public/images/logo.svg";
import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher";
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher";

type FooterLink = { href: string; label: string; newTab?: boolean };

export type MarketingFooterProps = {
  tagline: string;
  businessHref: string;
  appHref: string;
  consumerLabel: string;
  businessSectionTitle: string;
  appStoreLabel: string;
  contactLabel: string;
  partnershipLabel: string;
  privacyLabel: string;
  termsLabel: string;
  appearanceLabel: string;
  legalSectionLabel: string;
  footerRights: string;
  telegramLabel: string;
  instagramLabel: string;
  telegramHref: string;
  instagramHref: string;
  supportMailHref: string;
  activeLocale: MarketingLocale;
  /** Якорь на секцию Discover на клиентской главной */
  discoverHref: string;
  discoverLabel: string;
};

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

const landingDarkLink = {
  fontSize: "sm",
  color: "rgba(255,255,255,0.62)",
  _hover: { color: "white" },
};

function LandingFooterNavLink({ href, label, newTab }: FooterLink) {
  if (isExternal(href) || newTab) {
    return (
      <ChakraLink
        href={href}
        target={newTab || isExternal(href) ? "_blank" : undefined}
        rel={newTab || isExternal(href) ? "noopener noreferrer" : undefined}
        {...landingDarkLink}
      >
        {label}
      </ChakraLink>
    );
  }

  return (
    <NextLink href={href} style={{ textDecoration: "none" }}>
      <Box as="span" cursor="pointer" {...landingDarkLink}>
        {label}
      </Box>
    </NextLink>
  );
}

export function MarketingFooter(p: MarketingFooterProps) {
  const columnTitle = {
    fontSize: "sm",
    fontWeight: "semibold",
    color: "white",
    mb: 3,
  };

  return (
    <Box
      as="footer"
      bg="marketing.cardDark"
      color="white"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <Box maxW="7xl" mx="auto" px={{ base: 4, sm: 6, lg: 8 }} py={{ base: 10, lg: 14 }}>
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "minmax(0, 1.15fr) repeat(4, minmax(0, 1fr))",
          }}
          gap={{ base: 10, lg: 8, xl: 10 }}
        >
          <Box>
            <NextImage
              src={logo}
              alt="Maetry"
              width={112}
              height={22}
              className="h-auto w-[112px] invert"
              priority
            />
            <Text
              mt={4}
              maxW="md"
              fontSize="sm"
              lineHeight={1.7}
              color="rgba(255,255,255,0.62)"
            >
              {p.tagline}
            </Text>
          </Box>

          <Box>
            <Text {...columnTitle}>{p.consumerLabel}</Text>
            <VStack gap={2.5} align="stretch">
              <LandingFooterNavLink href={p.appHref} label={p.appStoreLabel} />
              <LandingFooterNavLink href={p.discoverHref} label={p.discoverLabel} />
            </VStack>
          </Box>

          <Box>
            <Text {...columnTitle}>{p.businessSectionTitle}</Text>
            <VStack gap={2.5} align="stretch">
              <LandingFooterNavLink href={p.businessHref} label={p.discoverLabel} />
              <LandingFooterNavLink
                href={`/${p.activeLocale}/affiliate`}
                label={p.partnershipLabel}
              />
            </VStack>
          </Box>

          <Box>
            <Text {...columnTitle}>{p.contactLabel}</Text>
            <VStack gap={2.5} align="stretch">
              <LandingFooterNavLink
                href={p.supportMailHref}
                label={p.supportMailHref.replace(/^mailto:/i, "")}
              />
              <ChakraLink
                href={p.telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                {...landingDarkLink}
              >
                {p.telegramLabel}
              </ChakraLink>
              <ChakraLink
                href={p.instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                {...landingDarkLink}
              >
                {p.instagramLabel}
              </ChakraLink>
            </VStack>
          </Box>

          <Box>
            <Text {...columnTitle}>{p.legalSectionLabel}</Text>
            <VStack gap={2.5} align="stretch">
              <LandingFooterNavLink href="/privacy.html" label={p.privacyLabel} newTab />
              <LandingFooterNavLink href="/terms.html" label={p.termsLabel} newTab />
            </VStack>
          </Box>
        </Grid>

        <Flex
          mt={{ base: 10, lg: 12 }}
          pt={8}
          borderTopWidth="1px"
          borderColor="rgba(255,255,255,0.12)"
          direction={{ base: "column", sm: "row" }}
          align={{ base: "stretch", sm: "center" }}
          justify="space-between"
          gap={4}
          flexWrap="wrap"
        >
          <Text fontSize="sm" fontWeight="medium" color="rgba(255,255,255,0.85)">
            {p.appearanceLabel}
          </Text>
          <HStack gap={2} align="center" flexWrap="wrap">
            <LanguageSwitcher variant="onDark" />
            <ThemeSwitcher variant="onDark" />
          </HStack>
        </Flex>
      </Box>
      <Box
        borderTopWidth="1px"
        borderColor="rgba(255,255,255,0.12)"
        px={{ base: 4, sm: 6, lg: 8 }}
        py={5}
      >
        <Flex
          maxW="7xl"
          mx="auto"
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={4}
        >
          <Text fontSize="sm" color="rgba(255,255,255,0.5)">
            {p.footerRights}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
