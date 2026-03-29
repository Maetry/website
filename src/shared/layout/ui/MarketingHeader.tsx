"use client";

import NextImage from "next/image";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Box, Flex, Link, Menu, Portal } from "@chakra-ui/react";
import { Menu as HamburgerIcon } from "lucide-react";

import logo from "@/public/images/logo.svg";
import { MarketingButtonLink } from "@/shared/chakra/marketing";
import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher";
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher";

import type { HeaderAction, HeaderLink } from "./types";

/** Горизонтальные отступы полосы хедера и выпадающего меню (одна сетка с логотипом). */
const MARKETING_HEADER_GUTTER_X = { base: 4, sm: 6, lg: 8 } as const;

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

function navigateToHref(href: string) {
  if (href.startsWith("http")) {
    window.open(href, "_blank", "noopener,noreferrer");
    return;
  }
  if (href.startsWith("mailto:")) {
    window.location.href = href;
    return;
  }
  window.location.assign(href);
}

/** Якоря и полные URL с hash — надёжнее через assign, чем router.push */
function followInPageOrPush(href: string, router: ReturnType<typeof useRouter>) {
  if (href.startsWith("http") || href.startsWith("mailto:")) {
    navigateToHref(href);
    return;
  }
  if (href.startsWith("#")) {
    window.location.assign(`${window.location.pathname}${window.location.search}${href}`);
    return;
  }
  if (href.includes("#")) {
    window.location.assign(href);
    return;
  }
  router.push(href);
}

function DesktopNavLink({
  href,
  label,
  plain,
}: HeaderLink & { plain?: boolean }) {
  const styles = plain
    ? {
        display: "inline-flex" as const,
        alignItems: "center",
        rounded: "md",
        px: "3",
        py: "2",
        fontSize: "sm",
        fontWeight: "medium",
        color: "marketing.fgMuted",
        transition: "colors 0.2s",
        _hover: {
          bg: { base: "rgba(19,19,26,0.06)", _dark: "rgba(255,255,255,0.08)" },
          color: "marketing.fg",
        },
      }
    : {
        display: "inline-flex" as const,
        alignItems: "center",
        rounded: "full",
        px: "4",
        py: "2",
        fontSize: "sm",
        fontWeight: "medium",
        color: "marketing.fgMuted",
        transition: "colors 0.2s",
        _hover: {
          bg: { base: "rgba(255,255,255,0.85)", _dark: "rgba(255,255,255,0.08)" },
          color: "marketing.fg",
        },
      };

  if (isExternalHref(href)) {
    return (
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        {...styles}
      >
        {label}
      </Link>
    );
  }

  return (
    <NextLink href={href} style={{ textDecoration: "none" }}>
      <Box as="span" cursor="pointer" {...styles}>
        {label}
      </Box>
    </NextLink>
  );
}

export type MarketingHeaderProps = {
  nav: HeaderLink[];
  primaryAction?: HeaderAction;
  secondaryAction?: HeaderAction;
  logoHref: string;
  showThemeSwitcher?: boolean;
  showLocaleSwitcher?: boolean;
  navStyle?: "pill" | "inline";
};

export function MarketingHeader({
  nav,
  primaryAction,
  secondaryAction,
  logoHref,
  showThemeSwitcher = true,
  showLocaleSwitcher = true,
  navStyle = "pill",
}: MarketingHeaderProps) {
  const showPrefs = showThemeSwitcher || showLocaleSwitcher;
  const pathname = usePathname();
  const router = useRouter();

  const blurStrip = {
    w: "100%",
    borderBottomWidth: "1px",
    borderColor: "marketing.border",
    backdropFilter: "blur(18px) saturate(1.25)",
    WebkitBackdropFilter: "blur(18px) saturate(1.25)",
    bg: "rgba(255, 255, 255, 0.82)",
    _dark: {
      bg: "rgba(15, 17, 24, 0.78)",
    },
  };

  const menuItemStyles = {
    py: 3,
    rounded: "md",
    cursor: "pointer",
    color: "marketing.fgMuted",
    _highlighted: {
      bg: { base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.08)" },
      color: "marketing.fg",
    },
  };

  return (
    <Box position="sticky" top={0} zIndex={2500} w="100%">
      <Box {...blurStrip}>
        <Flex
          maxW="7xl"
          mx="auto"
          align="center"
          justify="space-between"
          gap={4}
          px={MARKETING_HEADER_GUTTER_X}
          py={3}
          minH="64px"
        >
          <NextLink href={logoHref} style={{ display: "flex", flexShrink: 0 }}>
            <NextImage
              src={logo}
              alt="Maetry"
              width={112}
              height={22}
              className="h-auto w-[112px] dark:invert"
              priority
            />
          </NextLink>

          <Flex
            display={{ base: "none", md: "flex" }}
            align="center"
            justify="flex-end"
            flex={1}
            gap={3}
            minW={0}
          >
            <Flex
              as="nav"
              align="center"
              justify="flex-end"
              flexWrap="wrap"
              gap={navStyle === "inline" ? 1 : 1}
              rounded={navStyle === "pill" ? "full" : undefined}
              borderWidth={navStyle === "pill" ? "1px" : undefined}
              borderColor={navStyle === "pill" ? "marketing.border" : undefined}
              bg={
                navStyle === "pill"
                  ? {
                      base: "rgba(249,249,249,0.9)",
                      _dark: "rgba(255,255,255,0.06)",
                    }
                  : undefined
              }
              p={navStyle === "pill" ? 1 : undefined}
            >
              {nav.map((item) => (
                <DesktopNavLink
                  key={`${item.href}-${item.label}`}
                  {...item}
                  plain={navStyle === "inline"}
                />
              ))}
              {secondaryAction?.linkVariant === "secondaryGhost" ? (
                <DesktopNavLink
                  href={secondaryAction.href}
                  label={secondaryAction.label}
                  plain={navStyle === "inline"}
                />
              ) : null}
            </Flex>
            {showPrefs ? (
              <Flex
                align="center"
                gap={2}
                rounded="full"
                borderWidth="1px"
                borderColor="marketing.border"
                bg={{
                  base: "rgba(249,249,249,0.9)",
                  _dark: "rgba(255,255,255,0.06)",
                }}
                px={2}
                py={1.5}
                flexShrink={0}
              >
                {showThemeSwitcher ? <ThemeSwitcher /> : null}
                {showLocaleSwitcher ? <LanguageSwitcher /> : null}
              </Flex>
            ) : null}
            {secondaryAction && secondaryAction.linkVariant !== "secondaryGhost" ? (
              <MarketingButtonLink
                href={secondaryAction.href}
                label={secondaryAction.label}
                variant="secondary"
              />
            ) : null}
            {primaryAction ? (
              <MarketingButtonLink
                href={primaryAction.href}
                label={primaryAction.label}
                variant="primary"
              />
            ) : null}
          </Flex>

          <Flex
            display={{ base: "flex", md: "none" }}
            align="center"
            flexShrink={0}
            ms="auto"
          >
            <Menu.Root
              key={pathname}
              closeOnSelect
              lazyMount={false}
              unmountOnExit={false}
              positioning={{
                placement: "bottom",
                strategy: "fixed",
                gutter: 0,
                flip: false,
              }}
            >
              <Menu.Trigger
                aria-label="Open navigation menu"
                display="inline-flex"
                alignItems="center"
                justifyContent="center"
                boxSize="40px"
                flexShrink={0}
                rounded="md"
                borderWidth={0}
                cursor="pointer"
                bg="transparent"
                color="marketing.fg"
                p={0}
                outline="none"
                _hover={{
                  bg: {
                    base: "rgba(19,19,26,0.06)",
                    _dark: "rgba(255,255,255,0.08)",
                  },
                }}
                _focusVisible={{
                  outline: "2px solid",
                  outlineColor: "marketing.accent",
                  outlineOffset: "2px",
                }}
              >
                <HamburgerIcon size={22} strokeWidth={2} aria-hidden />
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner zIndex={2800} w="100vw" maxW="100vw" left="0">
                  <Menu.Content
                    w="100vw"
                    maxW="100vw"
                    maxH="min(70dvh, 28rem)"
                    overflowY="auto"
                    py={2}
                    px={MARKETING_HEADER_GUTTER_X}
                    borderTopWidth="1px"
                    borderBottomWidth="0"
                    borderX={0}
                    borderColor="marketing.border"
                    borderRadius="0"
                    shadow="none"
                    bg="rgba(255, 255, 255, 0.82)"
                    backdropFilter="blur(18px) saturate(1.25)"
                    _dark={{
                      bg: "rgba(15, 17, 24, 0.78)",
                    }}
                  >
                    {nav.map((item) => (
                      <Menu.Item
                        key={`${item.href}-${item.label}`}
                        value={item.href}
                        {...menuItemStyles}
                        onSelect={() => {
                          followInPageOrPush(item.href, router);
                        }}
                      >
                        <Menu.ItemText fontSize="md" fontWeight="medium">
                          {item.label}
                        </Menu.ItemText>
                      </Menu.Item>
                    ))}

                    {secondaryAction ? (
                      secondaryAction.linkVariant === "secondaryGhost" ? (
                        <Menu.Item
                          value={`secondary-${secondaryAction.href}`}
                          {...menuItemStyles}
                          onSelect={() => {
                            followInPageOrPush(secondaryAction.href, router);
                          }}
                        >
                          <Menu.ItemText fontSize="md" fontWeight="medium">
                            {secondaryAction.label}
                          </Menu.ItemText>
                        </Menu.Item>
                      ) : (
                        <>
                          <Menu.Separator my={2} borderColor="marketing.border" />
                          <Menu.Item
                            value={`secondary-${secondaryAction.href}`}
                            {...menuItemStyles}
                            py={2}
                            fontSize="sm"
                            color="marketing.fgSubtle"
                            onSelect={() => {
                              followInPageOrPush(secondaryAction.href, router);
                            }}
                          >
                            <Menu.ItemText fontWeight="medium">
                              {secondaryAction.label}
                            </Menu.ItemText>
                          </Menu.Item>
                        </>
                      )
                    ) : null}

                    {primaryAction ? (
                      <Box pt={4} pb={1}>
                        <MarketingButtonLink
                          href={primaryAction.href}
                          label={primaryAction.label}
                          variant="primary"
                          fullWidth
                          showTrailingArrow={false}
                        />
                      </Box>
                    ) : null}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
