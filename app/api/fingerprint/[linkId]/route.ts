import { NextRequest, NextResponse } from "next/server";

const resolveApiUrl = (): string => {
  const direct = process.env.SHORTLINK_API_URL ?? process.env.NEXT_PUBLIC_SHORTLINK_API_URL;

  if (!direct) {
    throw new Error("SHORTLINK_API_URL is not configured");
  }

  return direct.replace(/\/+$/, "");
};

export async function POST(request: NextRequest, { params }: { params: { linkId: string } }) {
  const apiUrl = resolveApiUrl();
  const linkId = params.linkId;

  try {
    const body = await request.json();
    const targetUrl = `${apiUrl}/api/fingerprint/${encodeURIComponent(linkId)}`;
    const proxyResponse = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": request.headers.get("user-agent") ?? "",
        "CF-Connecting-IP": request.headers.get("x-forwarded-for") ?? request.ip ?? "",
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

