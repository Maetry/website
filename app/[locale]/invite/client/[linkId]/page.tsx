import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ClientInvitePage from "@/app/[locale]/(invite)/client/invite/ClientInvitePage";

type ClientInviteLinkPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: ClientInviteLinkPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "inviteMeta" });

  return {
    title: t("clientTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

const ClientInviteLinkPage = () => {
  return <ClientInvitePage />;
};

export default ClientInviteLinkPage;
