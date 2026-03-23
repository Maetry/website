import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { ApiError } from "@/lib/api/error-handler";
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

    const body = await request.json();
    const query = new URLSearchParams({
      salonId: validatedSalonId,
      date,
    });

    return proxyApiRequest({
      method: "POST",
      path: `/timetables/search-slots?${query.toString()}`,
      request,
      body,
      errorCode: "FAILED_TO_SEARCH_PUBLIC_BOOKING_SLOTS",
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
    throw error;
  }
}
