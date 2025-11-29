import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ appointmentId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { appointmentId: rawAppointmentId } = await context.params;

  try {
    const appointmentId = validateId(rawAppointmentId, "appointmentId");
    const path = `/public/booking/appointment/${encodeURIComponent(appointmentId)}`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      errorCode: "FAILED_TO_FETCH_APPOINTMENT",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_APPOINTMENT_ID");
    if (validationError) return validationError;
    throw error;
  }
}

