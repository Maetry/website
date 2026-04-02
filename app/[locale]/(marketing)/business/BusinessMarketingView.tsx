import { HomeExperience } from "@/features/home-experience";
import { buildExperienceSchemas } from "@/lib/home-experience";

export async function BusinessMarketingView({
  locale,
  host,
}: {
  locale: string;
  host: string | null;
}) {
  const schemas = buildExperienceSchemas(locale, "business");

  return (
    <>
      <script
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
