import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/error-handler";
import { requireDeviceIdHeader } from "@/lib/api/maetry-sdk.server";
import { handleValidationError, proxyApiRequest } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

export async function POST(request: NextRequest) {
  const salonId = request.nextUrl.searchParams.get("salonId") ?? undefined;
  const date = request.nextUrl.searchParams.get("date") ?? undefined;

  try {
    const validatedSalonId = validateId(salonId, "salonId");

    if (!date) {
      throw new ApiError(400, "Invalid date: must be a non-empty string");
    }

    requireDeviceIdHeader(request);
    const body = await request.json();
    return proxyApiRequest({
      body,
      errorCode: "FAILED_TO_SEARCH_PUBLIC_BOOKING_SLOTS",
      method: "POST",
      path:
        `/v1/timetables/search-slots?salonId=${encodeURIComponent(validatedSalonId)}` +
        `&date=${encodeURIComponent(date)}`,
      request,
    });
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
    return NextResponse.json(
      {
        error: "FAILED_TO_SEARCH_PUBLIC_BOOKING_SLOTS",
        message:
          error instanceof Error
            ? error.message
            : "Failed to search public booking slots",
      },
      { status: 500 },
    );
  }
}
