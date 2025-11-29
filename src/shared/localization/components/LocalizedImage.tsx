"use client";

import Image, { ImageProps } from "next/image";
import { useParams } from "next/navigation";

import { getLocalizedImage } from "../utils";

interface LocalizedImageProps extends Omit<ImageProps, "src"> {
  baseImage: string;
  alt: string;
}

/**
 * Компонент для отображения локализованных изображений
 * Автоматически добавляет суффикс локали (_ru, _es) к базовому изображению
 * Если локализованная версия не найдена, показывает базовое изображение
 */
export const LocalizedImage = ({
  baseImage,
  alt,
  ...props
}: LocalizedImageProps) => {
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  // Получаем локализованный путь
  const localizedPath = getLocalizedImage(baseImage, locale);

  return <Image src={localizedPath} alt={alt} {...props} />;
};
