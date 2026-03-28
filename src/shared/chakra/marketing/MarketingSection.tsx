"use client";

import { Box, Container, type BoxProps } from "@chakra-ui/react";

export function MarketingSection({
  children,
  id,
  py = { base: 12, lg: 12 },
  ...rest
}: BoxProps & {
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <Box as="section" id={id} py={py} {...rest}>
      <Container maxW="7xl" px={{ base: 4, sm: 6, lg: 8 }}>
        {children}
      </Container>
    </Box>
  );
}
