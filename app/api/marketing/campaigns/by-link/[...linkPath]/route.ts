import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ linkPath: string[] }>;
};

export async function GET(request: NextRequest, context: RouteParams) {
  const { linkPath: segments } = await context.params;

  try {
    const rawLinkId = segments.join("/");
    const linkId = validateId(rawLinkId, "linkId");
    const path = `/v1/marketing/campaigns/by-link/${encodeURIComponent(linkId)}`;

    return proxyApiRequest({
      method: "GET",
      path,
      request,
      errorCode: "FAILED_TO_FETCH_CAMPAIGN",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_LINK_ID");
    if (validationError) return validationError;
    throw error;
  }
}
