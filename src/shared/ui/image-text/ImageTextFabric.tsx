"use client";

import React from "react";

import { useAppSelector } from "@/lib/hooks";
import { LocalizedImage } from "@/shared/localization";

interface ImageTextFabricProps {
  id: number;
}

const ImageTextFabric = ({ id }: ImageTextFabricProps) => {
  const isDark = useAppSelector((state) => state.theme.blackTheme);

  switch (id) {
    case 1:
      return (
        <div className="flex flex-col items-center">
          <LocalizedImage
            baseImage={
              isDark
                ? "/images/dark1stBlockText.svg"
                : "/images/1stBlockText.svg"
            }
            alt=""
            width={790}
            height={134}
            className="w-[70vw] hidden xl:flex"
          />
          <LocalizedImage
            baseImage={
              isDark
                ? "/images/darkMobile1stBlockText.svg"
                : "/images/mobile1stBlockText.svg"
            }
            alt=""
            width={449}
            height={189}
            className="scale-135 md:scale-150 md:py-[10%] xl:hidden"
          />
        </div>
      );
    case 2:
      return (
        <div className="flex z-[1000]">
          <LocalizedImage
            baseImage={
              isDark
                ? "/images/4th_block_bg_text_dark.svg"
                : "/images/4th_block_bg_text_light.svg"
            }
            alt=""
            width={822}
            height={240}
            className="w-[70vw] hidden xl:flex"
          />
          <LocalizedImage
            baseImage={
              isDark ? "/images/mobileDark4.svg" : "/images/mobileLight4.svg"
            }
            alt=""
            width={269}
            height={150}
            className="w-[80vw] xl:hidden"
          />
        </div>
      );
  }
};

export default ImageTextFabric;
