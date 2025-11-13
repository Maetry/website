export type ShortLinkEventType = "salonInvite" | "employeeInvite" | "clientInvite";

export interface DirectLinkSalon {
  name: string;
  description?: string;
  imageUrl?: string;
}

export interface DirectLinkDTO {
  nanoId: string;
  eventType: ShortLinkEventType;
  payload: Record<string, string | number | boolean | null>;
  universalLink: string;
  appStoreLink?: string;
  playStoreLink?: string;
  webFallbackLink?: string;
  salon?: DirectLinkSalon | null;
  title?: string;
  description?: string;
}

export class NotFoundError extends Error {
  constructor(message = "Short link not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

const resolveApiUrl = (): string => {
  const direct = process.env.SHORTLINK_API_URL ?? process.env.NEXT_PUBLIC_SHORTLINK_API_URL;

  if (!direct) {
    throw new Error("SHORTLINK_API_URL is not configured");
  }

  return direct.replace(/\/+$/, "");
};

export async function fetchDirectLink(linkId: string, userAgent?: string): Promise<DirectLinkDTO> {
  if (!linkId) {
    throw new Error("Link id is required");
  }

  const apiUrl = resolveApiUrl();

  const response = await fetch(`${apiUrl}/api/links/${encodeURIComponent(linkId)}`, {
    method: "GET",
    headers: {
      "User-Agent": userAgent ?? "",
    },
    cache: "no-store",
    next: {
      revalidate: 0,
    },
  });

  if (response.status === 404) {
    throw new NotFoundError(`Short link ${linkId} not found`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch short link ${linkId}: ${response.statusText}`);
  }

  const data = (await response.json()) as DirectLinkDTO;

  return data;
}

