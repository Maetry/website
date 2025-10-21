"use client"

import React from "react";

import { useTranslations } from 'next-intl';

import { Footer } from "@/features/footer"
import { Header, MobileHeader } from "@/features/header"
import { BentoGrid } from "@/widgets/ambassador-section"
// Стили подключены глобально в globals.css

const AmbassadorPage = () => {
  const t = useTranslations('ambassador');

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
                <span className="gradient__text">Maetry</span> — {t('aboutTitle')}
              </h2>
              <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                {t('aboutDescription')}
              </p>
            </div>
          </div>
        </section>

        {/* Bento Grid Features */}
        <BentoGrid />

        {/* CTA Section */}
        <section className="w-full px-[3.5%] py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[2rem] md:text-[3rem] font-bold mb-6">
              <span className="gradient__text">{t('readyToPartner')}</span>
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
