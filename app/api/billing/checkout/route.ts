import { NextRequest } from "next/server";

import { proxyApiRequest } from "@/lib/api/route-handler";

export async function POST(request: NextRequest) {
  let body: { salonId?: string; staffCount?: number; planId?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "INVALID_BODY", message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { salonId, staffCount, planId } = body;

  if (!salonId || typeof salonId !== "string" || salonId.trim().length === 0) {
    return Response.json(
      { error: "INVALID_SALON_ID", message: "salonId is required" },
      { status: 400 },
    );
  }

  if (!staffCount || typeof staffCount !== "number" || staffCount < 1 || staffCount > 1000) {
    return Response.json(
      { error: "INVALID_STAFF_COUNT", message: "staffCount must be between 1 and 1000" },
      { status: 400 },
    );
  }

  if (!planId || typeof planId !== "string" || planId.trim().length === 0) {
    return Response.json(
      { error: "INVALID_PLAN_ID", message: "planId is required" },
      { status: 400 },
    );
  }

  return proxyApiRequest({
    method: "POST",
    path: "/billing/checkout",
    request,
    body: { salonId, staffCount, planId },
    errorCode: "BILLING_CHECKOUT_FAILED",
  });
}
