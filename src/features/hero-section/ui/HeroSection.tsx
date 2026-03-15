import { getTranslations } from "next-intl/server";

import { BgImage, ImageTextFabric, TextVariant } from "@/shared/ui";

const HeroSection = async () => {
  const t = await getTranslations("hero");

  return (
    <section className="w-full h-[75vh] lg:h-[90vh] items-center justify-center flex px-[3.5%] pb-[5vh]">
      <div className="w-full moving-background relative h-full rounded-[21px] shadow-lg">
        <BgImage></BgImage>
      </div>
      <div className="flex flex-col absolute items-center xl:scale-105 2xl:scale-120">
        <div className="mb-[2%]">
          <TextVariant variant="eyebrow" text={t("subtitle")} />
        </div>

        <ImageTextFabric id={1}></ImageTextFabric>

        <div className="mt-[5%] w-[80%] text-center">
          <TextVariant variant="body" text={t("description")} />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
