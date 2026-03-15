import Link from "next/link";

import { getTranslations } from "next-intl/server";

import { TextVariant } from "@/shared/ui";
import LanguageSwitcher from "@/shared/ui/locale/LanguageSwitcher";
import ThemeSwitcher from "@/shared/ui/theme-switcher/ThemeSwitcher";

const Footer = async () => {
  const footerT = await getTranslations("footer");
  const navT = await getTranslations("navigation");

  return (
    <footer className="w-full bg-white dark:bg-dark-bg">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main footer content */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Product */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              {footerT("product")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#features"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={navT("features")} />
                </Link>
              </li>
              <li>
                <Link
                  href="#about"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={navT("about")} />
                </Link>
              </li>
              <li>
                <Link
                  href="#reviews"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={navT("reviews")} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              {footerT("company")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="https://www.linkedin.com/company/108155469/admin/posted-jobs/open/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={footerT("careers")} />
                </Link>
              </li>
              <li>
                <Link
                  href="/ambassadors"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={footerT("partnershipProgram")} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              {footerT("legal")}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/privacy.html"
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={footerT("privacyPolicy")} />
                </Link>
              </li>
              <li>
                <Link
                  href="/eula.html"
                  target="_blank"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  <TextVariant variant="body" text={footerT("licenseAgreement")} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="col-span-1">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
              {footerT("connect")}
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
              <TextVariant variant="body" text={footerT("allRightsReserved")} />
            </div>

            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
