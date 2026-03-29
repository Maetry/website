import type {
  AppointmentResponse,
  Procedure,
  ProceduresResponse,
} from "./booking";
import type {
  BillingPrice,
  PublicSalonCatalog,
  SharedPublicBookingVisit,
} from "./maetry-contracts";

function toNullableString(value?: string | null): string | null {
  return value ?? null;
}

function toLegacyPrice(value?: BillingPrice | null) {
  if (!value) {
    return undefined;
  }

  return {
    amount: value.amount,
    currency: value.currency,
  };
}

function minorToMajor(amountMinor: number): number {
  return amountMinor / 100;
}

export function adaptCatalogToLegacyProcedures(
  catalog: PublicSalonCatalog,
): ProceduresResponse {
  const procedures: Procedure[] = (catalog.procedures ?? []).flatMap(
    (procedure) => {
      const executions = procedure.executions ?? [];

      if (!executions.length) {
        return [
          {
            id: procedure.id,
            alias: procedure.title,
            duration: procedure.minDuration,
            price: toLegacyPrice(procedure.minPrice),
            serviceTitle: procedure.serviceTitle,
            serviceDescription: procedure.description,
            masterId: null,
            masterNickname: null,
            masterAvatar: null,
            parameters: [],
          },
        ];
      }

      return executions.map((execution) => ({
        id: procedure.id,
        alias: procedure.title,
        duration: execution.duration ?? procedure.minDuration,
        price:
          execution.price !== undefined && execution.price !== null
            ? {
                amount: execution.price,
                currency: execution.currency,
              }
            : toLegacyPrice(procedure.minPrice),
        serviceTitle: procedure.serviceTitle,
        serviceDescription: procedure.description,
        masterId: toNullableString(execution.masterId),
        masterNickname: toNullableString(execution.masterName),
        masterAvatar: toNullableString(execution.masterAvatar),
        parameters: [],
      }));
    },
  );

  return { procedures };
}

export function adaptVisitToLegacyAppointment(
  visit: SharedPublicBookingVisit,
): AppointmentResponse {
  const procedure =
    "procedure" in visit.service ? visit.service.procedure : undefined;
  const complex =
    "complex" in visit.service ? visit.service.complex : undefined;
  const selectedProcedure = procedure ?? complex?.procedures[0];
  const executor = selectedProcedure?.executor;

  return {
    appointmentId: visit.id,
    salonId: visit.salon.id,
    salonName: visit.salon.name,
    salonIcon: visit.salon.logoUrl,
    procedureId: selectedProcedure?.id,
    time:
      visit.startTime && visit.endTime
        ? {
            start: visit.startTime,
            end: visit.endTime,
          }
        : undefined,
    price: {
      amount: minorToMajor(visit.priceMinor),
      currency: visit.currency,
    },
    masterId: executor?.masterId ?? null,
    masterNickname: executor?.name ?? null,
    wallet: {
      apple: undefined,
      google: undefined,
    },
    walletLinks: {
      apple: undefined,
      google: undefined,
    },
  };
}
