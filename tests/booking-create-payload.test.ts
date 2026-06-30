import assert from "node:assert/strict";

import {
  buildCreateSelectedServiceBody,
  type BookingCreatePayloadProcedure,
  type BookingSlotInterval,
} from "../lib/booking-create-payload";

const procedureId = "92C31D71-C6C9-490E-B565-627F0110C70E";
const executionId = "DC9C7DF5-4BA6-4D3E-933A-83A1BD1FE179";

function makeProcedure(
  overrides: Partial<BookingCreatePayloadProcedure> = {},
): BookingCreatePayloadProcedure {
  return {
    executionId,
    id: procedureId,
    kind: "procedure",
    ...overrides,
  };
}

function makeInterval(start: string, end: string): BookingSlotInterval {
  return { end, start };
}

function testDuplicateProceduresUseSequentialSlotTimes() {
  const selectedSlot = makeInterval(
    "2026-06-30T16:00:00.000Z",
    "2026-06-30T18:00:00.000Z",
  );
  const firstItemTime = makeInterval(
    "2026-06-30T16:00:00.000Z",
    "2026-06-30T17:00:00.000Z",
  );
  const secondItemTime = makeInterval(
    "2026-06-30T17:00:00.000Z",
    "2026-06-30T18:00:00.000Z",
  );

  const payload = buildCreateSelectedServiceBody(
    [makeProcedure(), makeProcedure()],
    selectedSlot,
    {
      slots: [
        {
          procedures: [
            {
              executorId: executionId,
              id: procedureId,
              time: firstItemTime,
            },
            {
              executorId: executionId,
              id: procedureId,
              time: secondItemTime,
            },
          ],
          total: selectedSlot,
        },
      ],
      timeZoneId: "America/New_York",
    },
  );

  const [firstItem, secondItem] = payload.items;

  assert.ok("procedure" in firstItem);
  assert.ok("procedure" in secondItem);
  assert.deepEqual(firstItem.procedure.time, firstItemTime);
  assert.deepEqual(secondItem.procedure.time, secondItemTime);
}

function testMissingDetailedSlotFallsBackToSelectedSlotForProcedure() {
  const selectedSlot = makeInterval(
    "2026-06-30T16:00:00.000Z",
    "2026-06-30T17:00:00.000Z",
  );

  const payload = buildCreateSelectedServiceBody(
    [makeProcedure()],
    selectedSlot,
    {
      intervals: [selectedSlot],
      timeZoneId: "America/New_York",
    },
  );
  const [item] = payload.items;

  assert.ok("procedure" in item);
  assert.deepEqual(item.procedure.time, selectedSlot);
}

testDuplicateProceduresUseSequentialSlotTimes();
testMissingDetailedSlotFallsBackToSelectedSlotForProcedure();

console.log("booking create payload tests passed");
