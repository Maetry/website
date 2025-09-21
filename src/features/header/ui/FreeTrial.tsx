"use client"
import React from "react"

import { useRouter } from "next/navigation"

import { useTranslations } from 'next-intl'

import styles from "@/styles/GradientAnimation.module.css"

interface TrialProps {
  type: string
}
const FreeTrial = ({ type }: TrialProps) => {
  const router = useRouter()
  const t = useTranslations()

  switch (type) {
    case "mobile":
      return (
        <button
          onClick={() =>
            router.push("https://apps.apple.com/app/id6746678571")
          }
          className="w-full cursor-pointer dark:active:bg-lightText/60 active:bg-dark-bg/10 transition-all duration-100 h-[50px] md:h-[70px] rounded-[10px] text-[14px] md:text-[20px] bg-white dark:bg-dark-bg"
        >
          <label className={`${styles.gradient__text} cursor-pointer`}>{t('header.freeTrial')}</label>
        </button>
      )
    case "pc":
      return (
        <button
          onClick={() =>
            router.push("https://apps.apple.com/app/id6746678571")
          }
          className="mr-[3%] cursor-pointer"
        >
          <label className={`${styles.gradient__text} cursor-pointer`}>{t('header.freeTrial')}</label>
        </button>
      )
  }
}

export default FreeTrial
