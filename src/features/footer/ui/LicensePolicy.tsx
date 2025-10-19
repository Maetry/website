"use client"
import React, { useEffect } from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"

// import { setLicense } from "@/entities/license" // Удалено - entity больше не существует
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import closebutton from "@/public/images/closeImage.svg"
import { TextFabric } from "@/shared/ui"


const LicensePolicy = () => {
  const dispatch = useAppDispatch()
  const showLicense = false // Заглушка - entity больше не существует
  const router = useRouter()

  useEffect(() => {
    if (showLicense) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [showLicense])

  function closePop() {
    // dispatch(setLicense(false)) // Удалено - entity больше не существует
    router.push("/")
  }
  return (
    <>
      {showLicense && (
        <div className="fixed w-full h-full bg-black/40 bottom-0 left-0 z-[4000] flex items-center justify-center dark:text-black">
          <div className="w-[95%] bg-white rounded-[25px] p-[7%] xl:p-[2%] max-h-[90vh] overflow-y-auto flex flex-col gap-y-4 relative">
            <div className="w-[90%] xl:w-full items-center flex relative">
              <TextFabric
                id={6}
                text={`Maetry Mobile Application End-User License Agreement (EULA)
`}
              ></TextFabric>
              <button
                className="right-[6vw] xl:right-[5vw] z-[3001] fixed"
                onClick={() => closePop()}
              >
                <Image
                  src={closebutton}
                  alt={""}
                  className="xl:w-[2.5vw]"
                ></Image>
              </button>
            </div>

            <div className="flex flex-col gap-y-4 w-[96%] text-[4vw] mt-[2vh] xl:text-[1.167vw] font-light ">
              <p>
                This End-User License Agreement (&quot;Agreement&quot;) governs
                your use of the Maetry mobile application
                (&quot;Application&quot;). By downloading, installing, or using
                the Application, you agree to be bound by the terms of this
                Agreement.
              </p>
              <p>
                License Grant Maetry grants you a revocable, non-exclusive,
                non-transferable, limited license to download, install, and use
                the Application. The Application is available for personal and
                commercial use by clients and service providers, respectively,
                strictly in accordance with the terms of this Agreement.
              </p>
              <p>
                Restrictions <br />- You may not modify, copy, or create
                derivative works based on the Application. <br />- You may not
                reverse engineer, disassemble, or attempt to derive the source
                code of the Application. <br /> - You may not rent, lease, lend,
                sell, redistribute, or sublicense the Application.
              </p>
              <p>
                Content and Services <br /> - The Application provides a
                platform for connecting clients with service providers and for
                service providers to manage their bookings and analytics. <br />
                - Maetry is not responsible for the quality of services
                provided by service providers.
              </p>
              <p>
                User Contributions <br /> - Users are responsible for the
                accuracy of the information they provide on the Application.
                <br />- Maetry is not responsible for any user-generated
                content, including but not limited to reviews and service
                descriptions.
              </p>
              <p>
                Termination <br /> This Agreement is effective until terminated
                by you or Maetry. Maetry may terminate this Agreement at any
                time without notice if you fail to comply with any of its terms.
              </p>
              <p>
                Disclaimer of Warranties <br />
                The Application is provided &quot;as is&quot; and &quot;as
                available&quot; without any warranties of any kind. Maetry
                disclaims all warranties, either express or implied, including
                but not limited to warranties of merchantability, fitness for a
                particular purpose, and non-infringement.
              </p>
              <p>
                Limitation of Liability <br />
                To the extent not prohibited by law, in no event shall Maetry
                be liable for personal injury or any incidental, special,
                indirect, or consequential damages whatsoever arising out of or
                related to your use of the Application.
              </p>
              <p>
                Governing Law This Agreement shall be governed by the laws of
                the jurisdiction in which you reside.
              </p>
              <p>
                Contact Information If you have any questions about this
                Agreement, please contact us at support@maetry.com
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default LicensePolicy
