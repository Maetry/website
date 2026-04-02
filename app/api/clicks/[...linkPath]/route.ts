import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { devLog } from "@/lib/api/utils";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ linkPath: string[] }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { linkPath: segments } = await context.params;
  const body = await request.json();

  try {
    const rawLinkId = segments.join("/");
    const linkId = validateId(rawLinkId, "linkId");
    const path = `/v1/clicks/${encodeURIComponent(linkId)}`;

    devLog("[clicks] Registering click for link:", linkId);

    return proxyApiRequest({
      method: "POST",
      path,
      request,
      body,
      errorCode: "FAILED_TO_REGISTER_CLICK",
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_LINK_ID");
    if (validationError) return validationError;
    throw error;
  }
}
