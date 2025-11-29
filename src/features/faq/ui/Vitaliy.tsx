"use client";

import React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Vitalik from "@/public/images/Vitalik.png";
import VitaliyBG from "@/public/images/vitaliyBG.svg";
import { LocalizedText } from "@/shared/ui";

const Vitaliy = () => {
  const router = useRouter();
  return (
    <>
      <div className="w-full p-7 z-[1000] flex flex-col gap-y-4">
        <LocalizedText
          id={2}
          translationKey="vitaliy.question"
          fallback="Any question?"
        />
        <div className="flex items-center gap-x-3">
          <div className="w-[17vw] xl:w-[6vw]">
            <Image
              src={Vitalik}
              alt={""}
              width={76}
              height={76}
              quality={100}
            ></Image>
          </div>

          <div className="flex flex-col ">
            <LocalizedText
              id={4}
              translationKey="vitaliy.supportTeam"
              fallback="Support team"
            />
            <LocalizedText
              id={2}
              translationKey="vitaliy.company"
              fallback="Maetry"
            />
          </div>
        </div>
        <button
          onClick={() => router.push("https://t.me/maetry_app")}
          className="p-[5%] bg-white dark:active:bg-lightText/40 active:bg-dark-bg/10 transition-all duration-100 dark:bg-dark-bg rounded-[15px] min-h-[45px] flex w-full items-center mt-[2%] justify-center"
        >
          <LocalizedText
            id={5}
            translationKey="vitaliy.askQuestions"
            fallback="ask questions"
          />
        </button>
      </div>
      <Image
        src={VitaliyBG}
        fill
        style={{ objectFit: "cover" }}
        className="rounded-[20px] dark:opacity-25"
        alt={""}
      ></Image>
    </>
  );
};

export default Vitaliy;
