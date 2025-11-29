import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ salonId: string; appointmentId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId, appointmentId: rawAppointmentId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const appointmentId = validateId(rawAppointmentId, "appointmentId");
    const path = `/public/booking/salon/${encodeURIComponent(salonId)}/appointment/${encodeURIComponent(appointmentId)}`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      errorCode: "FAILED_TO_FETCH_APPOINTMENT",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_ID");
    if (validationError) return validationError;
    throw error;
  }
}

