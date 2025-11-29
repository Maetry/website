"use client";
import React from "react";

import Image from "next/image";

import appstore from "@/public/images/appstore.svg";

const APP_STORE_BASE_URL = "https://apps.apple.com/app/id6746678571";

// Формирует URL App Store с фиксированными UTM параметрами для главного экрана
function buildAppStoreUrl(): string {
  const url = new URL(APP_STORE_BASE_URL);

  // Фиксированные UTM метки для главного экрана
  url.searchParams.set("utm_source", "website");
  url.searchParams.set("utm_medium", "landing");
  url.searchParams.set("utm_campaign", "main_page");

  const finalUrl = url.toString();

  // Логируем для отладки
  if (typeof window !== "undefined") {
    console.log("App Store URL with UTM:", finalUrl);
  }

  return finalUrl;
}

const AppleButton = () => {
  const appStoreUrl = buildAppStoreUrl();

  return (
    <a
      href={appStoreUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block active:scale-105 xl:hover:scale-105 transition-all"
    >
      <Image
        src={appstore}
        alt="Download on the App Store"
        className="h-[50px]"
      ></Image>
    </a>
  );
};

export default AppleButton;
