import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { getPublicVisitByBookingId } from "@maetry/shared-sdk";

import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { bookingId: rawBookingId } = await context.params;

  try {
    const bookingId = validateId(rawBookingId, "bookingId");
    const client = createMaetryServerClient();
    const result = await getPublicVisitByBookingId({
      client,
      path: { id: bookingId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });

    return NextResponse.json(unwrapMaetrySdkResult(result));
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_BOOKING_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_FETCH_PUBLIC_BOOKING");
  }
}
