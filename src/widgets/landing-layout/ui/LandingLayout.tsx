import React from "react"

import Image from "next/image"

import { Footer, PrivacyPolicy, LicensePolicy } from "@/features/footer"
import { Header, MobileHeader } from "@/features/header"
import prefooter from "@/public/images/prefooterImage.svg"
import { BgImage, LocalizedTextFabric, AppleButton, ImageTextFabric } from "@/shared/ui"
import { AboutSection } from "@/widgets/about-section"
import { FAQSection } from "@/widgets/faq-section"
import { FeaturesSection } from "@/widgets/features-section"
import { HeroSection } from "@/widgets/hero-section"
import { ReviewsSection } from "@/widgets/reviews-section"

const LandingLayout = () => {
  return (
    <>
      <PrivacyPolicy></PrivacyPolicy>
      <LicensePolicy></LicensePolicy>
      <Header />
      <MobileHeader />
      <main className="w-full pt-[10vh] flex flex-col items-center bg-white dark:bg-dark-bg gap-y-[9vh] xl:gap-y-[15vh]">
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

        <FAQSection />

        <section id={"prefooter"} className="w-full px-[3.5%] h-[70vh] ">
          <div className="w-full h-full bg-dark-bg dark:bg-white rounded-[21px] flex items-center justify-center shadow-xl relative">
            <div className="z-[1000] flex text-invert items-center text-center flex-col w-[80%] xl:w-[40%] gap-y-3 xl:gap-y-0 dark:text-black text-[#fdfdfd]">
              <LocalizedTextFabric 
                id={7} 
                translationKey="prefooter.title" 
                fallback="free trial" 
              />
              <div className="mt-[1%]">
                <LocalizedTextFabric
                  id={1}
                  translationKey="prefooter.subtitle"
                  fallback="start growing your business today"
                />
              </div>
              <div className="mt-[5%] mb-[5%]">
                <LocalizedTextFabric
                  id={2}
                  translationKey="prefooter.description"
                  fallback="fast implementation - we will help you transfer the necessary data and customize the service for your tasks"
                />
              </div>
              <AppleButton></AppleButton>
            </div>

            <Image
              src={prefooter}
              alt={""}
              fill
              style={{ objectFit: "cover" }}
              className="rounded-[20px] dark:hidden"
            ></Image>
          </div>
        </section>
      </main>
      <Footer></Footer>
    </>
  )
}

export default LandingLayout
