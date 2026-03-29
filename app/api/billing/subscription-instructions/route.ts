import { NextRequest, NextResponse } from "next/server";

import { requestBillingSubscriptionInstructionsFromRequest } from "@/lib/api/billing-server";
import { maetrySdkErrorResponse } from "@/lib/api/maetry-sdk.server";

export async function POST(request: NextRequest) {
  let body: {
    interval?: string;
    plan?: string;
    recipientEmail?: string;
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

  if (
    !body.recipientEmail ||
    typeof body.recipientEmail !== "string" ||
    !body.recipientEmail.includes("@")
  ) {
    return NextResponse.json(
      {
        error: "INVALID_RECIPIENT_EMAIL",
        message: "recipientEmail must be a valid email address",
      },
      { status: 400 },
    );
  }

  try {
    const data = await requestBillingSubscriptionInstructionsFromRequest(
      request,
      {
        interval: body.interval,
        plan: body.plan as "grow" | "scale" | "start",
        recipientEmail: body.recipientEmail.trim(),
      },
    );

    return NextResponse.json(data, { status: 202 });
  } catch (error) {
    return maetrySdkErrorResponse(
      error,
      "FAILED_TO_SEND_SUBSCRIPTION_INSTRUCTIONS",
    );
  }
}
