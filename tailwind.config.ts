import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      transitionProperty: {
        padding: "padding"
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"]
      },
      fontSize: {
        tiny: "0.625rem", // 10px
        xxs: "0.75rem", // 12px
        sm: "0.875rem", // 14px
        base: "1rem", // 16px
        lg: "1.125rem", // 18px
        xl: "1.25rem", // 20px
        "2xl": "1.5rem", // 24px
        "3xl": "1.875rem", // 30px
        "4xl": "2.25rem", // 36px
        "5xl": "3rem", // 48px
        "6xl": "3rem" // 70px
      },
      colors: {
        lightText: "#13131A",
        bg: "#fdfdfd",
        dark: { text: "#fdfdfd", bg: "#13131A", formbg: "#fdfdfd" }
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient-slow': 'gradient 16s ease infinite',
        'pulse-button': 'pulseButton 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-10px) scale(0.95)' },
          'to': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        pulseButton: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '50%': { transform: 'scale(1.02)', boxShadow: '0 0 0 8px rgba(59, 130, 246, 0)' },
        },
      },
    }
  },
  plugins: []
}
export default config
