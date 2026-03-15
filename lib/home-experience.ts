import type { Metadata } from "next";

import {
  APP_STORE_URL,
  BUSINESS_CONSOLE_URL,
  INSTAGRAM_URL,
  SUPPORT_EMAIL,
  TELEGRAM_URL,
  getMarketingContent,
  normalizeMarketingLocale,
  resolveSiteExperience,
  type SiteExperience,
} from "@/features/home-experience/model/content";

export function getExperienceFromHost(host: string | null): SiteExperience {
  return resolveSiteExperience(host);
}

export function generateExperienceMetadata(
  locale: string,
  host: string | null,
  forcedExperience?: SiteExperience,
): Metadata {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const experience = forcedExperience ?? getExperienceFromHost(host);
  const content = getMarketingContent(normalizedLocale);
  const meta =
    experience === "business" ? content.business : content.consumer;
  const canonicalBase =
    experience === "business"
      ? "https://business.maetry.com"
      : "https://maetry.com";
  const canonical = `${canonicalBase}/${normalizedLocale}`;
  const ogType = experience === "business" ? "website" : "website";

  return {
    title: meta.metaTitle,
    description: meta.metaDescription,
    keywords:
      experience === "business"
        ? "maetry, salon software, salon management, booking system, staff schedule, salon crm"
        : "maetry, salon marketplace, beauty booking, salon discovery, online booking",
    alternates: {
      canonical,
      languages: {
        en: `${canonicalBase}/en`,
        ru: `${canonicalBase}/ru`,
        es: `${canonicalBase}/es`,
      },
    },
    openGraph: {
      title: meta.metaTitle,
      description: meta.metaDescription,
      url: canonical,
      siteName: "Maetry",
      locale:
        normalizedLocale === "ru"
          ? "ru_RU"
          : normalizedLocale === "es"
            ? "es_ES"
            : "en_US",
      type: ogType,
      images: [
        {
          url: "https://maetry.com/logo.png",
          alt: "Maetry",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.metaTitle,
      description: meta.metaDescription,
      images: ["https://maetry.com/logo.png"],
    },
  };
}

export function buildExperienceSchemas(
  locale: string,
  experience: SiteExperience,
) {
  const normalizedLocale = normalizeMarketingLocale(locale);
  const content = getMarketingContent(normalizedLocale);
  const meta =
    experience === "business" ? content.business : content.consumer;
  const canonicalBase =
    experience === "business"
      ? "https://business.maetry.com"
      : "https://maetry.com";
  const url = `${canonicalBase}/${normalizedLocale}`;

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Maetry",
    url: "https://maetry.com",
    logo: "https://maetry.com/logo.png",
    sameAs: [INSTAGRAM_URL, TELEGRAM_URL],
    contactPoint: {
      "@type": "ContactPoint",
      email: SUPPORT_EMAIL,
      contactType: "customer support",
      areaServed: "US",
    },
  };

  if (experience === "business") {
    return [
      organization,
      {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Maetry for salons",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS",
        offers: [
          {
            "@type": "Offer",
            price: "29",
            priceCurrency: "USD",
          },
        ],
        url,
        description: meta.metaDescription,
        provider: {
          "@type": "Organization",
          name: "Maetry",
        },
        featureList: [
          "Online booking",
          "Staff schedules",
          "Client reminders",
          "Salon operations management",
        ],
        softwareHelp: SUPPORT_EMAIL,
        downloadUrl: BUSINESS_CONSOLE_URL,
      },
    ];
  }

  return [
    organization,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Maetry",
      url,
      description: meta.metaDescription,
      potentialAction: {
        "@type": "ViewAction",
        target: url,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "MobileApplication",
      name: "Maetry",
      operatingSystem: "iOS",
      applicationCategory: "LifestyleApplication",
      downloadUrl: APP_STORE_URL,
      url,
      description: meta.metaDescription,
    },
  ];
}
