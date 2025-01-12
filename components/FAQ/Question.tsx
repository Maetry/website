"use client"
import React, { useRef, useState, useEffect } from "react"
import Image from "next/image"

import closeButton from "@/public/images/closeImage.svg"
import TextFabric from "../TextFabric"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { toggleShowQuestion } from "@/redux/Slices/QuestionSlice"
import { setQuestion } from "@/redux/Slices/QuestionSlice"

interface QuestionProps {
  id: number
  title: string
  answer: string
}

const Question = ({ id, title, answer }: QuestionProps) => {
  const show = useAppSelector((state) => state.questionSlice.show)
  const question = useAppSelector((state) => state.questionSlice.question)
  const dispatch = useAppDispatch()
  const contentRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState(0)

  useEffect(() => {
    if (show && question === id.toString()) {
      setMaxHeight(contentRef.current?.scrollHeight || 0)
    } else {
      setMaxHeight(0)
    }
  }, [show, question, id])

  function chooseQuestion(id: string) {
    if (!show || question !== id) {
      dispatch(setQuestion(id))
      if (!show) {
        dispatch(toggleShowQuestion())
      }
    } else {
      dispatch(toggleShowQuestion())
    }
  }

  return (
    <div className="w-full border dark:border-dark-text/10 rounded-[20px] flex p-7">
      <div className="flex-1 flex flex-col">
        <div>
          <button
            onClick={() => chooseQuestion(id.toString())}
            className="h-full w-full flex text-start justify-between items-center"
          >
            <div className="w-[85%] xl:w-full">
              <TextFabric id={4} text={title}></TextFabric>
            </div>

            <Image
              src={closeButton}
              alt=""
              className={`min-w-[7vw] xl:w-[40px] xl:h-[40px] ${
                show && question === id.toString() ? "rotate-0" : "rotate-45"
              } transition-transform duration-200 dark:invert`}
            />
          </button>
        </div>

        <div
          ref={contentRef}
          className={`overflow-hidden transition-all w-[90%] duration-300 ease-in-out ${
            show && question === id.toString()
              ? "translate-y-0 mt-[2vh]"
              : "-translate-y-4"
          }`}
          style={{
            maxHeight: `${maxHeight}px`
          }}
        >
          <TextFabric id={2} text={answer} />
        </div>
      </div>
    </div>
  )
}

export default Question
