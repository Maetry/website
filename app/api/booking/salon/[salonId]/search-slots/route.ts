import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { postTimetablesSearchSlots } from "@maetry/shared-sdk";

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

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const body = await request.json();
    const procedureId =
      typeof body?.procedureId === "string" ? body.procedureId : null;
    const executorId =
      typeof body?.executorId === "string" ? body.executorId : undefined;
    const date = typeof body?.date === "string" ? body.date : null;

    if (!procedureId) {
      return NextResponse.json(
        {
          error: "INVALID_PROCEDURE_ID",
          message: "procedureId is required",
        },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          error: "INVALID_DATE",
          message: "date is required",
        },
        { status: 400 },
      );
    }

    const client = createMaetryServerClient();
    const deviceId = requireDeviceIdHeader(request);
    const result = await postTimetablesSearchSlots({
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
          date,
          salonId,
        },
      },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });
    const response = unwrapMaetrySdkResult(result);
    const intervals =
      "intervals" in response
        ? response.intervals
        : response.slots.map((slot) => slot.total);

    return NextResponse.json({
      intervals,
      timeZoneId: response.timeZoneId,
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_SEARCH_SLOTS");
  }
}
