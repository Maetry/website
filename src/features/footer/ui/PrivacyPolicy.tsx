"use client"
import React, { useEffect } from "react"

import Image from "next/image"
import { useRouter } from "next/navigation"

// import { setPrivacy } from "@/entities/privacy" // Удалено - entity больше не существует
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import closebutton from "@/public/images/closeImage.svg"
import { TextFabric } from "@/shared/ui"


const PrivacyPolicy = () => {
  const dispatch = useAppDispatch()
  const showPrivacy = false // Заглушка - entity больше не существует
  const router = useRouter()
  useEffect(() => {
    if (showPrivacy) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [showPrivacy])

  function closePop() {
    // dispatch(setPrivacy(false)) // Удалено - entity больше не существует
    router.push("/")
  }

  return (
    <>
      {showPrivacy && (
        <div className="fixed w-full h-full bg-black/40 bottom-0 left-0 z-[4000] flex items-center justify-center dark:text-black">
          <div className="w-[95%] bg-white rounded-[25px] p-[7%] xl:p-[2%] max-h-[90vh] overflow-y-auto flex flex-col gap-y-4 relative">
            <div className=" items-center flex relative">
              <TextFabric
                id={6}
                text={`Privacy Policy for Maetry`}
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
            <div className="flex flex-col gap-y-4 w-[90%] text-[4vw] xl:text-[1.167vw] font-light ">
              <p>
                Welcome to Maetry! We are committed to protecting the privacy
                and security of our users. This Privacy Policy outlines how we
                collect, use, disclose, and safeguard your information when you
                use our mobile application.
              </p>
              <p>
                Data Collection <br></br> - Personal Information: We collect
                your nickname and photo to create your user profile. These serve
                as pseudonyms and may not match your real names or photographs.
                <br></br> - Contact Information: Depending on your user type
                (client or service provider), we collect contact information to
                facilitate communication. <br></br> - Usage Data: We gather data
                about your interactions with the app to improve and personalize
                your experience. <br></br> - Geolocation Data: We display your
                geoposition for convenience in finding nearby salons but do not
                store precise geolocation data on our servers. The geodata is
                processed on your device and fully complies with the privacy
                policies of the geolocation service provider. <br></br> -
                Payment Information: We do not store payment data. All
                subscription payments are processed through Apple&apos;s payment
                system, and all payment information is stored by them.
              </p>
              <p>
                Use of Data <br /> - To connect service providers and clients.
                <br /> - To provide app functionality, including managing
                appointments and discovering new salons. <br />- To conduct
                analytics and performance monitoring.
              </p>
              <p>
                Data Sharing <br />- Your contact information is shared with
                other app users as necessary to facilitate service provision.
                <br /> - We do not sell, trade, or otherwise transfer your
                personally identifiable information to outside parties, except
                as described in this policy.
              </p>
              <p>
                Data Storage <br /> - All data is securely stored on Google
                Cloud Platform servers and protected by their security systems.
              </p>
              <p>
                User Responsibility <br /> - Users are responsible for the
                quality of services provided and received. Maetry is a platform
                for connecting users and does not bear responsibility for the
                services rendered.
              </p>
              <p>
                Data Retention and Deletion <br />- Users can delete their
                account at any time, and their data will be anonymized. Records
                created by users (e.g., salon appointments) will be retained to
                ensure the functionality for other users. <br />- Data will be
                stored until deemed unnecessary by Maetry Hub LLC and will be
                deleted at the company&apos;s discretion.
              </p>
              <p>
                Policy Regarding Children <br /> - This service is not intended
                for children. Parents may use the service to book appointments
                for their children.
              </p>
              <p>
                External Links <br />- This app contains links to external sites
                and services. Maetry LLC is not responsible for the privacy
                practices of these external sites.
              </p>
              <p>
                Contact Information <br />- For any questions or complaints,
                please contact us at support@maetry.com
              </p>
              <p>
                Consent and Agreement <br />- Continued use of the app and
                services implies acceptance of this Privacy Policy and the
                License Agreement.
              </p>
              <p>
                Changes to Privacy Policy We reserve the right to modify this
                policy at any time. We will notify you of any changes by
                updating the policy on our app.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default PrivacyPolicy
