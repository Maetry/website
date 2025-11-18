import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

import AppointmentView from "./AppointmentView";

type PageParams = {
  locale: string;
  appointmentId: string;
};

type AppointmentPageProps = {
  params: Promise<PageParams>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: "booking",
  });

  return {
    title: t("successTitle"),
    description: t("successSubtitle"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const viewport: Viewport = {
  viewportFit: "cover",
};

const AppointmentPage = async ({ params }: AppointmentPageProps) => {
  const resolvedParams = await params;

  return (
    <AppointmentView
      appointmentId={resolvedParams.appointmentId}
      locale={resolvedParams.locale}
    />
  );
};

export default AppointmentPage;
