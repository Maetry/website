import type { NextRequest } from "next/server";

import { handleValidationError, proxyApiRequest } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const body = await request.json();
    const path = `/public/booking/salon/${encodeURIComponent(salonId)}`;

    return proxyApiRequest({
      method: "POST",
      path,
      request,
      body,
      errorCode: "FAILED_TO_CREATE_PUBLIC_BOOKING",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    throw error;
  }
}
