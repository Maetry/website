import { HomeExperience } from "@/features/home-experience";

export async function BusinessMarketingView({
  locale,
  host,
}: {
  locale: string;
  host: string | null;
}) {
  return (
    <HomeExperience
      locale={locale}
      experience="business"
      host={host}
      routeVariant="business-path"
    />
  );
}
