import Image from "next/image";

import { getTranslations } from "next-intl/server";

import { AboutSection } from "@/features/about-section";
import { FAQSection } from "@/features/faq-section";
import { FeaturesSection } from "@/features/features-section";
import { Footer } from "@/features/footer";
import { Header } from "@/features/header";
import { HeroSection } from "@/features/hero-section";
import { PricingSection } from "@/features/pricing-section";
import { ReviewsSection } from "@/features/reviews-section";
import prefooter from "@/public/images/prefooterImage.svg";
import {
  AppleButton,
  BgImage,
  ImageTextFabric,
  TextVariant,
} from "@/shared/ui";

const LandingLayout = async () => {
  const t = await getTranslations("prefooter");

  return (
    <>
      <Header />
      <main className="w-full pt-4 flex flex-col items-center bg-white dark:bg-dark-bg gap-y-[9vh] xl:gap-y-[15vh]">
        <HeroSection />

        <AboutSection />

        <ReviewsSection />

        <section
          id={"4thBlock"}
          className="w-full px-[3.5%] h-[40vh] md:h-[55vh] xl:h-[70vh] flex justify-center "
        >
          <div className="flex items-center justify-center w-full h-full relative rounded-[20px] shadow-lg">
            <div className="absolute w-full h-full">
              <BgImage></BgImage>
            </div>

            <ImageTextFabric id={2}></ImageTextFabric>
          </div>
        </section>

        <FeaturesSection />

        <PricingSection />

        <FAQSection />

        <section id={"prefooter"} className="w-full px-[3.5%] h-[70vh] ">
          <div className="w-full h-full bg-dark-bg dark:bg-white rounded-[21px] flex items-center justify-center shadow-xl relative">
            <div className="z-[1000] flex text-invert items-center text-center flex-col w-[80%] xl:w-[40%] gap-y-3 xl:gap-y-0 dark:text-black text-[#fdfdfd]">
              <TextVariant variant="eyebrowInverse" text={t("title")} />
              <div className="mt-[1%]">
                <TextVariant variant="display" text={t("subtitle")} />
              </div>
              <div className="mt-[5%] mb-[5%]">
                <TextVariant variant="body" text={t("description")} />
              </div>
              <AppleButton></AppleButton>
            </div>

            <Image
              src={prefooter}
              alt={""}
              fill
              sizes="100vw"
              style={{ objectFit: "cover" }}
              className="rounded-[20px] dark:hidden"
            ></Image>
          </div>
        </section>
      </main>
      <Footer></Footer>
    </>
  );
};

export default LandingLayout;
