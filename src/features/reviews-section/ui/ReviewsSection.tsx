import { getTranslations } from "next-intl/server";

import { Review } from "@/features/reviews";
import { TextVariant } from "@/shared/ui";

const ReviewsSection = async () => {
  const t = await getTranslations("reviews");

  return (
    <section
      id="reviews"
      className="w-[93%] px-[3.5%] flex flex-col justify-center xl:justify-center items-center gap-y-[5vh] xl:gap-y-[8vh] scroll-mt-[100px]"
    >
      <div className="w-full flex flex-col">
        <TextVariant variant="eyebrow" text={t("subtitle")} />
        <TextVariant variant="display" text={t("title")} />
      </div>
      <div className="flex xl:flex-row flex-col w-full gap-5 md:gap-10 xl:gap-5">
        <Review
          id={2}
          title={t("julia.name")}
          role={t("julia.role")}
          description={t("julia.text")}
        />
        <Review
          id={1}
          title={t("nikita.name")}
          role={t("nikita.role")}
          description={t("nikita.text")}
        />

        <Review
          id={3}
          title={t("sofia.name")}
          role={t("sofia.role")}
          description={t("sofia.text")}
        />
        <Review
          id={4}
          title={t("irina.name")}
          role={t("irina.role")}
          description={t("irina.text")}
        />
      </div>
    </section>
  );
};

export default ReviewsSection;
