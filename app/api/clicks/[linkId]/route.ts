import type { NextRequest } from "next/server";

import { proxyApiRequest, handleValidationError } from "@/lib/api/route-handler";
import { devLog } from "@/lib/api/utils";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ linkId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { linkId: rawLinkId } = await context.params;

  try {
    const linkId = validateId(rawLinkId, "linkId");
    const body = await request.json();
    const path = `/clicks/${encodeURIComponent(linkId)}`;

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

