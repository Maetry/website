import Script from "next/script";

import { HomeExperience } from "@/features/home-experience";
import {
  buildExperienceSchemas,
  getExperienceFromHost,
} from "@/lib/home-experience";

export async function MarketplaceMarketingView({
  locale,
  host,
}: {
  locale: string;
  host: string | null;
}) {
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
  );
}
