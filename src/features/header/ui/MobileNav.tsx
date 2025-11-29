import Image from "next/image";
import Link from "next/link";

import { closeHeader } from "@/entities/mobile-header";
import { useAppDispatch } from "@/lib/hooks";
import Instagram from "@/public/images/Instagram.svg";
import Mail from "@/public/images/Mail.svg";
import Telegram from "@/public/images/Telegram.svg";
import { LocalizedText } from "@/shared/ui";

import SignIn from "./SignIn";

export const MobileNav = () => {
  const dispatch = useAppDispatch();

  const handleAnchorClick = () => {
    dispatch(closeHeader());
  };

  return (
    <div className="flex flex-col items-center justify-center h-[95%] px-[5%]">
      <nav className="flex flex-col gap-y-4 items-center font-light  justify-center w-full h-full flex-1">
        <Link href={"#about"} onClick={handleAnchorClick}>
          <LocalizedText
            translationKey="navigation.about"
            id={2}
            fallback="about"
          />
        </Link>
        <Link href={"#reviews"} onClick={handleAnchorClick}>
          <LocalizedText
            translationKey="navigation.reviews"
            id={2}
            fallback="reviews"
          />
        </Link>
        <Link href={"#features"} onClick={handleAnchorClick}>
          <LocalizedText
            translationKey="navigation.features"
            id={2}
            fallback="features"
          />
        </Link>

        <div className="flex gap-x-4 mt-[10%]">
          <Link href="mailto:support@maetry.com">
            <Image
              src={Mail}
              alt={""}
              width={24}
              height={24}
              className="dark:invert"
            />
          </Link>
          <Link href={"https://t.me/maetry_app"}>
            <Image
              src={Telegram}
              alt={""}
              width={24}
              height={24}
              className="dark:invert"
            />
          </Link>
          <Link href={"https://instagram.com/maetry.co"} target="_blank">
            <Image
              src={Instagram}
              alt={""}
              width={24}
              height={24}
              className="dark:invert"
            />
          </Link>
        </div>
      </nav>
      <SignIn type="mobile"></SignIn>
    </div>
  );
};
