import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { generateAlternateLinks } from "@/lib/metadata/alternate-links";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta.support" });
  const alternates = generateAlternateLinks("/support");

  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates,
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: alternates.canonical,
      type: "website",
      siteName: "Maetry",
      images: [{ url: "https://maetry.com/logo.png", alt: "Maetry" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["https://maetry.com/logo.png"],
    },
  };
}

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
