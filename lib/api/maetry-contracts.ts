import type {
  Address,
  BillingCatalogCadence,
  BillingCatalogPlan,
  BillingCatalogPlanCode,
  BillingCatalogResponse,
  BillingPlanAvailability,
  BillingPlanCode,
  BillingPlanInterval,
  BillingPortalSession,
  BillingSeatTier,
  BillingSubscriptionInstructionsRequest,
  BillingSubscriptionInstructionsResponse,
  BillingSummary as SharedBillingSummary,
  ClickParametersMagicLink,
  ClickResponsesMagicLink,
  ComplexHelpersComplexResponse,
  ComplexHelpersProcedureResponse,
  MagicLinkKind,
  MagicLinkPayload,
  Price,
  ProcedureHelpersProcedureResponse,
  PublicBookingParametersCreate,
  SafeDateInterval,
  SalonResponsesCatalog,
  SalonResponsesMaster,
  SalonResponsesProfile,
  TimetableParametersSearchSlotComplex,
  TimetableParametersSearchSlotProcedure,
  TimetableResponsesComplexSlots,
  TimetableResponsesComplexSlotsSlot,
  TimetableResponsesComplexSlotsSlotProcedure,
  TimetableResponsesProcedureSlots,
  VisitResponsesFull,
} from "@maetry/shared-dtos";

export type PublicLinkKind = MagicLinkKind;
export type PublicClickPayload = MagicLinkPayload;
export type PublicClickResponse = ClickResponsesMagicLink;
export type PublicClickMetadata = ClickParametersMagicLink & {
  userAgent?: string;
};

export type PublicPrice = Price;
export type PublicAddress = Address;
export type PublicSalonProfile = SalonResponsesProfile;
export type PublicSalonMaster = SalonResponsesMaster;
export type PublicSalonCatalogProcedure = ProcedureHelpersProcedureResponse;
export type PublicSalonCatalogComplexProcedure = ComplexHelpersProcedureResponse;
export type PublicSalonCatalogComplex = ComplexHelpersComplexResponse;
export type PublicSalonCatalog = SalonResponsesCatalog;
export type PublicDateInterval = SafeDateInterval;
export type PublicProcedureSlotsResponse = TimetableResponsesProcedureSlots;
export type PublicComplexSlotProcedure = TimetableResponsesComplexSlotsSlotProcedure;
export type PublicComplexSlot = TimetableResponsesComplexSlotsSlot;
export type PublicComplexSlotsResponse = TimetableResponsesComplexSlots;
export type PublicSearchProcedureBody = TimetableParametersSearchSlotProcedure;
export type PublicSearchComplexBody = TimetableParametersSearchSlotComplex;
export type PublicSearchSlotsResponse =
  | PublicProcedureSlotsResponse
  | PublicComplexSlotsResponse;
export type PublicBookingCreatePayload = PublicBookingParametersCreate;
export type SharedPublicBookingVisit = VisitResponsesFull;

export type BillingCatalog = BillingCatalogResponse;
export type BillingCatalogPlanItem = BillingCatalogPlan;
export type BillingCatalogCadenceOffer = BillingCatalogCadence;
export type BillingCatalogPlanCodeValue = BillingCatalogPlanCode;
export type BillingPlanCodeValue = BillingPlanCode;
export type BillingPlanAvailabilityValue = BillingPlanAvailability;
export type BillingPlanIntervalValue = BillingPlanInterval;
export type BillingPortalSessionResponse = BillingPortalSession;
export type BillingSubscriptionInstructionsPayload =
  BillingSubscriptionInstructionsRequest;
export type BillingSubscriptionInstructionsResult =
  BillingSubscriptionInstructionsResponse;
export type BillingSummary = SharedBillingSummary;
export type BillingTier = BillingSeatTier;
export type BillingPrice = Price;
