"use client"
import { useEffect, useState } from "react"

import { setTheme } from "@/entities/theme"
import { useAppDispatch } from "@/lib/hooks"

const ThemeSwitcher: React.FC = () => {
  const dispatch = useAppDispatch()
  const [, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [currentTheme, setCurrentTheme] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const savedTheme = localStorage.getItem("Theme")
    if (savedTheme === "dark") {
      setCurrentTheme('dark')
      dispatch(setTheme(true))
      document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
      setCurrentTheme('light')
      dispatch(setTheme(false))
      document.documentElement.classList.remove("dark")
    } else {
      setCurrentTheme('system')
      // System theme - listen for changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const updateSystemTheme = () => {
        const prefersDark = mediaQuery.matches
        setSystemTheme(prefersDark ? 'dark' : 'light')
        dispatch(setTheme(prefersDark))
        if (prefersDark) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }
      
      updateSystemTheme()
      mediaQuery.addEventListener('change', updateSystemTheme)
      
      return () => mediaQuery.removeEventListener('change', updateSystemTheme)
    }
  }, [dispatch])

  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    if (typeof window === 'undefined') return
    
    setCurrentTheme(theme)
    
    if (theme === 'system') {
      localStorage.removeItem("Theme")
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const prefersDark = mediaQuery.matches
      setSystemTheme(prefersDark ? 'dark' : 'light')
      dispatch(setTheme(prefersDark))
      if (prefersDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    } else {
      localStorage.setItem("Theme", theme)
      const isDark = theme === 'dark'
      dispatch(setTheme(isDark))
      if (isDark) {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }

  return (
    <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
      {/* System Theme Button */}
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md transition-colors ${
          currentTheme === 'system'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="System"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 3H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h3l-1 1v1h12v-1l-1-1h3c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H4V5h16v11z"/>
        </svg>
      </button>

      {/* Light Theme Button */}
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md transition-colors ${
          currentTheme === 'light'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Light"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"/>
        </svg>
      </button>

      {/* Dark Theme Button */}
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md transition-colors ${
          currentTheme === 'dark'
            ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
        }`}
        title="Dark"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"/>
        </svg>
      </button>
    </div>
  )
}

export default ThemeSwitcher