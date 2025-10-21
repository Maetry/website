import React from "react"

import Link from "next/link"

import { LocalizedText } from "@/shared/ui"
import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher"
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher"

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              <span className="font-bold">
                <LocalizedText translationKey="footer.product" id={2} fallback="Product" />
              </span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText translationKey="navigation.features" id={2} fallback="Features" />
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText translationKey="navigation.about" id={2} fallback="About" />
                </Link>
              </li>
              <li>
                <Link
                  href="#reviews"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText translationKey="navigation.reviews" id={2} fallback="Reviews" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              <LocalizedText translationKey="footer.company" id={2} fallback="Company" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://www.linkedin.com/company/108155469/admin/posted-jobs/open/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText translationKey="footer.careers" id={2} fallback="Careers" />
                </Link>
              </li>
              <li>
                <Link
                  href="/ambassadors"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText translationKey="footer.partnershipProgram" id={2} fallback="Partnership Program" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              <LocalizedText translationKey="footer.legal" id={2} fallback="Legal" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/privacy.html" 
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText 
                    translationKey="footer.privacyPolicy" 
                    id={2} 
                    fallback="Privacy Policy" 
                  />
                </Link>
              </li>
              <li>
                <Link 
                  href="/eula.html" 
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <LocalizedText 
                    translationKey="footer.licenseAgreement" 
                    id={2} 
                    fallback="License Agreement" 
                  />
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              <LocalizedText translationKey="footer.connect" id={2} fallback="Connect" />
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://t.me/maetry_app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Telegram
                </Link>
              </li>
              <li>
                <Link
                  href="https://instagram.com/maetry.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Instagram
                </Link>
              </li>
              <li>
                <Link
                  href="mailto:support@maetry.com"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  support@maetry.com
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              <LocalizedText translationKey="footer.allRightsReserved" id={2} fallback="© 2025 Maetry LLC. All rights reserved." />
            </div>
            
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
