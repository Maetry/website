import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import { GlobalMarketingFooter } from "@/shared/chakra/marketing/GlobalMarketingFooter";
import { AppThemeProvider } from "@/shared/ui/theme-switcher";

import { VisitViewIsland } from "./VisitViewIsland";

type PageParams = {
  locale: string;
  visitId: string;
};

type VisitPageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "booking",
  });

  return {
    title: t("successTitle"),
    description: t("successSubtitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
};

const VisitPage = async ({ params }: VisitPageProps) => {
  const resolvedParams = await params;

  return (
    <>
      <VisitViewIsland
        visitId={resolvedParams.visitId}
        locale={resolvedParams.locale}
      />
      <AppThemeProvider>
        <GlobalMarketingFooter locale={resolvedParams.locale} />
      </AppThemeProvider>
    </>
  );
};

export default VisitPage;
