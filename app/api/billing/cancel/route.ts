import { NextRequest } from "next/server";

import { proxyApiRequest } from "@/lib/api/route-handler";

export async function POST(request: NextRequest) {
  return proxyApiRequest({
    body: {
      immediate: false,
    },
    errorCode: "FAILED_TO_CANCEL_BILLING_SUBSCRIPTION",
    method: "POST",
    operation: "billing_subscription_cancel",
    path: "/v1/workspace/billing/cancel",
    request,
  });
}
