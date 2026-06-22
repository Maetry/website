import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  normalizeMaetrySdkError,
  unwrapMaetrySdkResult,
} from "@/lib/api/maetry-sdk.server";
import { handleValidationError } from "@/lib/api/route-handler";
import { devError } from "@/lib/api/utils";
import { setMonitoringContext } from "@/lib/monitoring";
import { validateId } from "@/lib/api/validation";
import { monitoredRoute } from "@/lib/monitoring/server";

import {
  postPublicBookingBySalonId,
  type PublicBookingParametersCreate,
} from "@maetry/shared-sdk";

type RouteParams = {
  params: Promise<{ salonId: string }>;
};

function summarizeBookingBody(body: unknown) {
  if (!body || typeof body !== "object") {
    return null;
  }

  const candidate = body as {
    selectedService?: {
      items?: Array<{
        bundle?: { bundleId?: unknown; items?: unknown[] };
        procedure?: { procedureId?: unknown; executionId?: unknown };
      }>;
    };
    time?: { start?: unknown; end?: unknown };
    trackingId?: unknown;
  };

  return {
    selectedItems:
      candidate.selectedService?.items?.map((item) => ({
        bundleId:
          typeof item.bundle?.bundleId === "string" ? item.bundle.bundleId : undefined,
        bundleItemsCount: Array.isArray(item.bundle?.items) ? item.bundle.items.length : 0,
        executionId:
          typeof item.procedure?.executionId === "string"
            ? item.procedure.executionId
            : undefined,
        procedureId:
          typeof item.procedure?.procedureId === "string"
            ? item.procedure.procedureId
            : undefined,
      })) ?? [],
    time: {
      end: typeof candidate.time?.end === "string" ? candidate.time.end : undefined,
      start: typeof candidate.time?.start === "string" ? candidate.time.start : undefined,
    },
    trackingId:
      typeof candidate.trackingId === "string" ? candidate.trackingId : undefined,
  };
}

export async function POST(request: NextRequest, context: RouteParams) {
  const { salonId: rawSalonId } = await context.params;

  return monitoredRoute(
    request,
    "public_booking_create",
    async (requestId) => {
      let body: PublicBookingParametersCreate | undefined;

      try {
        const salonId = validateId(rawSalonId, "salonId");
        body = (await request.json()) as PublicBookingParametersCreate;
        const client = createMaetryServerClient();
        const result = await postPublicBookingBySalonId({
          body,
          client,
          path: { salonId },
          ...MAETRY_THROW_ON_ERROR_OPTIONS,
        });

        return NextResponse.json(unwrapMaetrySdkResult(result));
      } catch (error) {
        const validationError = handleValidationError(error, "INVALID_SALON_ID");
        if (validationError) return validationError;

        const normalized = normalizeMaetrySdkError(error);
        const bookingSummary = summarizeBookingBody(body);

        setMonitoringContext("public_booking_create_error", {
          message: normalized.message,
          request_id: requestId,
          salon_id: rawSalonId,
          status: normalized.status,
          summary: bookingSummary,
        });
        devError("[public-booking] create failed", {
          message: normalized.message,
          requestId,
          salonId: rawSalonId,
          status: normalized.status,
          summary: bookingSummary,
        });

        return NextResponse.json(
          {
            error: "FAILED_TO_CREATE_PUBLIC_BOOKING",
            message: normalized.message,
            requestId,
          },
          {
            status: normalized.status,
          },
        );
      }
    },
    {
      input: {
        salon_id: rawSalonId,
      },
    },
  );
}
