import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";

import { generateExperienceMetadata } from "@/lib/home-experience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const host = (await headers()).get("host");
  return generateExperienceMetadata(locale, host);
}

export default function MarketplaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
