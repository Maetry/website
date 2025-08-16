"use client"

import React from "react"
import Header from "@/components/Header/Header"
import MobileHeader from "@/components/Header/MobileHeader"
import Footer from "@/components/Footer/Footer"
import AmbassadorFeature from "@/components/ambassador/AmbassadorFeature"
import styles from "@/styles/GradientAnimation.module.css"
import Head from "next/head"

const AmbassadorPage = () => {
  const features = [
    {
      icon: "📅",
      title: "Записи клиентов",
      problems: [
        "Записи ведутся в блокнотах и календарях, теряются",
        "Не видно свободных слотов",
        "Сложно распределять записи между мастерами"
      ],
      solutions: [
        "Все записи централизованы в приложении",
        "Визуальное расписание дня",
        "Отображение всех мастеров на одном экране"
      ],
      benefits: [
        "Экономия времени администратора",
        "Больше клиентов за счёт порядка",
        "Контроль бизнеса с телефона"
      ]
    },
    {
      icon: "⏰",
      title: "График работы",
      problems: [
        "Клиенты звонят, чтобы уточнить расписание",
        "Трудно настроить смены мастеров",
        "Изменения в расписании занимают много времени"
      ],
      solutions: [
        "Гибкая настройка рабочих дней",
        "Индивидуальные графики сотрудников",
        "Редактирование только нужных дней"
      ],
      benefits: [
        "Меньше звонков в салон",
        "Чёткая загрузка мастеров",
        "Салон работает без накладок"
      ]
    },
    {
      icon: "💅",
      title: "Каталог услуг",
      problems: [
        "Услуги держат в памяти или блокноте",
        "Неясно, кто и по какой цене оказывает услугу",
        "Клиенты не готовы к процедурам"
      ],
      solutions: [
        "Добавление услуг из готового списка или вручную",
        "Индивидуальные цены и описания для мастеров",
        "Подсказки клиентам о подготовке к процедуре"
      ],
      benefits: [
        "Экономия времени администратора",
        "Исключение ошибок",
        "Повышение качества сервиса"
      ]
    },
    {
      icon: "👥",
      title: "Клиентская база",
      problems: [
        "Нет истории клиентов и их контактов",
        "Нельзя понять, кто перестал ходить",
        "Всё держат в голове"
      ],
      solutions: [
        "Добавление клиентов вручную или через приглашения",
        "Ведение истории посещений и услуг"
      ],
      benefits: [
        "Анализ активности клиентов",
        "Повышение лояльности",
        "База для рассылок и маркетинга"
      ]
    },
    {
      icon: "👨‍💼",
      title: "Сотрудники",
      problems: [
        "Нет контроля за работой мастеров",
        "Непрозрачные должности и зарплаты",
        "Трудно вести учёт загрузки"
      ],
      solutions: [
        "Создание ролей и должностей",
        "Настройка доступа и зарплат",
        "Учёт клиентов за конкретными мастерами"
      ],
      benefits: [
        "Прозрачность и контроль",
        "Автоматизация зарплат",
        "Удобное распределение клиентов"
      ]
    },
    {
      icon: "🏪",
      title: "Настройки салона",
      problems: [
        "Клиенты не знают контактов и адреса",
        "Нет централизованной информации",
        "Новые клиенты не могут найти салон"
      ],
      solutions: [
        "Карточка салона с описанием и контактами",
        "Адрес на карте и маршрут",
        "Отображение в поиске Maetry"
      ],
      benefits: [
        "Больше доверия у клиентов",
        "Меньше звонков",
        "Дополнительный поток клиентов"
      ]
    },
    {
      icon: "📱",
      title: "Привлечение клиентов",
      problems: [
        "Сложно рассказать о себе и привлечь новых",
        "Клиентам неудобно звонить"
      ],
      solutions: [
        "Ссылка для записи в соцсетях и на сайте",
        "QR-код для офлайн-привлечения"
      ],
      benefits: [
        "Дополнительный поток клиентов без затрат",
        "Клиент записывается сам",
        "Современный удобный инструмент"
      ]
    },
    {
      icon: "🏢",
      title: "Рабочие пространства",
      problems: [
        "Мастера работают в разных местах и теряют записи",
        "Владельцы салонов тратят время на разные системы"
      ],
      solutions: [
        "Переключение между салонами в одно касание",
        "Синхронизация записей",
        "Управление сетями салонов"
      ],
      benefits: [
        "Экономия времени",
        "Контроль бизнеса в одном месте",
        "Универсальность для мастеров"
      ]
    },
    {
      icon: "💬",
      title: "Поддержка",
      problems: [
        "Владельцы боятся новых приложений",
        "Нет времени искать инструкции",
        "Персонал теряется при работе"
      ],
      solutions: [
        "Живой чат поддержки внутри приложения",
        "Туториалы для каждого экрана",
        "База знаний с инструкциями"
      ],
      benefits: [
        "Быстрый старт без обучения",
        "Минимум стресса",
        "Уверенность в работе с системой"
      ]
    }
  ]

  return (
    <>
      <Head>
        <title>Партнёрская программа Maetry - Зарабатывайте с нами</title>
        <meta
          name="description"
          content="Присоединяйтесь к партнёрской программе Maetry. Зарабатывайте, помогая салонам красоты автоматизировать бизнес и управлять записями клиентов."
        />
        <meta
          name="keywords"
          content="партнёрская программа, maetry, салон красоты, управление, автоматизация, записи клиентов, график работы"
        />
        <meta property="og:title" content="Партнёрская программа Maetry" />
        <meta
          property="og:description"
          content="Зарабатывайте, помогая салонам красоты автоматизировать бизнес"
        />
        <meta property="og:url" content="https://maetry.com/ambassador" />
        <meta property="og:type" content="website" />
      </Head>
      <Header />
      <MobileHeader />
      <main className="w-full pt-[10vh] flex flex-col items-center bg-white dark:bg-dark-bg gap-y-[9vh] xl:gap-y-[15vh]">
        
        {/* Hero Section */}
        <section className="w-full h-[75vh] lg:h-[90vh] items-center justify-center flex px-[3.5%] pb-[5vh]">
          <div className="w-full moving-background relative h-full rounded-[21px] shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-[21px]"></div>
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-[5%]">
              <h1 className="text-[2.5rem] md:text-[4rem] xl:text-[5rem] font-bold mb-6 text-gray-900 dark:text-white">
                Партнёрская программа
              </h1>
              <p className="text-[1.2rem] md:text-[1.5rem] xl:text-[1.8rem] mb-8 max-w-4xl text-gray-900 dark:text-white">
                Зарабатывайте, помогая салонам красоты автоматизировать бизнес
              </p>
                             <div className="flex justify-center">
                 <button 
                   onClick={() => window.open('https://trackdesk.com', '_blank')}
                   className="px-10 py-4 bg-white text-gray-900 border-2 border-white rounded-[12px] font-semibold text-lg transition-all duration-300 hover:bg-gray-50 hover:shadow-lg transform hover:scale-105"
                 >
                   Стать партнёром
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
                <span className={styles.gradient__text}>Maetry</span> — сервис для управления салоном красоты
              </h2>
              <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
                Maetry помогает автоматизировать процессы, привлекать клиентов и контролировать бизнес в одном приложении.
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
              <span className={styles.gradient__text}>Готовы стать партнёром?</span>
            </h2>
            <p className="text-[1.2rem] md:text-[1.5rem] text-gray-600 dark:text-gray-300 mb-8">
              Присоединяйтесь к нашей партнёрской программе и зарабатывайте, помогая салонам красоты расти
            </p>
                         <div className="flex justify-center">
               <button 
                 onClick={() => window.open('https://trackdesk.com', '_blank')}
                 className="px-10 py-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-purple-600 dark:border-purple-400 rounded-[12px] font-semibold text-lg transition-all duration-300 hover:bg-purple-50 dark:hover:bg-gray-700 hover:shadow-lg transform hover:scale-105"
               >
                 Начать зарабатывать
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
