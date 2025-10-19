import React from "react"

import { Feature } from "@/features/feature-card"
import { LocalizedTextFabric } from "@/shared/ui"

const FeaturesSection = () => {
  return (
    <section
      id={"features"}
      className="w-[93%] px-[3.5%] flex justify-center flex flex-col gap-y-[5vh] xl:gap-y-[8vh] scroll-mt-[100px]"
    >
      <div className="flex flex-col w-full">
        <LocalizedTextFabric 
          translationKey="features.subtitle"
          fallback="maetry features"
          id={3}
        />
        <LocalizedTextFabric
          translationKey="features.title"
          fallback="we adapt to any size business"
          id={1}
        />
      </div>

      <div className="flex xl:flex-row flex-col gap-10 xl:gap-5 w-full">
        <Feature
          titleKey="features.management.title"
          titleFallback="management schedule"
          descriptionKey="features.management.description"
          descriptionFallback="Add new employees and make flexible work schedules without overlap"
        />
        <Feature
          titleKey="features.notifications.title"
          titleFallback="notices of record"
          descriptionKey="features.notifications.description"
          descriptionFallback="Automated appointment reminders to customers will help retain contact and increase profitability"
        />
        <Feature
          titleKey="features.onlineBooking.title"
          titleFallback="online appointment for clients"
          descriptionKey="features.onlineBooking.description"
          descriptionFallback="recording without a call will allow you to process more requests and not waste time on confirming visits"
        />
      </div>
    </section>
  )
}

export default FeaturesSection
