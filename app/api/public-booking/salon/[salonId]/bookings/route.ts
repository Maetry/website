import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

import { postPublicBookingBySalonId } from "@maetry/shared-sdk";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const body = await request.json();
    const client = createMaetryServerClient();
    const result = await postPublicBookingBySalonId({
      body,
      client,
      path: { salonId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });

    return NextResponse.json(unwrapMaetrySdkResult(result));
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_CREATE_PUBLIC_BOOKING");
  }
}
