import Header from "./Header";
import type { HeaderProps } from "./Header";

/** Единая маркетинговая шапка: inline-навигация и компактный выбор языка в баре. */
export type MarketingPageHeaderProps = Omit<
  HeaderProps,
  "navStyle" | "showThemeSwitcher" | "showLocaleSwitcher"
>;

export default async function MarketingPageHeader(props: MarketingPageHeaderProps) {
  return (
    <Header
      {...props}
      navStyle="inline"
      showThemeSwitcher={false}
      showLocaleSwitcher
    />
  );
}
