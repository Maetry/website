import { getTranslations } from "next-intl/server";

import { Feature } from "@/features/feature-card";
import { TextVariant } from "@/shared/ui";

const FeaturesSection = async () => {
  const t = await getTranslations("features");

  return (
    <section
      id={"features"}
      className="w-[93%] px-[3.5%] flex justify-center flex flex-col gap-y-[5vh] xl:gap-y-[8vh] scroll-mt-[100px]"
    >
      <div className="flex flex-col w-full">
        <TextVariant variant="eyebrow" text={t("subtitle")} />
        <TextVariant variant="display" text={t("title")} />
      </div>

      <div className="flex xl:flex-row flex-col gap-10 xl:gap-5 w-full">
        <Feature
          variant="management"
          title={t("management.title")}
          description={t("management.description")}
        />
        <Feature
          variant="notifications"
          title={t("notifications.title")}
          description={t("notifications.description")}
        />
        <Feature
          variant="onlineBooking"
          title={t("onlineBooking.title")}
          description={t("onlineBooking.description")}
        />
      </div>
    </section>
  );
};

export default FeaturesSection;
