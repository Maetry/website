import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { resolveApiUrl } from "@/lib/api/config";
import { ApiError } from "@/lib/api/error-handler";
import { validateId } from "@/lib/api/validation";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const rawId = searchParams.get('id');

  if (!rawId) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    );
  }

  try {
    const id = validateId(rawId, "appointmentId");
    const apiUrl = resolveApiUrl();
    const targetUrl = `${apiUrl}/wallet/apple?id=${encodeURIComponent(id)}`;
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: message || 'Failed to get Apple Wallet URL' },
        { status: response.status }
      );
    }

    // Если ответ - редирект, возвращаем его
    if (response.redirected && response.url) {
      return NextResponse.redirect(response.url);
    }

    // Если ответ - JSON с URL, делаем редирект на этот URL
    const data = await response.json();
    const walletUrl = data.url || data;
    
    if (typeof walletUrl === 'string') {
      return NextResponse.redirect(walletUrl);
    }

    return NextResponse.json(
      { error: 'Invalid response format' },
      { status: 500 }
    );
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { 
          error: 'INVALID_APPOINTMENT_ID',
          message: error.message
        },
        { status: error.status }
      );
    }
    
    console.error('[wallet/apple] proxy failed', error);
    return NextResponse.json(
      {
        error: 'FAILED_TO_FETCH_WALLET_URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

