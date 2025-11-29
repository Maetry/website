// Типы для коротких ссылок и маркетинговых кампаний

export type LinkKind = "marketing" | "employeeInvite" | "clientInvite";

export interface MagicLinkResponse {
  nanoId: string;
  kind: LinkKind;
  isOneTime: boolean;
  expiresAt: string | null;
  usedAt: string | null;
  createdAt: string;
}

export interface ClickRequest {
  language: string;
  languages: string[];
  cores: number;
  memory: number;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  pixelRatio: number;
  timeZone: string;
}

export interface MarketingCampaign {
  id: string;
  salonId: string;
  type: string;
  name: string;
  description: string | null;
  linkId: string;
  affiliateOfferId: string | null;
  influencerContactId: string | null;
  clicksCount: number;
  appointmentsCreated: number;
  createdAt: string;
  updatedAt: string;
}

