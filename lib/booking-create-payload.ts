export type BookingCreatePayloadProcedure = {
  bundleItems?: Array<{
    executionId?: string | null;
    procedureId: string;
  }>;
  executionId?: string | null;
  id: string;
  kind: "bundle" | "procedure";
};

export type BookingSlotInterval = {
  end: string;
  start: string;
};

type SearchSlotsSelectedService = {
  items: Array<
    | {
        bundle: {
          bundleId: string;
          items: Array<{
            executionId?: string;
            procedureId: string;
          }>;
        };
      }
    | {
        procedure: {
          executionId?: string;
          procedureId: string;
        };
      }
  >;
};

type CreateBookingSelectedService = {
  items: Array<
    | {
        bundle: {
          bundleId: string;
          items: Array<{
            executionId?: string;
            procedureId: string;
            time?: BookingSlotInterval;
          }>;
        };
      }
    | {
        procedure: {
          executionId?: string;
          procedureId: string;
          time: BookingSlotInterval;
        };
      }
  >;
};

type SearchSlotsResponse =
  | {
      intervals: BookingSlotInterval[];
      timeZoneId: string;
    }
  | {
      slots: Array<{
        procedures: Array<{
          executorId: string;
          id: string;
          time: BookingSlotInterval;
        }>;
        total: BookingSlotInterval;
      }>;
      timeZoneId: string;
    };

export function buildSelectedServiceSearchItem(
  procedure: BookingCreatePayloadProcedure,
): SearchSlotsSelectedService["items"][number] {
  if (procedure.kind === "bundle") {
    return {
      bundle: {
        bundleId: procedure.id,
        items: (procedure.bundleItems ?? []).map((item) => ({
          ...(item.executionId ? { executionId: item.executionId } : {}),
          procedureId: item.procedureId,
        })),
      },
    };
  }

  return {
    procedure: {
      ...(procedure.executionId ? { executionId: procedure.executionId } : {}),
      procedureId: procedure.id,
    },
  };
}

export function buildSelectedServiceBody(
  procedures: BookingCreatePayloadProcedure[],
): SearchSlotsSelectedService {
  return {
    items: procedures.map((procedure) => buildSelectedServiceSearchItem(procedure)),
  };
}

export function normalizeSlotInterval(
  slot: BookingSlotInterval,
): BookingSlotInterval {
  return {
    end: new Date(slot.end).toISOString(),
    start: new Date(slot.start).toISOString(),
  };
}

function findMatchingDetailedSlot(
  slotsResponse: SearchSlotsResponse | undefined,
  selectedSlot: BookingSlotInterval,
) {
  if (!slotsResponse || "intervals" in slotsResponse) {
    return null;
  }

  return (
    slotsResponse.slots.find(
      (slot) =>
        slot.total.start === selectedSlot.start && slot.total.end === selectedSlot.end,
    ) ?? null
  );
}

type SlotTimeResolver = (
  procedureId: string,
  executionId?: string | null,
) => BookingSlotInterval | undefined;

function createSlotTimeResolver(
  detailedSlot: ReturnType<typeof findMatchingDetailedSlot>,
): SlotTimeResolver {
  const remainingProcedures = [...(detailedSlot?.procedures ?? [])];

  return (procedureId, executionId) => {
    const matchingIndex = remainingProcedures.findIndex((item) => {
      if (item.id !== procedureId) {
        return false;
      }

      return executionId ? item.executorId === executionId : true;
    });

    if (matchingIndex === -1) {
      return undefined;
    }

    const [matchedProcedure] = remainingProcedures.splice(matchingIndex, 1);
    return matchedProcedure?.time;
  };
}

function buildCreateSelectedServiceItem(
  procedure: BookingCreatePayloadProcedure,
  selectedSlot: BookingSlotInterval,
  resolveSlotTime: SlotTimeResolver,
): CreateBookingSelectedService["items"][number] {
  const normalizedSelectedSlot = normalizeSlotInterval(selectedSlot);

  if (procedure.kind === "bundle") {
    return {
      bundle: {
        bundleId: procedure.id,
        items: (procedure.bundleItems ?? []).map((item) => {
          const time = resolveSlotTime(item.procedureId, item.executionId);

          return {
            ...(item.executionId ? { executionId: item.executionId } : {}),
            procedureId: item.procedureId,
            ...(time ? { time } : {}),
          };
        }),
      },
    };
  }

  const procedureTime =
    resolveSlotTime(procedure.id, procedure.executionId) ?? normalizedSelectedSlot;

  return {
    procedure: {
      ...(procedure.executionId ? { executionId: procedure.executionId } : {}),
      procedureId: procedure.id,
      time: procedureTime,
    },
  };
}

export function buildCreateSelectedServiceBody(
  procedures: BookingCreatePayloadProcedure[],
  selectedSlot: BookingSlotInterval,
  slotsResponse: SearchSlotsResponse | undefined,
): CreateBookingSelectedService {
  const detailedSlot = findMatchingDetailedSlot(slotsResponse, selectedSlot);
  const resolveSlotTime = createSlotTimeResolver(detailedSlot);

  return {
    items: procedures.map((procedure) =>
      buildCreateSelectedServiceItem(procedure, selectedSlot, resolveSlotTime),
    ),
  };
}
