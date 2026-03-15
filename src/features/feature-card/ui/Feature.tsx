"use client";
import React from "react";

import Image from "next/image";

import { useAppSelector } from "@/lib/hooks";
import notice from "@/public/images/notice.svg";
import online from "@/public/images/online.svg";
import schedule from "@/public/images/schedule.svg";
import { TextVariant } from "@/shared/ui";
// Стили подключены глобально в globals.css

interface FeatureTextProps {
  variant: "management" | "notifications" | "onlineBooking";
  title: string;
  description: string;
}
interface ImageFetureProps {
  variant: "management" | "notifications" | "onlineBooking";
}

const ImageFeature = ({ variant }: ImageFetureProps) => {
  switch (variant) {
    case "management":
      return (
        <Image
          src={schedule}
          alt={""}
          width={48}
          height={48}
          className="w-[10vw] xl:w-[4vw]"
        />
      );
    case "notifications":
      return (
        <Image
          src={notice}
          alt={""}
          width={48}
          height={48}
          className="w-[10vw] xl:w-[4vw]"
        />
      );
    case "onlineBooking":
      return (
        <Image
          src={online}
          alt={""}
          width={48}
          height={48}
          className="w-[10vw] xl:w-[4vw]"
        />
      );
  }
};

const Feature = ({ variant, title, description }: FeatureTextProps) => {
  const DarkTheme = useAppSelector((state) => state.theme.blackTheme);

  return (
    <div className="w-full xl:w-1/3 rounded-[26px] flex shadow-lg relative">
      <div className="w-full h-full absolute ">
        {DarkTheme ? (
          <div className="feature_gradient_dark"></div>
        ) : (
          <div className="feature_gradient"></div>
        )}
      </div>
      <div className="flex z-[1000] w-full h-full flex-col px-[2em] py-[2em]">
        <ImageFeature variant={variant}></ImageFeature>

        <div className="flex w-full flex-col gap-y-4 mt-[10%] xl:mt-[25%]">
          <TextVariant variant="featureTitle" text={title} />
          <TextVariant variant="body" text={description} />
        </div>
      </div>
    </div>
  );
};

export default Feature;
