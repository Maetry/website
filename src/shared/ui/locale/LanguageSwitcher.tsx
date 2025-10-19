"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

interface Language {
  key: string
  name: string
  shortName: string
}

const languages: Language[] = [
  { key: 'ru', name: 'Русский', shortName: 'ru' },
  { key: 'en', name: 'English', shortName: 'en' },
  { key: 'es', name: 'Español', shortName: 'es' }
]

const LanguageSwitcher: React.FC = () => {
  const params = useParams()
  const pathname = usePathname()
  const locale = (params?.locale as string) || 'ru'
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const selectedLanguage = languages.find(language => language.key === locale) || languages[0]

  // Функция для создания ссылки с сохранением текущего пути
  const createLocalizedPath = (newLocale: string) => {
    const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/'
    return `/${newLocale}${pathWithoutLocale}`
  }

  // Обработчик клика вне селектора
  useEffect(() => {
    const handleWindowClick = (event: Event) => {
      const target = event.target as Element
      if (target && target.closest('button')?.id === 'cursor-language-selector') {
        return
      }
      setIsOpen(false)
    }
    window.addEventListener('click', handleWindowClick)
    return () => {
      window.removeEventListener('click', handleWindowClick)
    }
  }, [])

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
        id="cursor-language-selector"
        aria-expanded={isOpen}
      >
        {/* Globe icon */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        <span className="capitalize">{selectedLanguage.shortName}</span>
        {/* Chevron down icon */}
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="currentColor"
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        >
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 bottom-full mb-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="cursor-language-selector"
        >
          <div className="py-1" role="none">
            {languages.map((language) => (
              <Link
                key={language.key}
                href={createLocalizedPath(language.key)}
                onClick={() => setIsOpen(false)}
                className={`${
                  selectedLanguage.key === language.key
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                } flex px-4 py-2 text-sm items-center transition-colors duration-150 w-full`}
                role="menuitem"
              >
                <span className="capitalize">{language.shortName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
