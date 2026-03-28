"use client";

import { Box, type BoxProps } from "@chakra-ui/react";

/** Единый фон и типографика маркетинговых страниц */
export function MarketingPageShell({
  children,
  ...rest
}: BoxProps & { children: React.ReactNode }) {
  return (
    <Box
      minH="100vh"
      color="marketing.fg"
      bg={{ base: "white", _dark: "#0b0d12" }}
      {...rest}
    >
      {children}
    </Box>
  );
}
