import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import ClientInvitePage from "./ClientInvitePage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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

const ClientInvite = () => {
  return <ClientInvitePage />;
};

export default ClientInvite;
