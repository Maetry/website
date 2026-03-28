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

export type MarketingFooterLandingProps = {
  mode: "landing";
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
  languageLabel: string;
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
  /** Подпись ссылки на лендинг для бизнеса */
  businessSiteLabel: string;
};

export type MarketingFooterSiteProps = {
  mode: "site";
  locale: string;
  productTitle: string;
  companyTitle: string;
  legalTitle: string;
  connectTitle: string;
  productLinks: FooterLink[];
  companyLinks: FooterLink[];
  legalLinks: FooterLink[];
  connectLinks: FooterLink[];
  allRightsReserved: string;
};

export type MarketingFooterProps =
  | MarketingFooterLandingProps
  | MarketingFooterSiteProps;

function isExternal(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function FooterNavLink({ href, label, newTab }: FooterLink) {
  const linkProps = {
    fontSize: "sm",
    color: "marketing.fgMuted",
    _hover: { color: "marketing.fg" },
  };

  if (isExternal(href) || newTab) {
    return (
      <ChakraLink
        href={href}
        target={newTab || isExternal(href) ? "_blank" : undefined}
        rel={newTab || isExternal(href) ? "noopener noreferrer" : undefined}
        {...linkProps}
      >
        {label}
      </ChakraLink>
    );
  }

  return (
    <NextLink href={href} style={{ textDecoration: "none" }}>
      <Box as="span" cursor="pointer" {...linkProps}>
        {label}
      </Box>
    </NextLink>
  );
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

function LandingFooter(p: MarketingFooterLandingProps) {
  const columnTitle = {
    fontSize: "sm",
    fontWeight: "semibold",
    color: "white",
    mb: 3,
  };

  return (
    <Box as="footer" bg="marketing.cardDark" color="white">
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
              <LandingFooterNavLink href={p.businessHref} label={p.businessSiteLabel} />
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
            {p.languageLabel}
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

function SiteFooter(p: MarketingFooterSiteProps) {
  return (
    <Box
      as="footer"
      w="full"
      borderTopWidth="1px"
      borderColor="marketing.border"
      bg={{ base: "white", _dark: "#13131A" }}
    >
      <Box maxW="7xl" mx="auto" px={6} py={16}>
        <Grid
          templateColumns={{ base: "repeat(2,1fr)", md: "repeat(4,1fr)" }}
          gap={8}
          mb={12}
        >
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="marketing.fg" mb={4}>
              {p.productTitle}
            </Text>
            <VStack gap={3} align="stretch">
              {p.productLinks.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </VStack>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="marketing.fg" mb={4}>
              {p.companyTitle}
            </Text>
            <VStack gap={3} align="stretch">
              {p.companyLinks.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </VStack>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="marketing.fg" mb={4}>
              {p.legalTitle}
            </Text>
            <VStack gap={3} align="stretch">
              {p.legalLinks.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </VStack>
          </Box>
          <Box>
            <Text fontSize="sm" fontWeight="bold" color="marketing.fg" mb={4}>
              {p.connectTitle}
            </Text>
            <VStack gap={3} align="stretch">
              {p.connectLinks.map((item) => (
                <FooterNavLink key={item.href} {...item} />
              ))}
            </VStack>
          </Box>
        </Grid>

        <Flex
          pt={8}
          borderTopWidth="1px"
          borderColor="marketing.border"
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          gap={4}
        >
          <Text fontSize="sm" color="marketing.fgMuted" whiteSpace="nowrap">
            {p.allRightsReserved}
          </Text>
          <HStack gap={4}>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
}

export function MarketingFooter(props: MarketingFooterProps) {
  if (props.mode === "landing") {
    return <LandingFooter {...props} />;
  }
  return <SiteFooter {...props} />;
}
