import { NextRequest, NextResponse } from "next/server";

import { createBillingPortalSessionFromRequest } from "@/lib/api/billing-server";
import { maetrySdkErrorResponse } from "@/lib/api/maetry-sdk.server";
import { monitoredRoute } from "@/lib/monitoring/server";

export async function POST(request: NextRequest) {
  return monitoredRoute(request, "billing_portal_session_create", async () => {
    try {
      const data = await createBillingPortalSessionFromRequest(request);
      return NextResponse.json(data);
    } catch (error) {
      return maetrySdkErrorResponse(error, "FAILED_TO_CREATE_BILLING_PORTAL");
    }
  });
}
