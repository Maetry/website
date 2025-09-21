import React from "react"

import Image from "next/image"
import Link from "next/link"

import logo from "@/public/images/logo.svg"
import { ThemeSwitcher, LanguageSelector, LocalizedTextFabric } from "@/shared/ui"

import FreeTrial from "./FreeTrial"

const Header = () => {
  return (
    <header className="fixed hidden xl:block w-full bg-white dark:bg-dark-bg px-[3.5%] h-[7vh] font-light text-[1.1vw] shadow-sm z-[2000]">
      <div className="flex justify-center h-full items-center gap-x-6 text-light-text dark:text-dark-text">
        <div className="flex flex-1">
          <Link href={"/"}>
            <Image
              src={logo}
              alt={""}
              width={100}
              height={19}
              className="dark:invert w-[7vw] h-auto 2xl:scale-120"
            ></Image>
          </Link>
        </div>
        <nav className="hidden xl:flex gap-x-[1.4vw] justify-center">
          <Link
            href={"/#about"}
            className="relative dark:hover:border-white hover:border-black/50 transition-all duration-200 border-b border-transparent"
          >
            <LocalizedTextFabric 
              translationKey="navigation.about" 
              id={2} 
              fallback="About" 
            />
          </Link>
          <Link
            href={"/#reviews"}
            className="relative dark:hover:border-white hover:border-black/50 transition-all duration-200 border-b border-transparent"
          >
            <LocalizedTextFabric 
              translationKey="navigation.reviews" 
              id={2} 
              fallback="Reviews" 
            />
          </Link>
          <Link
            href={"/#features"}
            className="relative dark:hover:border-white hover:border-black/50 transition-all duration-200 border-b border-transparent"
          >
            <LocalizedTextFabric 
              translationKey="navigation.features" 
              id={2} 
              fallback="Features" 
            />
          </Link>
        </nav>
        <div className="flex-1 hidden items-center xl:flex justify-end gap-x-4">
          <FreeTrial type="pc"></FreeTrial>
          <LanguageSelector variant="desktop" />
          <ThemeSwitcher></ThemeSwitcher>
        </div>
      </div>
    </header>
  )
}

export default Header
