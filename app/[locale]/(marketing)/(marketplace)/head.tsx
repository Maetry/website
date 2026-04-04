import { headers } from "next/headers";

import {
  buildExperienceSchemas,
  getExperienceFromHost,
} from "@/lib/home-experience";

export default async function MarketplaceHead({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const host = (await headers()).get("host");
  const experience = getExperienceFromHost(host);
  const schemas = buildExperienceSchemas(locale, experience);

  return (
    <script
      id="maetry-site-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}
