"use client";

import { Suspense } from "react";

import Image from "next/image";
import Link from "next/link";

import logo from "@/public/images/logo.svg";
import phones from "@/public/images/phones_customer.png";
import { TextFabric, ThemeSwitcher, InviteButton, AppleButton } from "@/shared/ui";

const EmployeeInvitePage = () => {
  return (
    <div>
      <header
        id="logo"
        className="fixed z-[3000] flex h-[7vh] w-full items-center justify-between bg-white px-[3.5%] dark:bg-dark-bg"
      >
        <Link href="/">
          <Image
            src={logo}
            alt="logo"
            className="w-[20vw] dark:invert xl:w-[7vw]"
          />
        </Link>
        <ThemeSwitcher />
      </header>
      <main className="flex h-[100vh] flex-col items-center px-[7%] pt-[7vh] xl:flex-row">
        <div className="flex h-full flex-col justify-between gap-y-[6vh] py-[13%] xl:w-1/2">
          <div className="flex w-full flex-col gap-2 text-center xl:text-start">
            <TextFabric
              text="you have been invited to join the salon as a master"
              id={1}
            />
            <TextFabric
              text="*manage online recording, expand your client base"
              id={2}
            />
          </div>

          <div className="relative flex w-[80%] items-center justify-center xl:hidden">
            <Image
              alt="phones"
              src={phones}
              width={419}
              height={389}
              sizes="(max-width: 1279px) 80vw, 419px"
            />
          </div>

          <div className="flex flex-col items-center gap-2 pb-[5vh] text-center xl:items-start xl:text-start xl:pb-0">
            <TextFabric
              text="To continue, download the application and follow the link again"
              id={2}
            />

            <div className="mt-[5vh] xl:mt-[1vh]">
              <Suspense fallback={<div>Loading...</div>}>
                <InviteButton />
              </Suspense>
            </div>

            <div className="mt-[1vh]">
              <AppleButton />
            </div>
          </div>
        </div>

        <div className="relative hidden w-[80%] items-center justify-center xl:flex xl:h-full xl:w-1/2">
          <div className="w-[90%]">
            <Image
              alt="phones"
              src={phones}
              width={419}
              height={389}
              sizes="419px"
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeInvitePage;

