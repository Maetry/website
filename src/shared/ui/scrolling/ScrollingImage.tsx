"use client";

import React, { useRef, useEffect } from "react";

import { useAppSelector } from "@/lib/hooks";
import { LocalizedImage } from "@/shared/localization";

const ScrollingImage = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isDark = useAppSelector((state) => state.theme.blackTheme);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth < 1280 && ref.current) {
        // Проверка ширины экрана
        const scrollY = window.scrollY;
        const newWidth = 67 + scrollY / 100;
        ref.current.style.width = `${Math.min(newWidth, 80)}vw`;
      } else if (window.innerWidth >= 1280 && ref.current) {
        const scrollY = window.scrollY;
        const newWidth = 25 + scrollY / 100;
        ref.current.style.width = `${Math.min(newWidth, 35)}vw`;
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div ref={ref} className="absolute flex justify-between duration-100">
      <LocalizedImage
        baseImage={
          isDark
            ? "/images/phones_about_left_dark.svg"
            : "/images/phones_about_left_light.svg"
        }
        alt=""
        width={300}
        height={400}
        className="w-[25vw] scale-125 xl:scale-100 xl:w-[12vw]"
      />
      <LocalizedImage
        baseImage={
          isDark
            ? "/images/phones_about_right_dark.svg"
            : "/images/phones_about_right_light.svg"
        }
        alt=""
        width={300}
        height={400}
        className="w-[25vw] scale-125 xl:scale-100 xl:w-[12vw]"
      />
    </div>
  );
};

export default ScrollingImage;
