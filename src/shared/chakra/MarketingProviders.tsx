"use client";

import { ChakraProvider } from "@chakra-ui/react";

import { maetryMarketingSystem } from "./theme";

export function MarketingProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={maetryMarketingSystem}>{children}</ChakraProvider>
  );
}
