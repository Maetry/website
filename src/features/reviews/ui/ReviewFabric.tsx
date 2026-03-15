import React from "react";

import Image from "next/image";

import first from "@/public/images/1.png";
import second from "@/public/images/2.png";
import third from "@/public/images/3.png";
import fourth from "@/public/images/4.png";
import { TextVariant } from "@/shared/ui";

interface ReviewDataProps {
  id: number;
  title: string;
  role: string;
  description: string;
}

interface PesronImageProps {
  id: number;
}

const PersonImage = ({ id }: PesronImageProps) => {
  switch (id) {
    case 1:
      return (
        <Image src={first} alt={"1st person"} width={256} height={256}></Image>
      );
    case 2:
      return (
        <Image src={second} alt={"2nd person"} width={256} height={256}></Image>
      );
    case 3:
      return (
        <Image src={third} alt={"3rd person"} width={256} height={256}></Image>
      );
    case 4:
      return (
        <Image src={fourth} alt={"4th person"} width={256} height={256}></Image>
      );
  }
};

const Review = ({
  id,
  title,
  role,
  description,
}: ReviewDataProps) => {
  return (
    <div className="w-full xl:w-1/4 p-6 border flex flex-col gap-y-6 rounded-[21px]">
      <div className="flex items-center max-h-[10vh] gap-x-2">
        <div className="flex items-center justify-center relative w-[15vw] h-[15vw] xl:max-w-[6vw] ">
          <PersonImage id={id} />
        </div>

        <div>
          <TextVariant variant="title" text={title} />
          <TextVariant variant="accent" text={role} />
        </div>
      </div>
      <TextVariant variant="body" text={description} />
    </div>
  );
};

export default Review;
