import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getPublicBookingSalonCatalog,
  getPublicBookingSalonMasters,
  getPublicBookingSalonProfile,
} from "@maetry/shared-sdk";

import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  maetrySdkErrorResponse,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

const RESOURCE_PATHS = {
  profile: "profile",
  catalog: "catalog",
  masters: "masters",
} as const;

type ResourceName = keyof typeof RESOURCE_PATHS;

type RouteParams = {
  params: Promise<{ resource: string; salonId: string }>;
};

function isResourceName(resource: string): resource is ResourceName {
  return resource in RESOURCE_PATHS;
}

export async function GET(request: NextRequest, context: RouteParams) {
  const { resource, salonId: rawSalonId } = await context.params;

  if (!isResourceName(resource)) {
    return NextResponse.json(
      {
        error: "INVALID_PUBLIC_BOOKING_RESOURCE",
        message: `Unsupported public booking resource: ${resource}`,
      },
      { status: 404 },
    );
  }

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const client = createMaetryServerClient();

    if (resource === "profile") {
      const result = await getPublicBookingSalonProfile({
        client,
        path: { salonId },
        ...MAETRY_THROW_ON_ERROR_OPTIONS,
      });
      return NextResponse.json(unwrapMaetrySdkResult(result));
    }

    if (resource === "catalog") {
      const result = await getPublicBookingSalonCatalog({
        client,
        path: { salonId },
        ...MAETRY_THROW_ON_ERROR_OPTIONS,
      });
      return NextResponse.json(unwrapMaetrySdkResult(result));
    }

    const result = await getPublicBookingSalonMasters({
      client,
      path: { salonId },
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    });
    return NextResponse.json(unwrapMaetrySdkResult(result));
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return maetrySdkErrorResponse(
      error,
      `FAILED_TO_FETCH_${resource.toUpperCase()}`,
    );
  }
}
