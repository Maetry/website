import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { InviteScreen } from "@/components/invite";
import { fetchDirectLink, NotFoundError } from "@/lib/api/shortLink";

interface InvitePageProps {
  params: {
    linkId: string;
  };
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
  try {
    const data = await fetchDirectLink(params.linkId);
    const title = data.title ?? data.salon?.name ?? "Maetry";
    const description = data.description ?? data.salon?.description ?? "Maetry приглашает вас присоединиться.";

    return {
      title: `Maetry — ${title}`,
      description,
      openGraph: {
        title: `Maetry — ${title}`,
        description,
        url: `https://link.maetry.com/${params.linkId}`,
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
  const userAgent = headers().get("user-agent") ?? "";
  const data = await getLinkData(params.linkId, userAgent);

  return <InviteScreen data={data} />;
};

export default InvitePage;

