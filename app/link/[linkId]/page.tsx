import { LinkHandler } from "@/components/link";

interface InvitePageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const InvitePage = async ({ params }: InvitePageProps) => {
  const { linkId } = await params;

  return <LinkHandler nanoId={linkId} />;
};

export default InvitePage;

