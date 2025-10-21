import React from "react"

import { BgImage, LocalizedText, ImageTextFabric } from "@/shared/ui"

const HeroSection = () => {
  return (
    <section className="w-full h-[75vh] lg:h-[90vh] items-center justify-center flex px-[3.5%] pb-[5vh]">
      <div className="w-full moving-background relative h-full rounded-[21px] shadow-lg">
        <BgImage></BgImage>
      </div>
      <div className="flex flex-col absolute items-center xl:scale-105 2xl:scale-120">
        <div className="mb-[2%]">
          <LocalizedText
            id={3}
            translationKey="hero.subtitle"
            fallback="multiple tasks — one ecosystem"
          />
        </div>

        <ImageTextFabric id={1}></ImageTextFabric>

        <div className="mt-[5%] w-[80%] text-center">
          <LocalizedText
            id={2}
            translationKey="hero.description"
            fallback="Create your own ecosystem for record automation"
          />
        </div>
      </div>
    </section>
  )
}

export default HeroSection
