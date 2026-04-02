import type { NextRequest } from "next/server";

import { handleValidationError, proxyApiRequest } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ nanoId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { nanoId: rawNanoId } = await context.params;
  const body = await request.json();

  try {
    const nanoId = validateId(rawNanoId, "nanoId");

    return proxyApiRequest({
      method: "POST",
      path: `/v1/clicks/${encodeURIComponent(nanoId)}`,
      request,
      body,
      errorCode: "FAILED_TO_RESOLVE_LINK",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_LINK_ID");
    if (validationError) return validationError;
    throw error;
  }
}
