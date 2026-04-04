import { buildExperienceSchemas } from "@/lib/home-experience";

export default async function BusinessHead({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const schemas = buildExperienceSchemas(locale, "business");

  return (
    <script
      id="maetry-business-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  );
}
