import React from "react";

import { headers } from "next/headers";
import Script from 'next/script';

import { HomeExperience } from "@/features/home-experience";
import {
  buildExperienceSchemas,
  generateExperienceMetadata,
  getExperienceFromHost,
} from "@/lib/home-experience";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  return generateExperienceMetadata(locale, host);
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  const experience = getExperienceFromHost(host);
  const schemas = buildExperienceSchemas(locale, experience);

  return (
    <>
      <Script
        id="maetry-site-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <HomeExperience
        locale={locale}
        experience={experience}
        host={host}
        routeVariant={experience === "business" ? "business-host" : "home"}
      />
    </>
  )
}
