import type { Metadata } from "next";

// Константы метаданных
export const SITE_URL = "https://maetry.com";
const LOGO_URL = "https://maetry.com/_next/static/media/logo.30e07f0a.svg";
export const LOGO_PNG_URL = `${SITE_URL}/logo.png`;
const KEYWORDS = "maetry,beauty salon,booking,management,appointment,crm,automation,salon,service,nails,lashes,barber";

type Locale = "ru" | "en" | "es";

interface MetadataConfig {
  title: string;
  description: string;
}

const metadataConfig: Record<Locale, MetadataConfig> = {
  ru: {
    title: "Maetry - Info Page",
    description: "Автоматизируйте бизнес-процессы",
  },
  en: {
    title: "Maetry - Info Page",
    description: "Automate your business processes",
  },
  es: {
    title: "Maetry - Info Page",
    description: "Automatiza tus procesos de negocio",
  },
};

export function generateLandingMetadata(locale: string): Metadata {
  const config = metadataConfig[locale as Locale] || metadataConfig.en;
  const localeCode = locale === "ru" ? "ru_RU" : locale === "es" ? "es_ES" : "en_US";

  return {
    title: config.title,
    description: config.description,
    keywords: KEYWORDS,
    openGraph: {
      title: "Maetry",
      description: config.description,
      url: SITE_URL,
      siteName: "Maetry",
      images: [{ url: LOGO_URL }],
      locale: localeCode,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Maetry",
      description: config.description,
      images: [LOGO_URL],
    },
  };
}
