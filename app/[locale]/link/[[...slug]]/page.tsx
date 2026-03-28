import { notFound } from "next/navigation";

import { LinkHandler } from "@/components/link";

interface LinkPageProps {
  params: Promise<{
    locale: string;
    slug?: string[];
  }>;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Короткие ссылки:
 * - `/{locale}/link/{nanoId}` — легаси / маркетинг
 * - `/{locale}/link/b/{nanoId}` — booking (link.maetry.com/b/…)
 * - `/{locale}/link/ci/{nanoId}` — client invite
 * - `/{locale}/link/si/{nanoId}` — staff invite (Universal Link → Console)
 */
const LinkPage = async ({ params }: LinkPageProps) => {
  const { slug, locale } = await params;

  if (!slug?.length) {
    notFound();
  }

  const linkPath = slug.join("/");

  return <LinkHandler linkPath={linkPath} locale={locale} />;
};

export default LinkPage;
