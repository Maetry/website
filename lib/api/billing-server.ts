import "server-only";

import type { NextRequest } from "next/server";

import {
  getWorkspaceBillingCatalog,
  getWorkspaceBillingSummary,
  postWorkspaceBillingPortalSession,
  postWorkspaceBillingSubscriptionInstructions,
} from "@maetry/shared-sdk";

import type {
  BillingCatalog,
  BillingPortalSessionResponse,
  BillingSubscriptionInstructionsPayload,
  BillingSubscriptionInstructionsResult,
  BillingSummary,
} from "./maetry-contracts";
import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
  getIdempotencyKeyHeader,
  requireAuthorizationHeader,
  requireDeviceIdHeader,
  unwrapMaetrySdkResult,
} from "./maetry-sdk.server";

export type BillingAuthContext = {
  authorization: string;
  deviceId: string;
};

export function requireBillingAuthContext(
  request: NextRequest,
): BillingAuthContext {
  return {
    authorization: requireAuthorizationHeader(request),
    deviceId: requireDeviceIdHeader(request),
  };
}

export async function loadBillingHubData(
  auth: BillingAuthContext,
): Promise<{
  catalog: BillingCatalog;
  summary: BillingSummary;
}> {
  const client = createMaetryServerClient({
    authorization: auth.authorization,
  });
  const headers = {
    "Device-ID": auth.deviceId,
  };

  const [catalogResponse, summaryResponse] = await Promise.all([
    getWorkspaceBillingCatalog({
      client,
      headers,
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    }),
    getWorkspaceBillingSummary({
      client,
      headers,
      ...MAETRY_THROW_ON_ERROR_OPTIONS,
    }),
  ]);

  return {
    catalog: unwrapMaetrySdkResult(catalogResponse),
    summary: unwrapMaetrySdkResult(summaryResponse),
  };
}

export async function requestBillingSubscriptionInstructions(
  auth: BillingAuthContext,
  payload: BillingSubscriptionInstructionsPayload,
  idempotencyKey?: string,
): Promise<BillingSubscriptionInstructionsResult> {
  const client = createMaetryServerClient({
    authorization: auth.authorization,
  });

  const response = await postWorkspaceBillingSubscriptionInstructions({
    body: payload,
    client,
    headers: {
      "Device-ID": auth.deviceId,
      ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
    },
    ...MAETRY_THROW_ON_ERROR_OPTIONS,
  });

  return unwrapMaetrySdkResult(response);
}

export async function requestBillingSubscriptionInstructionsFromRequest(
  request: NextRequest,
  payload: BillingSubscriptionInstructionsPayload,
): Promise<BillingSubscriptionInstructionsResult> {
  const auth = requireBillingAuthContext(request);

  return requestBillingSubscriptionInstructions(
    auth,
    payload,
    getIdempotencyKeyHeader(request),
  );
}

export async function createBillingPortalSession(
  auth: BillingAuthContext,
): Promise<BillingPortalSessionResponse> {
  const client = createMaetryServerClient({
    authorization: auth.authorization,
  });

  const response = await postWorkspaceBillingPortalSession({
    client,
    headers: {
      "Device-ID": auth.deviceId,
    },
    ...MAETRY_THROW_ON_ERROR_OPTIONS,
  });

  return unwrapMaetrySdkResult(response);
}

export async function createBillingPortalSessionFromRequest(
  request: NextRequest,
): Promise<BillingPortalSessionResponse> {
  return createBillingPortalSession(requireBillingAuthContext(request));
}
