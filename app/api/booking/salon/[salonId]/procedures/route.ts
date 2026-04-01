import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { adaptCatalogToLegacyProcedures } from "@/lib/api/booking-legacy-adapter";
import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

import { getPublicBookingSalonCatalog } from "@maetry/shared-sdk";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;
  const locale = request.headers.get("languages") || "en";

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const client = createMaetryServerClient();
    const result = await getPublicBookingSalonCatalog({
      client,
      headers: {
        languages: locale,
      },
      path: { salonId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });

    return NextResponse.json(
      adaptCatalogToLegacyProcedures(unwrapMaetrySdkResult(result)),
    );
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(error, "FAILED_TO_FETCH_PROCEDURES");
  }
}
