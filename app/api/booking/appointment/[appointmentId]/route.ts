import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { adaptVisitToLegacyAppointment } from "@/lib/api/booking-legacy-adapter";
import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

import { getPublicVisitByBookingId } from "@maetry/shared-sdk";

type RouteParams = {
  params: Promise<{ appointmentId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { appointmentId: rawAppointmentId } = await context.params;

  try {
    const appointmentId = validateId(rawAppointmentId, "appointmentId");
    const client = createMaetryServerClient();
    const result = await getPublicVisitByBookingId({
      client,
      path: { id: appointmentId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });

    return NextResponse.json(
      adaptVisitToLegacyAppointment(unwrapMaetrySdkResult(result)),
    );
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_APPOINTMENT_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_FETCH_APPOINTMENT");
  }
}
