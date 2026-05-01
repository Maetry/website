import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import StaffInvitePage from "@/app/[locale]/(invite)/staff/invite/StaffInvitePage";

type SalonInvitePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: SalonInvitePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "inviteMeta" });

  return {
    title: t("employeeTitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

const SalonInviteLinkPage = () => {
  return <StaffInvitePage />;
};

export default SalonInviteLinkPage;
