import { notFound } from "next/navigation";

import { LinkHandler } from "@/components/link";

interface LinkPageProps {
  params: Promise<{
    nanoId: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const LinkPage = async ({ params }: LinkPageProps) => {
  const { nanoId } = await params;

  if (!nanoId?.trim()) {
    notFound();
  }

  return <LinkHandler nanoId={nanoId} />;
};

export default LinkPage;
