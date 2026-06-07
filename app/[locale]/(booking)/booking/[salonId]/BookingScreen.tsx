"use client";

import { useTranslations } from "next-intl";
import { Paragraph, Text, XStack, YStack } from "tamagui";

import { getBookingSurfaceStyle } from "@/src/features/booking/bookingSurface";
import type { BookingPlatformVariant } from "@/src/features/booking/utils/platform";

import { BookingSection } from "../../_shared/BookingSection";
import {
  SheetRoot,
  bookingSectionHeaderPaddingX,
} from "../../_shared/primitives";

import { DetailsStep } from "./DetailsStep";
import { SalonHeader, SalonHeaderSkeleton } from "./SalonHeader";
import { ServiceSelectionsStep } from "./ServiceSelectionsStep";
import { TimeStep } from "./TimeStep";
import { useBookingFlow } from "./useBookingFlow";

type BookingScreenProps = {
  salonId: string;
  locale: string;
  trackingId?: string | null;
};

function SummaryTotalRow({
  label,
  platform,
  price,
}: {
  label: string;
  platform: BookingPlatformVariant;
  price: string;
}) {
  const surface = getBookingSurfaceStyle(platform);

  return (
    <XStack
      alignItems="center"
      justifyContent="space-between"
      paddingHorizontal={bookingSectionHeaderPaddingX(platform)}
      paddingVertical={surface.summary.rowPaddingVertical}
    >
      <Text
        color="$textPrimary"
        fontSize={surface.summary.totalFontSize}
        fontWeight="600"
        lineHeight={surface.summary.totalLineHeight}
      >
        {label}
      </Text>
      <Text
        color="$textPrimary"
        fontSize={surface.summary.totalFontSize}
        fontWeight="500"
        lineHeight={surface.summary.totalLineHeight}
      >
        {price}
      </Text>
    </XStack>
  );
}

const BookingScreen = ({ salonId, locale, trackingId }: BookingScreenProps) => {
  const flow = useBookingFlow({ salonId, locale, trackingId });
  const t = useTranslations("booking");
  const surface = getBookingSurfaceStyle(flow.platform);

  return (
    <SheetRoot platform={flow.platform}>
      <YStack
        alignSelf="center"
        gap="$4"
        maxWidth={560}
        style={{
          paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        }}
        width="100%"
      >
        {flow.proceduresLoading ? (
          <SalonHeaderSkeleton platform={flow.platform} />
        ) : (
          <SalonHeader
            mapAddressUrl={flow.mapAddressUrl}
            platform={flow.platform}
            salonAddress={flow.salonAddress}
            salonName={flow.salonName}
            salonProfile={flow.salonProfile}
          />
        )}

        <ServiceSelectionsStep
          canAddAnotherService={flow.canAddAnotherService}
          currentVisualStep={flow.currentVisualStep}
          locale={flow.locale}
          onAddService={flow.addServiceSection}
          onRequestSectionAction={flow.handleSectionActionRequest}
          onSectionDelete={flow.handleSectionDelete}
          onSectionEditConfirm={flow.handleSectionEditConfirm}
          onSelectBundleProcedureMaster={
            flow.handleSectionSelectBundleProcedureMaster
          }
          onSelectGroup={flow.handleSectionSelectGroup}
          onSelectProcedure={flow.handleSectionSelectProcedure}
          onToggleBundleProcedurePicker={flow.handleToggleBundleProcedurePicker}
          onToggleDescription={flow.handleToggleSectionDescription}
          platform={flow.platform}
          procedureGroups={flow.procedureGroups}
          proceduresError={flow.proceduresError}
          proceduresLoading={flow.proceduresLoading}
          sections={flow.sections}
        />

        {flow.isReadyForTimeSelection ? (
          <TimeStep
            currentVisualStep={flow.currentVisualStep}
            onDeselectSlot={() => flow.setSelectedSlot(null)}
            onRetrySlots={() => void flow.refetchSlots()}
            onSelectDate={flow.setSelectedDateKey}
            onSelectSlot={(slot) => flow.setSelectedSlot(slot)}
            platform={flow.platform}
            selectedDateKey={flow.selectedDateKey}
            selectedProcedure={flow.selectedProcedure}
            selectedSlot={flow.selectedSlot}
            selectedSlotDurationSubtitle={flow.selectedSlotDurationSubtitle}
            selectedSlotSummaryTitle={flow.selectedSlotSummaryTitle}
            slotCalendarDays={flow.slotCalendarDays}
            slotMonthTitle={flow.slotMonthTitle}
            slotPeriods={flow.slotPeriods}
            slotsError={flow.slotsError}
            slotsLoading={flow.slotsLoading}
          />
        ) : null}

        {flow.selectedSlot && flow.selectedProcedurePrice ? (
          <BookingSection
            footer={
              <Paragraph
                color="$textSecondary"
                fontSize={surface.summary.footerFontSize}
                lineHeight={surface.summary.footerLineHeight}
                size="$3"
              >
                {t("summaryTotalFooter")}
              </Paragraph>
            }
            platform={flow.platform}
            title={t("summaryTotalTitle")}
          >
            <SummaryTotalRow
              label={`${t("paywall.estimatedTotal")}:`}
              platform={flow.platform}
              price={flow.selectedProcedurePrice}
            />
          </BookingSection>
        ) : null}

        {flow.selectedSlot ? (
          <DetailsStep
            clientName={flow.clientName}
            clientPhone={flow.clientPhone}
            formErrors={flow.formErrors}
            globalError={flow.globalError}
            isFormValid={flow.isFormValid}
            isSubmitting={flow.isSubmitting}
            onSubmit={flow.handleSubmitAppointment}
            platform={flow.platform}
            submitErrorNonce={flow.submitErrorNonce}
            setClientName={flow.setClientName}
            setClientPhone={flow.setClientPhone}
            setFormErrors={flow.setFormErrors}
          />
        ) : null}

        <style jsx global>{`
          .booking-calendar-scroll::-webkit-scrollbar {
            display: none;
            height: 0;
            width: 0;
          }
        `}</style>
      </YStack>
    </SheetRoot>
  );
};

export default BookingScreen;
