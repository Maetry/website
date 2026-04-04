import { NextRequest, NextResponse } from "next/server";

import { proxyApiRequest } from "@/lib/api/route-handler";

export async function POST(request: NextRequest) {
  let body: {
    interval?: string;
    plan?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "INVALID_BODY",
        message: "Invalid request body",
      },
      { status: 400 },
    );
  }

  if (!body.plan || typeof body.plan !== "string") {
    return NextResponse.json(
      {
        error: "INVALID_PLAN",
        message: "plan is required",
      },
      { status: 400 },
    );
  }

  if (
    !body.interval ||
    (body.interval !== "monthly" && body.interval !== "yearly")
  ) {
    return NextResponse.json(
      {
        error: "INVALID_INTERVAL",
        message: "interval must be monthly or yearly",
      },
      { status: 400 },
    );
  }

  return proxyApiRequest({
    body: {
      interval: body.interval,
      plan: body.plan,
    },
    errorCode: "FAILED_TO_CREATE_BILLING_CHECKOUT_SESSION",
    method: "POST",
    operation: "billing_checkout_session_create",
    path: "/v1/workspace/billing/checkout-session",
    request,
  });
}
