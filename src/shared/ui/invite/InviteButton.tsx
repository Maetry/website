"use client"

import React, { useEffect, useState } from "react"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { LocalizedText } from "@/shared/ui"

const InviteButton = () => {
  const searchParams = useSearchParams()
  const id = searchParams?.get("id")
  const salonId = searchParams?.get("salonId")

  const [url, setUrl] = useState<string>("")

  useEffect(() => {
    if (id && salonId) {
      setUrl(`/clients/invite?id=${id}&salonId=${salonId}`)
    }
  }, [id, salonId])

  return (
    <Link
      href={url}
      className="w-[35vw] md:w-[25vw] xl:w-[15vw] bg-dark-bg dark:bg-white text-white rounded-[5px] py-[1.5vh] flex justify-center hover:scale-105 transition-all items-center"
    >
      <LocalizedText 
        translationKey="invite.followLink" 
        id={5} 
        fallback="Follow the link" 
      />
    </Link>
  )
}

export default InviteButton
