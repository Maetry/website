"use client"

import React from "react"

import { useAppSelector } from "@/lib/hooks"

const BgImage = () => {
  const isDarkTheme = useAppSelector((state) => state.theme.blackTheme)
  
  return (
    <div className={isDarkTheme ? "darkAnimatedGradient" : "animatedGradient"} />
  )
}

export default BgImage
