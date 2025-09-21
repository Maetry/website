"use client"

import React, { useState, useEffect } from 'react';

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

interface Language {
  key: string;
  name: string;
  shortName: string;
  flag: string;
}

interface LanguageSelectorProps {
  className?: string;
  variant?: 'desktop' | 'mobile';
}

const languages: Language[] = [
  { key: 'ru', name: 'Русский', shortName: 'ru', flag: 'ru' },
  { key: 'en', name: 'English', shortName: 'en', flag: 'us' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  className = '', 
  variant = 'desktop' 
}) => {
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'ru';
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const selectedLanguage = languages.find(language => language.key === locale) || languages[0];

  // Функция для создания ссылки с сохранением текущего пути
  const createLocalizedPath = (newLocale: string) => {
    const pathWithoutLocale = pathname?.replace(`/${locale}`, '') || '/';
    return `/${newLocale}${pathWithoutLocale}`;
  };

  // Обработчик клика вне селектора
  const LANGUAGE_SELECTOR_ID = 'language-selector';
  useEffect(() => {
    const handleWindowClick = (event: Event) => {
      const target = event.target as Element;
      if (target && target.closest('button')?.id === LANGUAGE_SELECTOR_ID) {
        return;
      }
      setIsOpen(false);
    };
    window.addEventListener('click', handleWindowClick);
    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  if (variant === 'mobile') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-[14px] md:text-[16px] lg:text-[22px] font-medium transition-colors duration-200 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-sans"
          id={LANGUAGE_SELECTOR_ID}
          aria-expanded={isOpen}
      >
        {selectedLanguage.shortName}
      </button>

        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white dark:bg-dark-bg z-[4000] overflow-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby={LANGUAGE_SELECTOR_ID}
          >
            <div className="py-1" role="none">
              {languages.map((language) => (
                <Link
                  key={language.key}
                  href={createLocalizedPath(language.key)}
                  onClick={() => setIsOpen(false)}
                  className={`${
                    selectedLanguage.key === language.key
                      ? "text-light-text dark:text-dark-text font-semibold"
                      : "text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text"
                  } flex px-4 py-2 text-[14px] md:text-[16px] lg:text-[18px] items-center justify-center transition-colors duration-150 w-full font-sans`}
                  role="menuitem"
                >
                  <span className="truncate">{language.shortName}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-[1.1vw] font-medium transition-colors duration-200 bg-white dark:bg-dark-bg text-light-text dark:text-dark-text font-sans"
        id={LANGUAGE_SELECTOR_ID}
        aria-expanded={isOpen}
      >
        {selectedLanguage.shortName}
      </button>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-32 rounded-lg shadow-lg bg-white dark:bg-dark-bg z-[4000] overflow-hidden"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby={LANGUAGE_SELECTOR_ID}
        >
          <div className="py-1" role="none">
            {languages.map((language) => (
              <Link
                key={language.key}
                href={createLocalizedPath(language.key)}
                onClick={() => setIsOpen(false)}
                className={`${
                  selectedLanguage.key === language.key
                    ? "text-light-text dark:text-dark-text font-semibold"
                    : "text-gray-500 dark:text-gray-400 hover:text-light-text dark:hover:text-dark-text"
                } flex px-4 py-2 text-[1vw] items-center justify-center transition-colors duration-150 w-full font-sans`}
                role="menuitem"
              >
                <span className="truncate">{language.shortName}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
