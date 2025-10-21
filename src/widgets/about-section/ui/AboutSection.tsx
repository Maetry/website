"use client"

import React from "react"

import { useAppSelector } from "@/lib/hooks"
import { LocalizedImage } from "@/shared/localization"
import { ScrollingImage, ScrollingText, LocalizedText } from "@/shared/ui"

const AboutSection = () => {
  const isDark = useAppSelector((state) => state.theme.blackTheme)

  return (
    <section
      id="about"
      className="w-full xl:h-[100vh] 2xl:h-auto 2xl:min-h-screen flex flex-col justify-center xl:justify-center items-center scroll-mt-[100px] pb-[10vh]"
    >
      <div className="flex w-full flex-col items-center xl:text-start text-center xl:flex-row px-[3.5%]">
        <div className="w-[80%] xl:w-1/2 xl:h-full flex items-center justify-center relative">
          <LocalizedImage
            baseImage={isDark ? "/images/phones_about_center_dark.svg" : "/images/phones_about_center_light.svg"}
            alt=""
            width={400}
            height={600}
            className="w-[40vw] xl:w-[16vw] z-[1000]"
          />
          <ScrollingImage></ScrollingImage>
        </div>
        <div className="xl:w-1/2 items-center xl:items-start w-full flex flex-col gap-y-2 mt-[5vh] xl:px-0 px-[10%]">
          <LocalizedText 
            id={3} 
            translationKey="about.mission"
            fallback="our mission"
          />

          <LocalizedText
            id={1}
            translationKey="about.title"
            fallback="free your time from routine and your business from mistakes"
          />

          <div className="mt-[5%]">
            <LocalizedText
              id={2}
              translationKey="about.description"
              fallback="maetry allows entrepreneurs to grow their business from anywhere in the world via a mobile app"
            />
          </div>
        </div>
      </div>

      <div className="flex w-full overflow-x-hidden overflow-y-visible flex-col mt-[5vh] lg:mt-[3vh] h-auto min-h-0 py-[5vh]">
        <ScrollingText></ScrollingText>
      </div>
    </section>
  )
}

export default AboutSection
