import { NextRequest, NextResponse } from "next/server";

import { createBillingPortalSessionFromRequest } from "@/lib/api/billing-server";
import { maetrySdkErrorResponse } from "@/lib/api/maetry-sdk.server";

export async function POST(request: NextRequest) {
  try {
    const data = await createBillingPortalSessionFromRequest(request);
    return NextResponse.json(data);
  } catch (error) {
    return maetrySdkErrorResponse(error, "FAILED_TO_CREATE_BILLING_PORTAL");
  }
}
