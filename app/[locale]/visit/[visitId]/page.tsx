export {
  generateMetadata,
  viewport,
} from "@/app/[locale]/(booking)/visits/[visitId]/page";

import { VisitViewIsland } from "@/app/[locale]/(booking)/visits/[visitId]/VisitViewIsland";

type VisitPageProps = {
  params: Promise<{
    locale: string;
    visitId: string;
  }>;
};

const VisitAliasPage = async ({ params }: VisitPageProps) => {
  const resolvedParams = await params;

  return (
    <VisitViewIsland
      locale={resolvedParams.locale}
      visitId={resolvedParams.visitId}
    />
  );
};

export default VisitAliasPage;
