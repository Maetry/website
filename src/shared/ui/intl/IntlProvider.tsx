"use client"

import React, { useEffect, useState } from 'react';

import { NextIntlClientProvider } from 'next-intl';

// Статические импорты для отладки
import enMessages from '../../../locales/en.json';
import ruMessages from '../../../locales/ru.json';

interface IntlProviderProps {
  children: React.ReactNode
  locale: string
}

export const IntlProvider = ({ children, locale }: IntlProviderProps) => {
  const [messages, setMessages] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadMessages = () => {
      try {
        console.log('🔍 DEBUG: Loading messages for locale:', locale)
        console.log('🔍 DEBUG: Available ruMessages:', ruMessages)
        console.log('🔍 DEBUG: Available enMessages:', enMessages)
        
        let messages;
        if (locale === 'ru') {
          console.log('🔍 DEBUG: Using Russian messages')
          messages = ruMessages
        } else if (locale === 'en') {
          console.log('🔍 DEBUG: Using English messages')
          messages = enMessages
        } else {
          console.log('❌ DEBUG: Unknown locale, using Russian as default')
          messages = ruMessages
        }
        
        console.log('✅ DEBUG: Successfully loaded messages:', messages)
        console.log('🔍 DEBUG: Message keys:', Object.keys(messages))
        console.log('🔍 DEBUG: Checking about.mission:', messages.about?.mission)
        console.log('🔍 DEBUG: Checking about.title:', messages.about?.title)
        console.log('🔍 DEBUG: Checking about.description:', messages.about?.description)
        
        setMessages(messages)
      } catch (error) {
        console.error('❌ DEBUG: Error loading messages:', error)
        console.error('❌ DEBUG: Error details:', error instanceof Error ? error.message : String(error))
        setMessages({})
      } finally {
        console.log('🔍 DEBUG: Setting isLoading to false')
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [locale])

  // Показываем загрузку или пустой контекст
  if (isLoading) {
    console.log('🔍 DEBUG: IntlProvider - Loading state, using empty messages')
    return (
      <NextIntlClientProvider messages={{}} locale={locale}>
        {children}
      </NextIntlClientProvider>
    )
  }

  console.log('🔍 DEBUG: IntlProvider - Providing messages:', messages)
  console.log('🔍 DEBUG: IntlProvider - Locale:', locale)
  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      {children}
    </NextIntlClientProvider>
  )
}
