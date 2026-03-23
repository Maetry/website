import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handleValidationError, proxyApiRequest } from "@/lib/api/route-handler";
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
    const path = `/salon/${encodeURIComponent(salonId)}/${RESOURCE_PATHS[resource]}`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      errorCode: `FAILED_TO_FETCH_${resource.toUpperCase()}`,
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    throw error;
  }
}
