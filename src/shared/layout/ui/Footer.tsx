import { getLocale, getTranslations } from "next-intl/server";

import { MarketingFooter } from "@/shared/chakra/marketing";

const Footer = async () => {
  const footerT = await getTranslations("footer");
  const navT = await getTranslations("navigation");
  const locale = await getLocale();

  return (
    <MarketingFooter
      mode="site"
      locale={locale}
      productTitle={footerT("product")}
      companyTitle={footerT("company")}
      legalTitle={footerT("legal")}
      connectTitle={footerT("connect")}
      productLinks={[
        { href: "#features", label: navT("features") },
        { href: "#about", label: navT("about") },
        { href: "#reviews", label: navT("reviews") },
      ]}
      companyLinks={[
        {
          href: "https://www.linkedin.com/company/108155469/admin/posted-jobs/open/",
          label: footerT("careers"),
        },
        { href: `/${locale}/affiliate`, label: footerT("partnershipProgram") },
      ]}
      legalLinks={[
        { href: "/privacy.html", label: footerT("privacyPolicy"), newTab: true },
        { href: "/eula.html", label: footerT("licenseAgreement"), newTab: true },
      ]}
      connectLinks={[
        { href: "https://t.me/maetry_app", label: "Telegram" },
        { href: "https://instagram.com/maetry.co", label: "Instagram" },
        { href: "mailto:support@maetry.com", label: "support@maetry.com" },
      ]}
      allRightsReserved={footerT("allRightsReserved")}
    />
  );
};

export default Footer;
