"use client";

import React from "react";

import { useTranslations } from "next-intl";

// Стили подключены глобально в globals.css

interface LocalizedTextProps {
  translationKey: string;
  id: number;
  fallback?: string;
}

const LocalizedText = ({
  id,
  translationKey,
  fallback,
}: LocalizedTextProps) => {
  let text: string;

  try {
    const t = useTranslations();
    text = t(translationKey);

    // Проверяем, получили ли мы fallback или реальный перевод
    if (text === translationKey) {
      text = fallback || translationKey;
    }
  } catch {
    // Если useTranslations не работает, используем fallback
    text = fallback || translationKey;
  }

  switch (id) {
    case 1:
      return (
        <h1 className="text-[8.5vw] xl:text-[3.75vw] font-medium leading-none tracking-tight ">
          {text}
        </h1>
      );
    // Big titles

    case 2:
      return <p className="text-[4vw] xl:text-[1.167vw] font-light ">{text}</p>;
    //  Small description

    case 3:
      return (
        <p className="text-[4vw] xl:text-[1.333vw] dark:text-dark-text/40 text-lightText/40">
          {text}
        </p>
      );
    // Ghost text

    case 4:
      return (
        <h3 className="text-[4vw] xl:text-[1.2vw] font-medium leading-none tracking-tight ">
          {text}
        </h3>
      );
    // title que

    case 5:
      return (
        <div className="gradient__text">
          <p className="xl:text-[1.1vw] text-[3vw]">{text}</p>
        </div>
      );
      // button text

      return <></>;

    case 6:
      return (
        <p className="text-[6vw] xl:text-[2vw] font-medium leading-none tracking-tight">
          {text}
        </p>
      );
    // title feature

    case 7:
      return (
        <p className="text-[4vw] xl:text-[1.333vw] text-dark-text/40 dark:text-lightText/40">
          {text}
        </p>
      );

    // ghost for invert bg
    default:
      return <p>{text}</p>;
  }
};

export default LocalizedText;
