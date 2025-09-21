"use client"
import React from "react"

import Image from "next/image"
import Link from "next/link"

import { toggleHeader } from "@/entities/mobile-header"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import closeImage from "@/public/images/closeImage.svg"
import logo from "@/public/images/logo.svg"
import mobileMenu from "@/public/images/mobile_menu.svg"
import { ThemeSwitcher, LocalizedTextFabric, LanguageSelector } from "@/shared/ui"

import LinksBar from "./SlideBarLinks"


const MobileHeader = () => {
  const dispatch = useAppDispatch()
  const showLinks = useAppSelector((state) => state.mobileHeader.showLinks)


  return (
    <header className="fixed xl:hidden bg-white dark:bg-dark-bg z-[3000] h-[7vh] w-full items-center gap-x-4 shadow-sm px-[3.5%]">
      <div className="flex w-full items-center h-full">
        {!showLinks ? (
          // Закрытое состояние: логотип слева, кнопка меню справа
          <>
            <Link href={"/"} className="flex">
              <Image
                src={logo}
                alt={""}
                width={100}
                height={19}
                className="dark:invert w-[20vw] md:w-[12vw] lg:w-[13vw] h-auto"
              ></Image>
            </Link>

            <button
              onClick={() => dispatch(toggleHeader())}
              className="flex gap-x-2 h-full items-center ml-auto"
            >
              <label className="text-[14px] md:text-[16px] lg:text-[22px] dark:text-dark-text flex">
                <LocalizedTextFabric translationKey="navigation.menu" id={2} fallback="menu" />
              </label>
              <Image
                src={mobileMenu}
                alt={"mobile menu"}
                width={13}
                height={13}
                className="md:w-[15px] dark:invert md:h-[15px]"
              ></Image>
            </button>
          </>
        ) : (
          // Открытое состояние: переключатель темы слева, локализация и кнопка закрытия справа
          <>
            <div className="flex h-full items-center">
              <ThemeSwitcher></ThemeSwitcher>
            </div>

            <div className="flex h-full items-center flex-1 justify-end gap-x-2 md:gap-x-4">
              <LanguageSelector variant="mobile" />
              <button
                onClick={() => dispatch(toggleHeader())}
                className="flex h-full items-center ml-2"
              >
                <Image
                  src={closeImage}
                  alt={"close menu"}
                  width={16}
                  height={16}
                  className="md:w-[18px] md:h-[18px] dark:invert"
                ></Image>
              </button>
            </div>
          </>
        )}
      </div>
      <LinksBar />
    </header>
  )
}

export default MobileHeader
