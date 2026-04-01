import "server-only";

import type { NextRequest } from "next/server";

import {
  getPublicBookingSalonProfile,
  postBillingSessionResolve,
  getWorkspaceBillingCatalog,
  getWorkspaceBillingSummary,
  postWorkspaceBillingPortalSession,
} from "@maetry/shared-sdk";

import type {
  BillingCatalog,
  BillingSessionContextResponse,
  BillingPortalSessionResponse,
  BillingSummary,
  PublicSalonProfile,
} from "./maetry-contracts";
import {
  MAETRY_THROW_ON_ERROR_OPTIONS,
  createMaetryServerClient,
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

export async function resolveBillingSessionContext(
  session: string,
): Promise<BillingSessionContextResponse> {
  const client = createMaetryServerClient();

  const response = await postBillingSessionResolve({
    body: {
      session,
    },
    client,
    ...MAETRY_THROW_ON_ERROR_OPTIONS,
  });

  return unwrapMaetrySdkResult(response);
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

export async function loadBillingSalonProfile(
  salonId: string,
  locale?: string,
): Promise<PublicSalonProfile> {
  const client = createMaetryServerClient();

  const response = await getPublicBookingSalonProfile({
    client,
    headers: locale
      ? {
          languages: locale,
        }
      : undefined,
    path: {
      salonId,
    },
    ...MAETRY_THROW_ON_ERROR_OPTIONS,
  });

  return unwrapMaetrySdkResult(response);
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
