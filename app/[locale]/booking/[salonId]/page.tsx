import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import BookingScreen from "./BookingScreen";

type PageParams = {
  locale: string;
  salonId: string;
};

type BookingPageProps = {
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
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

const BookingPage = async ({ params }: BookingPageProps) => {
  const resolvedParams = await params;

  return (
    <BookingScreen
      salonId={resolvedParams.salonId}
      locale={resolvedParams.locale}
    />
  );
};

export default BookingPage;

