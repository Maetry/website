import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;
  const locale = request.headers.get("languages") || "en";

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const path = `/public/booking/salon/${encodeURIComponent(salonId)}/procedures`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      headers: {
        languages: locale,
      },
      errorCode: "FAILED_TO_FETCH_PROCEDURES",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    throw error;
  }
}

