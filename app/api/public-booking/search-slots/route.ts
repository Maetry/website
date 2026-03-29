import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { postTimetablesSearchSlots } from "@maetry/shared-sdk";

import { ApiError } from "@/lib/api/error-handler";
import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  requireDeviceIdHeader,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

export async function POST(request: NextRequest) {
  const salonId = request.nextUrl.searchParams.get("salonId") ?? undefined;
  const date = request.nextUrl.searchParams.get("date") ?? undefined;

  try {
    const validatedSalonId = validateId(salonId, "salonId");

    if (!date) {
      throw new ApiError(400, "Invalid date: must be a non-empty string");
    }

    const body = await request.json();
    const client = createMaetryServerClient();
    const deviceId = requireDeviceIdHeader(request);
    const result = await postTimetablesSearchSlots({
      body,
      client,
      headers: {
        "Device-ID": deviceId,
      },
      query: {
        query: {
          date,
          salonId: validatedSalonId,
        },
      },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });

    return NextResponse.json(unwrapMaetrySdkResult(result));
  } catch (error) {
    const validationError =
      handleValidationError(error, "INVALID_SEARCH_SLOTS_PARAMS") ??
      (error instanceof ApiError && error.status === 400
        ? NextResponse.json(
            {
              error: "INVALID_SEARCH_SLOTS_PARAMS",
              message: error.message,
            },
            { status: error.status },
          )
        : null);

    if (validationError) return validationError;
    return maetrySdkErrorResponse(
      error,
      "FAILED_TO_SEARCH_PUBLIC_BOOKING_SLOTS",
    );
  }
}
