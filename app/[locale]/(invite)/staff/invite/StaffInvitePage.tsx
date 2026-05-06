"use client";

import { useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { AppWindow, CheckCheck, Download, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, Button, Paragraph, Text, XStack, YStack } from "tamagui";

import {
  getCampaignByLink,
  getPublicSalonProfile,
} from "@/lib/api/public-booking";
import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import { APP_STORE_BUSINESS_URL } from "@/src/features/home-experience/model/content";
import { ClientAppUiProvider } from "@/src/shared/tamagui/ClientAppUiProvider";

const APP_STORE_URL = APP_STORE_BUSINESS_URL;

function copyTextFallback(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

async function copyCurrentLink() {
  const currentUrl = window.location.href;

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(currentUrl);
    return;
  }

  copyTextFallback(currentUrl);
}

const StaffInvitePage = () => {
  const t = useTranslations("invite");
  const params = useParams<{ linkId?: string }>();
  const surface = getBookingSurfaceStyle("ios");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [didCopyLink, setDidCopyLink] = useState(false);
  const [salonName, setSalonName] = useState<string | null>(null);
  const [salonLogo, setSalonLogo] = useState<string | null>(null);

  useEffect(() => {
    const rawLinkId = params?.linkId;
    const linkId = typeof rawLinkId === "string" ? rawLinkId.trim() : "";

    if (!linkId) {
      return;
    }

    const controller = new AbortController();

    const loadSalon = async () => {
      try {
        const campaign = await getCampaignByLink(linkId, {
          signal: controller.signal,
        });
        const campaignSalonId = campaign.salonId?.trim();

        if (!campaignSalonId || controller.signal.aborted) {
          return;
        }

        const profile = await getPublicSalonProfile(campaignSalonId, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setSalonName(profile.name?.trim() || null);
        setSalonLogo(profile.logo ?? null);
      } catch {
        // Invite branding is optional.
      }
    };

    void loadSalon();

    return () => {
      controller.abort();
    };
  }, [params]);

  const handleDownloadApp = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await copyCurrentLink();
      setDidCopyLink(true);
    } finally {
      window.location.assign(APP_STORE_URL);
    }
  };

  return (
    <ClientAppUiProvider>
      <YStack backgroundColor="$appBackground" flex={1}>
        <YStack
          alignSelf="center"
          flex={1}
          gap="$4"
          maxWidth={560}
          padding="$4"
          style={{
            paddingBottom: "calc(20px + env(safe-area-inset-bottom, 0px))",
          }}
          width="100%"
        >
          <YStack alignItems="center" flex={1} justifyContent="center" paddingVertical="$4">
            <YStack
              backgroundColor="$cardBackground"
              borderRadius={surface.visit.cardRadius}
              gap="$4"
              maxWidth={420}
              padding="$5"
              width="100%"
            >
              <YStack alignItems="center" gap="$3">
                <XStack
                  alignItems="center"
                  backgroundColor="$primarySoft"
                  borderRadius={999}
                  height={68}
                  justifyContent="center"
                  width={68}
                >
                  <Text color="$primary">
                    <Sparkles size={28} />
                  </Text>
                </XStack>
                <Text color="$textSecondary" fontSize="$3" fontWeight="700" textTransform="uppercase">
                  {t("badgeLabel.employeeInvite")}
                </Text>
                <Text color="$textPrimary" fontSize="$8" fontWeight="800" textAlign="center">
                  {t("heading.employeeInvite")}
                </Text>
                <Paragraph color="$textSecondary" fontSize="$4" maxWidth={320} textAlign="center">
                  {t("subheading.employeeInvite")}
                </Paragraph>
                {salonName ? (
                  <XStack
                    alignItems="center"
                    backgroundColor="$primarySoft"
                    borderRadius={999}
                    gap="$3"
                    paddingHorizontal="$4"
                    paddingVertical="$3"
                  >
                    <Avatar circular size={40}>
                      <Avatar.Image src={salonLogo ?? undefined} />
                      <Avatar.Fallback alignItems="center" backgroundColor="$cardBackground" justifyContent="center">
                        <Text color="$primary" fontSize="$4" fontWeight="700">
                          {salonName.charAt(0).toUpperCase()}
                        </Text>
                      </Avatar.Fallback>
                    </Avatar>
                    <YStack gap="$0.5">
                      <Text color="$textSecondary" fontSize="$2" fontWeight="700" textTransform="uppercase">
                        {t("invitedByLabel")}
                      </Text>
                      <Text color="$textPrimary" fontSize="$4" fontWeight="700">
                        {salonName}
                      </Text>
                    </YStack>
                  </XStack>
                ) : null}
              </YStack>

              <YStack
                backgroundColor="$primarySoft"
                borderRadius={24}
                gap="$3"
                padding="$4"
              >
                <XStack alignItems="flex-start" gap="$3">
                  <Text color="$primary">
                    <Download size={18} />
                  </Text>
                  <YStack flex={1} gap="$1.5">
                    <Text color="$textPrimary" fontSize="$5" fontWeight="700">
                      {t("downloadTitle")}
                    </Text>
                    <Paragraph color="$textSecondary" size="$3">
                      {t("downloadDescription")}
                    </Paragraph>
                  </YStack>
                </XStack>

                <XStack alignItems="flex-start" gap="$3">
                  <Text color="$primary">
                    <CheckCheck size={18} />
                  </Text>
                  <YStack flex={1} gap="$1.5">
                    <Text color="$textPrimary" fontSize="$4" fontWeight="700">
                      {t("copyLinkTitle")}
                    </Text>
                    <Paragraph color="$textSecondary" size="$3">
                      {didCopyLink
                        ? t("copyLinkSuccess")
                        : t("copyLinkDescription")}
                    </Paragraph>
                  </YStack>
                </XStack>
              </YStack>

              <Button
                alignItems="center"
                backgroundColor="$primary"
                borderRadius={999}
                disabled={isSubmitting}
                justifyContent="center"
                onPress={handleDownloadApp}
                paddingVertical="$4"
                pressStyle={{ opacity: 0.86 }}
              >
                <XStack alignItems="center" gap="$2">
                  <Text color="white">
                    <AppWindow size={18} />
                  </Text>
                  <Text color="white" fontSize="$5" fontWeight="700">
                    {t("appStoreButtonTitle")}
                  </Text>
                </XStack>
              </Button>

              <Paragraph color="$textSecondary" size="$2" textAlign="center">
                {didCopyLink ? t("copyLinkSuccess") : t("copyLinkDescription")}
              </Paragraph>
            </YStack>
          </YStack>
        </YStack>
      </YStack>
    </ClientAppUiProvider>
  );
};

export default StaffInvitePage;
