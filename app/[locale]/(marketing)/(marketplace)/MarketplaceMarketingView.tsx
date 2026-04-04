import { HomeExperience } from "@/features/home-experience";
import { getExperienceFromHost } from "@/lib/home-experience";

export async function MarketplaceMarketingView({
  locale,
  host,
}: {
  locale: string;
  host: string | null;
}) {
  const experience = getExperienceFromHost(host);

  return (
    <HomeExperience
      locale={locale}
      experience={experience}
      host={host}
      routeVariant={experience === "business" ? "business-host" : "home"}
    />
  );
}
