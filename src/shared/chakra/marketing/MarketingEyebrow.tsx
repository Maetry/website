"use client";

import { Text, type TextProps } from "@chakra-ui/react";

export type MarketingEyebrowProps = TextProps & {
  /** hero — pill как на герое; section — синий uppercase лейбл секции */
  variant?: "hero" | "section";
};

export function MarketingEyebrow({
  children,
  variant = "hero",
  ...rest
}: MarketingEyebrowProps) {
  if (variant === "section") {
    return (
      <Text
        fontSize="sm"
        fontWeight="semibold"
        textTransform="uppercase"
        letterSpacing="0.2em"
        color="marketing.accent"
        {...rest}
      >
        {children}
      </Text>
    );
  }

  return (
    <Text
      display="inline-flex"
      w="fit"
      alignItems="center"
      rounded="full"
      bg={{ base: "marketing.sectionMuted", _dark: "rgba(255,255,255,0.1)" }}
      px="4"
      py="2"
      fontSize="sm"
      fontWeight="medium"
      color="marketing.fgMuted"
      {...rest}
    >
      {children}
    </Text>
  );
}
