import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BOOKING_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8080';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing id parameter' },
      { status: 400 }
    );
  }

  try {
    const apiUrl = `${API_BASE_URL}/wallet/google?id=${encodeURIComponent(id)}`;
    const response = await fetch(apiUrl, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });

    if (!response.ok) {
      const message = await response.text();
      return NextResponse.json(
        { error: message || 'Failed to get Google Wallet URL' },
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
    console.error('[wallet/google] proxy failed', error);
    return NextResponse.json(
      {
        error: 'FAILED_TO_FETCH_WALLET_URL',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

