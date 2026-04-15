import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/error-handler";
import { validateId } from "@/lib/api/validation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawId = searchParams.get("id");

  if (!rawId) {
    return NextResponse.json(
      { error: "Missing id parameter" },
      { status: 400 }
    );
  }

  try {
    const id = validateId(rawId, "appointmentId");
    const apiUrl = resolveApiUrl();
    const targetUrl = `${apiUrl}/v1/wallet/apple/booking/${encodeURIComponent(id)}`;
    return NextResponse.redirect(targetUrl);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          error: "INVALID_APPOINTMENT_ID",
          message: error.message
        },
        { status: error.status }
      );
    }
    
    console.error("[wallet/apple] proxy failed", error);
    return NextResponse.json(
      {
        error: "FAILED_TO_FETCH_WALLET_PASS",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
