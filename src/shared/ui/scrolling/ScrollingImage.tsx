"use client"

import React, { useRef, useEffect } from "react"

import Image from "next/image"
import { useParams } from "next/navigation"

import { useAppSelector } from "@/lib/hooks"
import phonesAboutLeftDark from "@/public/images/phones_about_left_dark.svg"
import phonesAboutLeftDarkRu from "@/public/images/phones_about_left_dark_ru.svg"
import phonesAboutLeftLight from "@/public/images/phones_about_left_light.svg"
import phonesAboutLeftLightRu from "@/public/images/phones_about_left_light_ru.svg"
import phonesAboutRightDark from "@/public/images/phones_about_right_dark.svg"
import phonesAboutRightDarkRu from "@/public/images/phones_about_right_dark_ru.svg"
import phonesAboutRightLight from "@/public/images/phones_about_right_light.svg"
import phonesAboutRightLightRu from "@/public/images/phones_about_right_light_ru.svg"

const ScrollingImage = () => {
  const ref = useRef<HTMLDivElement>(null)
  const isDark = useAppSelector((state) => state.blackTheme.blackTheme)
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  
  // Выбираем изображения в зависимости от темы и локали
  const getLeftImage = () => {
    if (isDark) {
      return locale === 'ru' ? phonesAboutLeftDarkRu : phonesAboutLeftDark
    } else {
      return locale === 'ru' ? phonesAboutLeftLightRu : phonesAboutLeftLight
    }
  }
  
  const getRightImage = () => {
    if (isDark) {
      return locale === 'ru' ? phonesAboutRightDarkRu : phonesAboutRightDark
    } else {
      return locale === 'ru' ? phonesAboutRightLightRu : phonesAboutRightLight
    }
  }

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1280 && ref.current) {
        // Проверка ширины экрана
        const scrollY = window.scrollY
        const newWidth = 67 + scrollY / 100
        ref.current.style.width = `${Math.min(newWidth, 80)}vw`
      } else if (window.innerWidth >= 1280 && ref.current) {
        const scrollY = window.scrollY
        const newWidth = 25 + scrollY / 100
        ref.current.style.width = `${Math.min(newWidth, 35)}vw`
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div ref={ref} className="absolute flex justify-between duration-100">
      <Image
        src={getLeftImage()}
        alt=""
        className="w-[25vw] scale-125 xl:scale-100 xl:w-[12vw]"
      />
      <Image
        src={getRightImage()}
        alt=""
        className="w-[25vw] scale-125 xl:scale-100 xl:w-[12vw]"
      />
    </div>
  )
}

export default ScrollingImage
