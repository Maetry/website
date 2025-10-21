"use client"

import { useParams } from "next/navigation"

import { getLocalizedImagePath } from "../utils"

/**
 * Хук для получения локализованного изображения
 * @param baseImage - базовое изображение (импортированное или строка)
 * @returns путь к локализованному изображению
 */
export const useLocalizedImage = (baseImage: string | { src: string }): string => {
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  
  return getLocalizedImagePath(baseImage, locale)
}
