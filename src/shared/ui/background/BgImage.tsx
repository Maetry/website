"use client"

import React from "react"

import { useAppSelector } from "@/lib/hooks"
// Стили подключены глобально в globals.css

const BgImage = () => {
  const DarkTheme = useAppSelector((state) => state.theme.blackTheme)
  return (
    <>
      {DarkTheme ? (
        <div className="darkAnimatedGradient"></div>
      ) : (
        <div className="animatedGradient"></div>
      )}
    </>
  )
}

export default BgImage
