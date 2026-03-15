import { headers } from "next/headers";
import Script from "next/script";

import { HomeExperience } from "@/features/home-experience";
import {
  buildExperienceSchemas,
  generateExperienceMetadata,
} from "@/lib/home-experience";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  return generateExperienceMetadata(locale, host, "business");
}

export default async function BusinessLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  const schemas = buildExperienceSchemas(locale, "business");

  return (
    <>
      <Script
        id="maetry-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemas),
        }}
      />

      <HomeExperience
        locale={locale}
        experience="business"
        host={host}
        routeVariant="business-path"
      />
    </>
  );
}
