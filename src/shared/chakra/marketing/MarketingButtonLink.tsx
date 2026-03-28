"use client";

import NextLink from "next/link";

import { Flex, Link } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";

function isExternalHref(href: string) {
  return href.startsWith("http") || href.startsWith("mailto:");
}

type MarketingButtonLinkProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "secondaryGhost";
  /** Стрелка справа (как на макете главной), только для primary */
  showTrailingArrow?: boolean;
  /** На всю ширину контейнера (например мобильное меню) */
  fullWidth?: boolean;
};

export function MarketingButtonLink({
  href,
  label,
  variant = "primary",
  showTrailingArrow = variant === "primary",
  fullWidth = false,
}: MarketingButtonLinkProps) {
  const base = {
    display: fullWidth ? ("flex" as const) : ("inline-flex" as const),
    alignItems: "center",
    justifyContent: "center",
    gap: "2",
    ...(fullWidth ? { w: "100%" } : {}),
    rounded: "full",
    px: "5",
    py: "3",
    fontSize: "sm",
    fontWeight: "semibold",
    transitionProperty: "opacity, background-color, border-color",
    transitionDuration: "200ms",
    _hover: { opacity: 0.92 },
  };

  const primary = {
    ...base,
    bg: { base: "maetry.ink", _dark: "white" },
    color: { base: "white", _dark: "maetry.ink" },
  };

  const secondary = {
    ...base,
    borderWidth: "1px",
    borderColor: { base: "gray.200", _dark: "rgba(255,255,255,0.2)" },
    bg: { base: "white", _dark: "rgba(255,255,255,0.06)" },
    color: "marketing.fg",
    _hover: {
      opacity: 1,
      bg: { base: "gray.50", _dark: "rgba(255,255,255,0.1)" },
    },
  };

  const secondaryGhost = {
    ...base,
    rounded: "md",
    borderWidth: 0,
    bg: "transparent",
    color: "marketing.fg",
    _hover: {
      opacity: 1,
      bg: { base: "rgba(19,19,26,0.06)", _dark: "rgba(255,255,255,0.08)" },
    },
  };

  const sx =
    variant === "primary"
      ? primary
      : variant === "secondaryGhost"
        ? secondaryGhost
        : secondary;

  const trailing =
    variant === "primary" && showTrailingArrow ? (
      <ArrowRight size={16} strokeWidth={2.25} aria-hidden />
    ) : null;

  if (isExternalHref(href)) {
    return (
      <Link
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
        {...sx}
      >
        {label}
        {trailing}
      </Link>
    );
  }

  return (
    <NextLink
      href={href}
      style={{
        textDecoration: "none",
        ...(fullWidth ? { display: "block", width: "100%" } : {}),
      }}
    >
      <Flex as="span" cursor="pointer" {...sx}>
        {label}
        {trailing}
      </Flex>
    </NextLink>
  );
}
