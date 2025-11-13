import React from "react"

import { Question, Vitaliy } from "@/features/faq"
import { LocalizedText } from "@/shared/ui"

const FAQSection = () => {
  return (
    <section
      id={"faq"}
      className="w-[93%] px-[3.5%] flex flex-col gap-y-[5vh] xl:gap-y-[8vh] justify-center"
    >
      <div className="w-full flex flex-col">
        <LocalizedText 
          id={3} 
          translationKey="faq.subtitle" 
          fallback="faq" 
        />
        <LocalizedText 
          id={1} 
          translationKey="faq.title" 
          fallback="frequent questions" 
        />
      </div>

      <div className="flex xl:flex-row gap-y-6 flex-col items-start gap-x-6 ">
        <div className="flex flex-1 flex-col gap-y-4 xl:gap-y-2">
          <Question id={1} title="" answer="" />
          <Question id={2} title="" answer="" />
          <Question id={3} title="" answer="" />
          <Question id={4} title="" answer="" />
          <Question id={5} title="" answer="" />
        </div>

        <div
          id={"Vitaliy"}
          className="relative flex w-full mt-[7%] xl:mt-0 xl:w-[31%] rounded-[21px] shadow-lg"
        >
          <Vitaliy></Vitaliy>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
