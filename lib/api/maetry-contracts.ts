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
  BillingSession,
  BillingSessionContext,
  BillingSeatTier,
  BillingSummary as SharedBillingSummary,
  BundlesHelpersBundleResponse,
  BundlesHelpersProcedureResponse,
  ClickParametersMagicLink,
  ClickResponsesMagicLink,
  MagicLinkKind,
  MagicLinkPayload,
  Price,
  ProcedureHelpersCatalogProcedureResponse,
  ProcedureHelpersProcedureResponse,
  PublicBookingParametersCreate,
  SafeDateInterval,
  SalonResponsesCatalog,
  SalonResponsesMaster,
  SalonResponsesProfile,
  TimetableParametersSearchSlotSelectedService,
  TimetableResponsesBundleSlots,
  TimetableResponsesBundleSlotsSlot,
  TimetableResponsesBundleSlotsSlotProcedure,
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
export type PublicSalonCatalogProcedure =
  ProcedureHelpersCatalogProcedureResponse &
  Partial<
    Pick<
      ProcedureHelpersProcedureResponse,
      "archived" | "onlineBookingEnabled"
    >
  >;
export type PublicSalonCatalogBundleProcedure = BundlesHelpersProcedureResponse;
export type PublicSalonCatalogBundle = BundlesHelpersBundleResponse;
export type PublicSalonCatalog = Omit<
  SalonResponsesCatalog,
  "bundles" | "procedures"
> & {
  bundles: PublicSalonCatalogBundle[];
  complexes?: PublicSalonCatalogBundle[];
  procedures: PublicSalonCatalogProcedure[];
};
export type PublicDateInterval = SafeDateInterval;
export type PublicProcedureSlotsResponse = TimetableResponsesProcedureSlots;
export type PublicBundleSlotProcedure = TimetableResponsesBundleSlotsSlotProcedure;
export type PublicBundleSlot = TimetableResponsesBundleSlotsSlot;
export type PublicBundleSlotsResponse = TimetableResponsesBundleSlots;
export type PublicSearchSlotsBody = TimetableParametersSearchSlotSelectedService;
export type PublicSearchProcedureBody = {
  executorId?: string;
  id: string;
};
export type PublicSearchComplexBody = {
  id: string;
  procedures: Array<{
    executorId?: string;
    id: string;
  }>;
};
export type PublicSearchSlotsResponse =
  | PublicProcedureSlotsResponse
  | PublicBundleSlotsResponse;
export type PublicBookingCreatePayload = PublicBookingParametersCreate;
export type SharedPublicBookingVisit = VisitResponsesFull;
export type PublicComplexSlotProcedure = PublicBundleSlotProcedure;
export type PublicComplexSlot = PublicBundleSlot;
export type PublicComplexSlotsResponse = PublicBundleSlotsResponse;
export type PublicSalonCatalogComplexProcedure = PublicSalonCatalogBundleProcedure;
export type PublicSalonCatalogComplex = PublicSalonCatalogBundle;

export type BillingCatalog = BillingCatalogResponse;
export type BillingCatalogPlanItem = BillingCatalogPlan;
export type BillingCatalogCadenceOffer = BillingCatalogCadence;
export type BillingCatalogPlanCodeValue = BillingCatalogPlanCode;
export type BillingPlanCodeValue = BillingPlanCode;
export type BillingPlanAvailabilityValue = BillingPlanAvailability;
export type BillingPlanIntervalValue = BillingPlanInterval;
export type BillingPortalSessionResponse = BillingPortalSession;
export type BillingSessionResponse = BillingSession;
export type BillingSessionContextResponse = BillingSessionContext;
export type BillingSummary = SharedBillingSummary;
export type BillingTier = BillingSeatTier;
export type BillingPrice = Price;
