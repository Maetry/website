import React from "react";

import Script from 'next/script';

import { generateLandingMetadata } from "@/lib/metadata";

import { LandingLayout } from "@/features/landing-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateLandingMetadata(locale);
}

export default async function LandingPage() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Maetry",
            url: "https://maetry.com",
            logo: "https://maetry.com/images/tild3031-3665-4331-b066-353633643661__photo.svg",
            sameAs: [
              "https://www.instagram.com/maetry.co",
              "https://t.me/maetry_app",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+1-818-877-8913",
              contactType: "Customer Service",
              areaServed: "US",
            },
          }),
        }}
      />
      

      <LandingLayout />
    </>
  )
}
