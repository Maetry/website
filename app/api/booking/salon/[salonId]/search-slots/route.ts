import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveApiUrl } from "@/lib/api/config";
import {
  requireDeviceIdHeader,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { validateId } from "@/lib/api/validation";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  try {
    const salonId = validateId(rawSalonId, "salonId");
    const body = await request.json();
    const procedureId =
      typeof body?.procedureId === "string" ? body.procedureId : null;
    const executorId =
      typeof body?.executorId === "string" ? body.executorId : undefined;
    const date = typeof body?.date === "string" ? body.date : null;

    if (!procedureId) {
      return NextResponse.json(
        {
          error: "INVALID_PROCEDURE_ID",
          message: "procedureId is required",
        },
        { status: 400 },
      );
    }

    if (!date) {
      return NextResponse.json(
        {
          error: "INVALID_DATE",
          message: "date is required",
        },
        { status: 400 },
      );
    }

    const deviceId = requireDeviceIdHeader(request);
    const targetUrl =
      `${resolveApiUrl()}/v1/timetables/search-slots?salonId=${encodeURIComponent(salonId)}` +
      `&date=${encodeURIComponent(date)}`;

    const proxyResponse = await fetch(targetUrl, {
      body: JSON.stringify({
        ...(executorId ? { executorId } : {}),
        id: procedureId,
      }),
      cache: "no-store",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "Device-ID": deviceId,
      },
      method: "POST",
    });

    const text = await proxyResponse.text();

    if (!proxyResponse.ok) {
      try {
        const errorData = JSON.parse(text) as {
          error?: string;
          message?: string;
        };

        return NextResponse.json(
          {
            error: errorData.error || "FAILED_TO_SEARCH_SLOTS",
            message: errorData.message || proxyResponse.statusText,
          },
          { status: proxyResponse.status },
        );
      } catch {
        return NextResponse.json(
          {
            error: "FAILED_TO_SEARCH_SLOTS",
            message: text || proxyResponse.statusText,
          },
          { status: proxyResponse.status },
        );
      }
    }

    const response = JSON.parse(text) as {
      intervals?: Array<{ end: string; start: string }>;
      slots?: Array<{ total: { end: string; start: string } }>;
      timeZoneId: string;
    };
    const intervals =
      "intervals" in response
        ? (response.intervals ?? [])
        : (response.slots ?? []).map((slot) => slot.total);

    return NextResponse.json({
      intervals,
      timeZoneId: response.timeZoneId,
    });
  } catch (error) {
    const validationError = handleValidationError(error, "INVALID_SALON_ID");
    if (validationError) return validationError;
    return NextResponse.json(
      {
        error: "FAILED_TO_SEARCH_SLOTS",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
