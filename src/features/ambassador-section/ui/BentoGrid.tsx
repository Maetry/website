import { getTranslations } from "next-intl/server";

import BentoBox from "./BentoBox";

interface Feature {
  icon: string;
  title: string;
  problems: string[];
  solutions: string[];
  benefits: string[];
  size?: "small" | "medium" | "large" | "wide";
  color?: "blue" | "green" | "purple" | "orange" | "red" | "indigo";
}

const BentoGrid = async () => {
  const t = await getTranslations("ambassador");
  const labels = {
    problem: t("labels.problem"),
    solution: t("labels.solution"),
    benefit: t("labels.benefit"),
  };

  const features: Feature[] = [
    {
      icon: "📅",
      title: t("features.appointments.title"),
      problems: t.raw("features.appointments.problems"),
      solutions: t.raw("features.appointments.solutions"),
      benefits: t.raw("features.appointments.benefits"),
      size: "large",
      color: "blue",
    },
    {
      icon: "⏰",
      title: t("features.schedule.title"),
      problems: t.raw("features.schedule.problems"),
      solutions: t.raw("features.schedule.solutions"),
      benefits: t.raw("features.schedule.benefits"),
      size: "medium",
      color: "green",
    },
    {
      icon: "💅",
      title: t("features.services.title"),
      problems: t.raw("features.services.problems"),
      solutions: t.raw("features.services.solutions"),
      benefits: t.raw("features.services.benefits"),
      size: "medium",
      color: "purple",
    },
    {
      icon: "👥",
      title: t("features.clients.title"),
      problems: t.raw("features.clients.problems"),
      solutions: t.raw("features.clients.solutions"),
      benefits: t.raw("features.clients.benefits"),
      size: "wide",
      color: "orange",
    },
    {
      icon: "👨‍💼",
      title: t("features.employees.title"),
      problems: t.raw("features.employees.problems"),
      solutions: t.raw("features.employees.solutions"),
      benefits: t.raw("features.employees.benefits"),
      size: "small",
      color: "red",
    },
    {
      icon: "🏪",
      title: t("features.salon.title"),
      problems: t.raw("features.salon.problems"),
      solutions: t.raw("features.salon.solutions"),
      benefits: t.raw("features.salon.benefits"),
      size: "small",
      color: "indigo",
    },
    {
      icon: "📱",
      title: t("features.attraction.title"),
      problems: t.raw("features.attraction.problems"),
      solutions: t.raw("features.attraction.solutions"),
      benefits: t.raw("features.attraction.benefits"),
      size: "medium",
      color: "green",
    },
    {
      icon: "🏢",
      title: t("features.workspaces.title"),
      problems: t.raw("features.workspaces.problems"),
      solutions: t.raw("features.workspaces.solutions"),
      benefits: t.raw("features.workspaces.benefits"),
      size: "medium",
      color: "purple",
    },
    {
      icon: "💬",
      title: t("features.support.title"),
      problems: t.raw("features.support.problems"),
      solutions: t.raw("features.support.solutions"),
      benefits: t.raw("features.support.benefits"),
      size: "wide",
      color: "blue",
    },
  ];

  return (
    <div className="w-full px-[3.5%]">
      <div className="max-w-7xl mx-auto">
        {/* Grid Title */}
        <div className="text-center mb-12">
          <h2 className="text-[2rem] md:text-[3rem] xl:text-[4rem] font-bold mb-6 text-gray-900 dark:text-white">
            {t("gridTitle")}{" "}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Maetry
            </span>
          </h2>
          <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {t("gridDescription")}
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[200px]">
          {features.map((feature, index) => (
            <BentoBox
              key={index}
              icon={feature.icon}
              title={feature.title}
              problems={feature.problems}
              solutions={feature.solutions}
              benefits={feature.benefits}
              labels={labels}
              size={feature.size}
              color={feature.color}
            />
          ))}
        </div>

        {/* Grid Info */}
        <div className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {t("gridHint")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BentoGrid;
