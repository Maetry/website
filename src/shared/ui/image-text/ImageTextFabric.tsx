"use client"

/* eslint-disable import/order */
import React from "react"

import Image from "next/image"

import firstBlockText from "@/public/images/1stBlockText.svg"
import firstBlockTextRu from "@/public/images/1stBlockText_ru.svg"
import block4thTextDark from "@/public/images/4th_block_bg_text_dark.svg"
import block4thTextDarkRu from "@/public/images/4th_block_bg_text_dark_ru.svg"
import block4thTextLight from "@/public/images/4th_block_bg_text_light.svg"
import block4thTextLightRu from "@/public/images/4th_block_bg_text_light_ru.svg"
import darkBlockText from "@/public/images/dark1stBlockText.svg"
import darkBlockTextRu from "@/public/images/dark1stBlockText_ru.svg"
import darkMonbile1stBlockText from "@/public/images/darkMobile1stBlockText.svg"
import darkMonbile1stBlockTextRu from "@/public/images/darkMobile1stBlockText_ru.svg"
import monbile1stBlockText from "@/public/images/mobile1stBlockText.svg"
import monbile1stBlockTextRu from "@/public/images/mobile1stBlockText_ru.svg"
import mobileBlock4Dark from "@/public/images/mobileDark4.svg"
import mobileBlock4DarkRu from "@/public/images/mobileDark4_ru.svg"
import mobileBlock4Light from "@/public/images/mobileLight4.svg"
import mobileBlock4LightRu from "@/public/images/mobileLight4_ru.svg"

import { useParams } from "next/navigation"

import { useAppSelector } from "@/lib/hooks"

interface ImageTextFabricProps {
  id: number
}

const ImageTextFabric = ({ id }: ImageTextFabricProps) => {
  const isDark = useAppSelector((state) => state.blackTheme.blackTheme)
  const params = useParams()
  const locale = (params?.locale as string) || 'en'
  
  // Выбираем изображения в зависимости от локали
  const getImage = (enImage: string, ruImage: string) => {
    return locale === 'ru' ? ruImage : enImage
  }

  switch (id) {
    case 1:
      return (
        <div className="flex flex-col items-center">
          <Image
            src={isDark ? getImage(darkBlockText, darkBlockTextRu) : getImage(firstBlockText, firstBlockTextRu)}
            alt={""}
            className={`w-[70vw] hidden xl:flex`}
          ></Image>
          <Image
            src={isDark ? getImage(darkMonbile1stBlockText, darkMonbile1stBlockTextRu) : getImage(monbile1stBlockText, monbile1stBlockTextRu)}
            alt={""}
            className={`scale-135 md:scale-150 md:py-[10%] xl:hidden`}
          ></Image>
        </div>
      )
    case 2:
      return (
        <div className="flex z-[1000]">
          <Image
            src={isDark ? getImage(block4thTextDark, block4thTextDarkRu) : getImage(block4thTextLight, block4thTextLightRu)}
            alt={""}
            className={`w-[70vw] hidden xl:flex  `}
          ></Image>
          <Image
            src={isDark ? getImage(mobileBlock4Dark, mobileBlock4DarkRu) : getImage(mobileBlock4Light, mobileBlock4LightRu)}
            alt={""}
            className={`w-[80vw] xl:hidden`}
          />
        </div>
      )
  }
}

export default ImageTextFabric
