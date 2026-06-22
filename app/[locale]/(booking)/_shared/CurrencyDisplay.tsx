"use client";

import { Text, type TextProps } from "tamagui";

import {
  formatCurrency,
  type CurrencyValue,
} from "./formatting";

type CurrencyDisplayProps = {
  currency?: string | null;
  locale?: string;
  value?: CurrencyValue | null;
} & Omit<TextProps, "children">;

export function CurrencyDisplay({
  currency,
  locale,
  value,
  ...textProps
}: CurrencyDisplayProps) {
  const formattedValue = formatCurrency(
    value?.amount ?? null,
    value?.currency ?? currency ?? null,
    locale,
  );

  if (!formattedValue) {
    return null;
  }

  return <Text {...textProps}>{formattedValue}</Text>;
}
