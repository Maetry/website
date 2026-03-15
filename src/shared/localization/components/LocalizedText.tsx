"use client";

import { useTranslations } from "next-intl";

import TextVariant from "@/shared/ui/text/TextVariant";

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

  return <TextVariant id={id} text={text} />;
};

export default LocalizedText;
