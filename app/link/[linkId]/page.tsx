import { headers } from "next/headers";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { InviteScreen } from "@/components/invite";
import { fetchDirectLink, NotFoundError } from "@/lib/api/shortLink";

interface InvitePageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const getLinkData = async (linkId: string, userAgent?: string) => {
  try {
    return await fetchDirectLink(linkId, userAgent);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }

    throw error;
  }
};

export async function generateMetadata({ params }: InvitePageProps): Promise<Metadata> {
  const { linkId } = await params;

  try {
    const data = await fetchDirectLink(linkId);
    const title = data.title ?? data.salon?.name ?? "Maetry";
    const description = data.description ?? data.salon?.description ?? "Maetry приглашает вас присоединиться.";

    return {
      title: `Maetry — ${title}`,
      description,
      openGraph: {
        title: `Maetry — ${title}`,
        description,
        url: `https://link.maetry.com/${linkId}`,
        siteName: "Maetry",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: `Maetry — ${title}`,
        description,
      },
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    if (error instanceof NotFoundError) {
      return {
        title: "Maetry — Ссылка не найдена",
        description: "Похоже, приглашение больше недоступно.",
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    throw error;
  }
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { linkId } = await params;
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") ?? "";
  const data = await getLinkData(linkId, userAgent);

  return <InviteScreen data={data} />;
};

export default InvitePage;

