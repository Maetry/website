import { LinkHandler } from "@/components/link";

interface InvitePageProps {
  params: Promise<{
    locale: string;
    linkId: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const InvitePage = async ({ params }: InvitePageProps) => {
  const { linkId, locale } = await params;

  return <LinkHandler linkId={linkId} locale={locale} />;
};

export default InvitePage;
