"use client";

import React from "react";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Vitalik from "@/public/images/Vitalik.png";
import VitaliyBG from "@/public/images/vitaliyBG.svg";
import { TextVariant } from "@/shared/ui";

interface VitaliyProps {
  question: string;
  supportTeam: string;
  company: string;
  askQuestions: string;
}

const Vitaliy = ({
  question,
  supportTeam,
  company,
  askQuestions,
}: VitaliyProps) => {
  const router = useRouter();
  return (
    <>
      <div className="w-full p-7 z-[1000] flex flex-col gap-y-4">
        <TextVariant variant="body" text={question} />
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
            <TextVariant variant="title" text={supportTeam} />
            <TextVariant variant="body" text={company} />
          </div>
        </div>
        <button
          onClick={() => router.push("https://t.me/maetry_app")}
          className="p-[5%] bg-white dark:active:bg-lightText/40 active:bg-dark-bg/10 transition-all duration-100 dark:bg-dark-bg rounded-[15px] min-h-[45px] flex w-full items-center mt-[2%] justify-center"
        >
          <TextVariant variant="accent" text={askQuestions} />
        </button>
      </div>
      <Image
        src={VitaliyBG}
        fill
        sizes="(max-width: 1280px) 100vw, 31vw"
        style={{ objectFit: "cover" }}
        className="rounded-[20px] dark:opacity-25"
        alt={""}
      ></Image>
    </>
  );
};

export default Vitaliy;
