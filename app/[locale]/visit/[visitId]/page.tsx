export {
  generateMetadata,
  viewport,
} from "@/app/[locale]/(booking)/visits/[visitId]/page";

import { VisitViewIsland } from "@/app/[locale]/(booking)/visits/[visitId]/VisitViewIsland";
import { GlobalMarketingFooter } from "@/shared/chakra/marketing/GlobalMarketingFooter";
import { AppThemeProvider } from "@/shared/ui/theme-switcher";
import { ClientAppUiProvider } from "@/src/shared/tamagui/ClientAppUiProvider";

type VisitPageProps = {
  params: Promise<{
    locale: string;
    visitId: string;
  }>;
};

const VisitAliasPage = async ({ params }: VisitPageProps) => {
  const resolvedParams = await params;

  return (
    <>
      <ClientAppUiProvider>
        <VisitViewIsland
          locale={resolvedParams.locale}
          visitId={resolvedParams.visitId}
        />
      </ClientAppUiProvider>
      <AppThemeProvider>
        <GlobalMarketingFooter locale={resolvedParams.locale} />
      </AppThemeProvider>
    </>
  );
};

export default VisitAliasPage;
