"use client"

import React, { useEffect, useRef } from "react";

import { useTranslations } from 'next-intl';

import styles from "@/styles/GradientAnimation.module.css";

const ScrollingText = () => {
  const firstRef = useRef<HTMLDivElement>(null)
  const secondRef = useRef<HTMLDivElement>(null)

  // Компонент для повторения переведенного текста
  const RepeatText = ({ translationKey, fallback, repeatCount = 8 }: { 
    translationKey: string; 
    fallback: string; 
    repeatCount?: number;
  }) => {
    const t = useTranslations()
    let text: string
    
    try {
      text = t(translationKey)
      
      // Проверяем, получили ли мы fallback или реальный перевод
      if (text === translationKey) {
        text = fallback || translationKey
      }
    } catch {
      // Если useTranslations не работает, используем fallback
      text = fallback || translationKey
    }
    
    return (
      <>
        {Array.from({ length: repeatCount }, (_, i) => (
          <span key={i}>
            {text}
            {i < repeatCount - 1 && " • "}
          </span>
        ))}
      </>
    )
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const translating = -20 + scrollY / 50

      if (firstRef.current) {
        firstRef.current.style.transform = `translateX(${Math.min(
          translating,
          100
        )}%)`
      }
      if (secondRef.current) {
        secondRef.current.style.transform = `translateX(${-Math.min(
          translating,
          100
        )}%)`
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="space-y-[2vh] py-[3vh]">
      <div className="overflow-x-hidden w-full text-[6vw] xl:text-[4vw] 2xl:text-[100px] pb-[0.5em]" style={{lineHeight: '1.45'}}>
        <div className="whitespace-nowrap">
          <div className="flex justify-center" ref={firstRef}>
            <span className={styles.gradient__scrolling__text}>
              <RepeatText 
                translationKey="scrolling.schedulePlanning" 
                fallback="schedule planning"
                repeatCount={8}
              />
            </span>
          </div>
        </div>
      </div>
      <div className="overflow-hidden w-full text-[6vw] xl:text-[4vw] 2xl:text-[100px] pb-[0.5em]" style={{lineHeight: '1.45'}}>
        <div className="whitespace-nowrap">
          <div className="flex justify-center" ref={secondRef}>
            <span className={styles.gradient__scrolling__text}>
              <RepeatText 
                translationKey="scrolling.analyticsIntegration" 
                fallback="analytics and integration"
                repeatCount={6}
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScrollingText
