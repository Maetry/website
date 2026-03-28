"use client";

import { Box, type BoxProps } from "@chakra-ui/react";

/** Карточка на светлой поверхности (светлая / тёмная тема) */
export function MarketingSurfaceCard({
  children,
  elevated = true,
  ...rest
}: BoxProps & { children: React.ReactNode; elevated?: boolean }) {
  return (
    <Box
      rounded="marketing"
      borderWidth="1px"
      borderColor="marketing.border"
      bg="marketing.surface"
      px={{ base: 6, lg: 8 }}
      py={{ base: 6, lg: 8 }}
      shadow={
        elevated
          ? {
              base: "0 24px 70px rgba(19,19,26,0.06)",
              _dark: "0 24px 70px rgba(0,0,0,0.18)",
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </Box>
  );
}
