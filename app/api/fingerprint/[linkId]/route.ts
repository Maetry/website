import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const resolveApiUrl = (): string => {
  const direct = process.env.SHORTLINK_API_URL ?? process.env.NEXT_PUBLIC_SHORTLINK_API_URL;

  if (!direct) {
    throw new Error("SHORTLINK_API_URL is not configured");
  }

  return direct.replace(/\/+$/, "");
};

type RouteParams = {
  params: Promise<{ linkId: string }>;
};

export async function POST(request: NextRequest, context: RouteParams) {
  const apiUrl = resolveApiUrl();
  const { linkId } = await context.params;

  try {
    const body = await request.json();
    const targetUrl = `${apiUrl}/api/fingerprint/${encodeURIComponent(linkId)}`;
    const forwardedFor = request.headers.get("x-forwarded-for");
    const cfIp = request.headers.get("cf-connecting-ip");
    const clientIp = forwardedFor?.split(",")[0]?.trim() ?? cfIp ?? "";
    const proxyResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
        "CF-Connecting-IP": clientIp,
      },
      body: JSON.stringify(body),
    });

    const text = await proxyResponse.text();

    return new NextResponse(text, {
      status: proxyResponse.status,
      headers: {
        "Content-Type": proxyResponse.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[fingerprint] proxy failed", error);
    }

    return NextResponse.json(
      {
        error: "FAILED_TO_FORWARD_FINGERPRINT",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

