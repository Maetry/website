import { NextRequest, NextResponse } from "next/server";

const resolveApiUrl = (): string => {
  const direct = process.env.SHORTLINK_API_URL ?? process.env.NEXT_PUBLIC_SHORTLINK_API_URL;

  if (!direct) {
    throw new Error("SHORTLINK_API_URL is not configured");
  }

  return direct.replace(/\/+$/, "");
};

export async function GET(request: NextRequest, { params }: { params: { linkId: string } }) {
  const apiUrl = resolveApiUrl();
  const linkId = params.linkId;

  try {
    const targetUrl = `${apiUrl}/api/links/${encodeURIComponent(linkId)}`;
    const proxyResponse = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": request.headers.get("user-agent") ?? "",
      },
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
      console.error("[links] proxy failed", error);
    }

    return NextResponse.json(
      {
        error: "FAILED_TO_FETCH_LINK",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      },
    );
  }
}

