import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getPublicBookingSalonProfile,
  postTimetablesSearchSlots,
} from "@maetry/shared-sdk";

import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  requireDeviceIdHeader,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }

      return acc;
    },
    {},
  );
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtc - date.getTime()) / 60_000;
}

function getDateKeyForTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days, 12));
  const nextYear = nextDate.getUTCFullYear();
  const nextMonth = `${nextDate.getUTCMonth() + 1}`.padStart(2, "0");
  const nextDay = `${nextDate.getUTCDate()}`.padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

function toTimeZoneIsoDate(dateKey: string, timeZone: string, hour = 12) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const firstOffset = getTimeZoneOffsetMinutes(guessUtc, timeZone);
  const firstPass = new Date(guessUtc.getTime() - firstOffset * 60_000);
  const secondOffset = getTimeZoneOffsetMinutes(firstPass, timeZone);
  const resolvedDate =
    firstOffset === secondOffset
      ? firstPass
      : new Date(guessUtc.getTime() - secondOffset * 60_000);

  return resolvedDate.toISOString();
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const body = await request.json();
    const procedureId =
      typeof body?.procedureId === "string" ? body.procedureId : null;
    const executorId =
      typeof body?.executorId === "string" ? body.executorId : undefined;
    const daysAhead =
      typeof body?.daysAhead === "number" ? body.daysAhead : Number.NaN;

    if (!procedureId) {
      return NextResponse.json(
        {
          error: "INVALID_PROCEDURE_ID",
          message: "procedureId is required",
        },
        { status: 400 },
      );
    }

    if (!Number.isFinite(daysAhead) || daysAhead < 1 || daysAhead > 31) {
      return NextResponse.json(
        {
          error: "INVALID_DAYS_AHEAD",
          message: "daysAhead must be between 1 and 31",
        },
        { status: 400 },
      );
    }

    const client = createMaetryServerClient();
    const deviceId = requireDeviceIdHeader(request);
    const profileResult = await getPublicBookingSalonProfile({
      client,
      path: { salonId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });
    const profile = unwrapMaetrySdkResult(profileResult);
    const timeZoneId = profile.timeZoneId || "UTC";
    const startDateKey = getDateKeyForTimeZone(new Date(), timeZoneId);
    const dateKeys = Array.from({ length: daysAhead }, (_, index) =>
      addDaysToDateKey(startDateKey, index),
    );

    const slotRequests = dateKeys.map((dateKey) => {
      return postTimetablesSearchSlots({
        body: {
          ...(executorId ? { executorId } : {}),
          id: procedureId,
        },
        client,
        headers: {
          "Device-ID": deviceId,
        },
        query: {
          query: {
            date: toTimeZoneIsoDate(dateKey, timeZoneId),
            salonId,
          },
        },
        ...MAETRY_THROW_ON_ERROR_OPTIONS,
      });
    });

    const responses = (await Promise.all(slotRequests)).map(
      unwrapMaetrySdkResult,
    );

    const intervals = responses.flatMap((response) =>
      "intervals" in response ? response.intervals : [],
    );

    return NextResponse.json({
      intervals,
      timeZoneId,
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_SEARCH_SLOTS");
  }
}
