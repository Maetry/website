"use client";
import React from "react";

import { useTranslations } from "next-intl";

// Стили подключены глобально в globals.css

interface SignInProps {
  type: string;
}
const SignIn = ({ type }: SignInProps) => {
  const t = useTranslations();

  switch (type) {
    case "mobile":
      return (
        <button
          onClick={() =>
            window.open("https://console.maetry.com/auth", "_blank")
          }
          className="w-full px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          {t("header.freeTrial")}
        </button>
      );
    case "pc":
      return (
        <button
          onClick={() =>
            window.open("https://console.maetry.com/auth", "_blank")
          }
          className="mr-[3%] px-6 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium hover:bg-gray-50 transition-colors duration-200"
        >
          {t("header.freeTrial")}
        </button>
      );
  }
};

export default SignIn;
