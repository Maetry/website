import React from "react"

import Link from "next/link"

import { TextFabric } from "@/shared/ui"
import styles from "@/styles/components.css"

const NotFound = () => {
  return (
    <div className="h-[70vh] xl:h-[90vh] w-full flex flex-col gap-y-[2vh] items-center justify-center text-[20vw]">
      <p className={styles.gradient__text}>404</p>

      <div className="w-[80%] justify-center items-center flex flex-col xl:flex-row gap-[0.15em]">
        <Link
          href={"/"}
          className="border w-full xl:w-[20vw] py-[2.5vh] rounded-[21px] flex items-center justify-center hover:scale-105 transition-all"
        >
          <TextFabric id={2} text={"go to the main page"}></TextFabric>
        </Link>
      </div>
    </div>
  )
}

export default NotFound
