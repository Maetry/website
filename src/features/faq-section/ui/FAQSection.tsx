import { getTranslations } from "next-intl/server";

import { Question, Vitaliy } from "@/features/faq";
import { TextVariant } from "@/shared/ui";

const FAQSection = async () => {
  const t = await getTranslations("faq");
  const supportT = await getTranslations("vitaliy");

  return (
    <section
      id={"faq"}
      className="w-[93%] px-[3.5%] flex flex-col gap-y-[5vh] xl:gap-y-[8vh] justify-center"
    >
      <div className="w-full flex flex-col">
        <TextVariant variant="eyebrow" text={t("subtitle")} />
        <TextVariant variant="display" text={t("title")} />
      </div>

      <div className="flex xl:flex-row gap-y-6 flex-col items-start gap-x-6 ">
        <div className="flex flex-1 flex-col gap-y-4 xl:gap-y-2">
          <Question id={1} title={t("q1.question")} answer={t("q1.answer")} />
          <Question id={2} title={t("q2.question")} answer={t("q2.answer")} />
          <Question id={3} title={t("q3.question")} answer={t("q3.answer")} />
          <Question id={4} title={t("q4.question")} answer={t("q4.answer")} />
          <Question id={5} title={t("q5.question")} answer={t("q5.answer")} />
        </div>

        <div
          id={"Vitaliy"}
          className="relative flex w-full mt-[7%] xl:mt-0 xl:w-[31%] rounded-[21px] shadow-lg"
        >
          <Vitaliy
            question={supportT("question")}
            supportTeam={supportT("supportTeam")}
            company={supportT("company")}
            askQuestions={supportT("askQuestions")}
          />
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
