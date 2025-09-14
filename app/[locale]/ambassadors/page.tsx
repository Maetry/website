"use client"

import React from "react";

import { useTranslations } from 'next-intl';

import { AmbassadorFeature } from "@/features/ambassador"
import { Footer } from "@/features/footer"
import { Header, MobileHeader } from "@/features/header"
import styles from "@/styles/GradientAnimation.module.css"

const AmbassadorPage = () => {
  const t = useTranslations('ambassador');
  
  const features = [
    {
      icon: "📅",
      title: t('features.appointments.title'),
      problems: t.raw('features.appointments.problems'),
      solutions: t.raw('features.appointments.solutions'),
      benefits: t.raw('features.appointments.benefits')
    },
    {
      icon: "⏰",
      title: t('features.schedule.title'),
      problems: t.raw('features.schedule.problems'),
      solutions: t.raw('features.schedule.solutions'),
      benefits: t.raw('features.schedule.benefits')
    },
    {
      icon: "💅",
      title: t('features.services.title'),
      problems: t.raw('features.services.problems'),
      solutions: t.raw('features.services.solutions'),
      benefits: t.raw('features.services.benefits')
    },
    {
      icon: "👥",
      title: t('features.clients.title'),
      problems: t.raw('features.clients.problems'),
      solutions: t.raw('features.clients.solutions'),
      benefits: t.raw('features.clients.benefits')
    },
    {
      icon: "👨‍💼",
      title: t('features.employees.title'),
      problems: t.raw('features.employees.problems'),
      solutions: t.raw('features.employees.solutions'),
      benefits: t.raw('features.employees.benefits')
    },
    {
      icon: "🏪",
      title: t('features.salon.title'),
      problems: t.raw('features.salon.problems'),
      solutions: t.raw('features.salon.solutions'),
      benefits: t.raw('features.salon.benefits')
    },
    {
      icon: "📱",
      title: t('features.attraction.title'),
      problems: t.raw('features.attraction.problems'),
      solutions: t.raw('features.attraction.solutions'),
      benefits: t.raw('features.attraction.benefits')
    },
    {
      icon: "🏢",
      title: t('features.workspaces.title'),
      problems: t.raw('features.workspaces.problems'),
      solutions: t.raw('features.workspaces.solutions'),
      benefits: t.raw('features.workspaces.benefits')
    },
    {
      icon: "💬",
      title: t('features.support.title'),
      problems: t.raw('features.support.problems'),
      solutions: t.raw('features.support.solutions'),
      benefits: t.raw('features.support.benefits')
    }
  ]

  return (
    <>
      <Header />
      <MobileHeader />
      <main className="w-full pt-[10vh] flex flex-col items-center bg-white dark:bg-dark-bg gap-y-[9vh] xl:gap-y-[15vh]">
        
        {/* Hero Section */}
        <section className="w-full h-[75vh] lg:h-[90vh] items-center justify-center flex px-[3.5%] pb-[5vh]">
          <div className="w-full moving-background relative h-full rounded-[21px] shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-[21px]"></div>
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-[5%]">
              <h1 className="text-[2.5rem] md:text-[4rem] xl:text-[5rem] font-bold mb-6 text-gray-900 dark:text-white">
                {t('title')}
              </h1>
              <p className="text-[1.2rem] md:text-[1.5rem] xl:text-[1.8rem] mb-8 max-w-4xl text-gray-900 dark:text-white">
                {t('subtitle')}
              </p>
                             <div className="flex justify-center">
                 <button 
                   onClick={() => window.open('https://trackdesk.com', '_blank')}
                   className="px-10 py-4 bg-white text-gray-900 border-2 border-white rounded-[12px] font-semibold text-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-lg transform hover:scale-105"
                 >
                   {t('becomePartner')}
                 </button>
               </div>
            </div>
          </div>
        </section>

        {/* About Maetry Section */}
        <section className="w-full px-[3.5%]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-[2rem] md:text-[3rem] xl:text-[4rem] font-bold mb-6">
                <span className={styles.gradient__text}>Maetry</span> — {t('aboutTitle')}
              </h2>
              <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                {t('aboutDescription')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full px-[3.5%]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <AmbassadorFeature
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  problems={feature.problems}
                  solutions={feature.solutions}
                  benefits={feature.benefits}
                />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full px-[3.5%] py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[2rem] md:text-[3rem] font-bold mb-6">
              <span className={styles.gradient__text}>{t('readyToPartner')}</span>
            </h2>
            <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 mb-8">
              {t('partnerDescription')}
            </p>
                         <div className="flex justify-center">
               <button 
                 onClick={() => window.open('https://trackdesk.com', '_blank')}
                 className="px-10 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600 dark:border-purple-400 rounded-[12px] font-semibold text-lg transition-all duration-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:shadow-lg transform hover:scale-105"
               >
                 {t('startEarning')}
               </button>
             </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}

export default AmbassadorPage
