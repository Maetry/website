import React from "react"

import { useAppSelector } from "@/lib/hooks"
// Стили подключены глобально в globals.css

import { MobileNav } from "./MobileNav"

const SlideBarLinks = () => {
  const showLinks = useAppSelector((state) => state.mobileMenu.showLinks)
  const Theme = useAppSelector((state) => state.theme.blackTheme)

  return (
    <div
      className={`absolute left-0 ${
        showLinks ? "z-[1000] opacity-1" : "translate-x-[100%] opacity-0"
      } bg-white dark:bg-dark-bg dark:text-dark-text h-[93vh] py-6 w-full flex flex-col px-6 items-start transition-all duration-300 top-[7vh]`}
    >

      {Theme ? (
        <div className="darkAnimatedGradient">
          <MobileNav />
        </div>
      ) : (
        <div className="animatedGradient">
          <MobileNav />
        </div>
      )}
    </div>
  )
}

export default SlideBarLinks
