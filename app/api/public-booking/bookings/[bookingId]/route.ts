import type { NextRequest } from "next/server";

import { handleValidationError, proxyApiRequest } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ bookingId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { bookingId: rawBookingId } = await context.params;

  try {
    const bookingId = validateId(rawBookingId, "bookingId");
    const path = `/public/booking/${encodeURIComponent(bookingId)}`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      errorCode: "FAILED_TO_FETCH_PUBLIC_BOOKING",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_BOOKING_ID");
    if (validationError) return validationError;
    throw error;
  }
}
