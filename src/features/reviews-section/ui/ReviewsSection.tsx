import React from "react"

import { Review } from "@/features/reviews"
import { LocalizedText } from "@/shared/ui"

const ReviewsSection = () => {
  return (
    <section
      id="reviews"
      className="w-[93%] px-[3.5%] flex flex-col justify-center xl:justify-center items-center gap-y-[5vh] xl:gap-y-[8vh] scroll-mt-[100px]"
    >
      <div className="w-full flex flex-col">
        <LocalizedText 
          id={3} 
          translationKey="reviews.subtitle"
          fallback="why choose us"
        />
        <LocalizedText 
          id={1} 
          translationKey="reviews.title"
          fallback="make business easier"
        />
      </div>
      <div className="flex xl:flex-row flex-col w-full gap-5 md:gap-10 xl:gap-5">
        <Review
          id={2}
          titleKey="reviews.julia.name"
          titleFallback="Julia"
          roleKey="reviews.julia.role"
          roleFallback="Owner of a chain PROmanicure"
          descriptionKey="reviews.julia.text"
          descriptionFallback="Maetry helps me plan every day in the salon. I understand how many clients are registered and for which services, who is new and who is regular. The client base is formed without my participation"
        />
        <Review
          id={1}
          titleKey="reviews.nikita.name"
          titleFallback="Nikita"
          roleKey="reviews.nikita.role"
          roleFallback="founder Lui Philipp"
          descriptionKey="reviews.nikita.text"
          descriptionFallback="I know a lot of beauty salons that don't use online enrollment. We need to look at what mistakes our competitors are making and do better. Our main flow of clients comes through maetry"
        />

        <Review
          id={3}
          titleKey="reviews.sofia.name"
          titleFallback="Sofia"
          roleKey="reviews.sofia.role"
          roleFallback="Manager of Bonny beauty salon"
          descriptionKey="reviews.sofia.text"
          descriptionFallback="The app is constantly being improved together with our network of salons. At maetry, we follow analytics and monitor feedback. This helps us to work on the quality of service and improve the level of service"
        />
        <Review
          id={4}
          titleKey="reviews.irina.name"
          titleFallback="Irina"
          roleKey="reviews.irina.role"
          roleFallback="Eyelash extension specialist"
          descriptionKey="reviews.irina.text"
          descriptionFallback="I started spending less time analyzing the salon's financial performance. This option allows me to determine which services are generating more profit and which ones need to be adjusted or improved"
        />
      </div>
    </section>
  )
}

export default ReviewsSection
