import { NextRequest, NextResponse } from "next/server";

import {
  SUPPORT_EMAIL,
} from "@/features/home-experience/model/content";
import { monitoredRoute } from "@/lib/monitoring/server";

const SUPPORTED_ROLES = new Set([
  "client",
  "salon_owner",
  "team_member",
  "partner_other",
]);

const SUPPORTED_ISSUE_TYPES = new Set([
  "booking",
  "account",
  "billing",
  "technical",
  "partnership",
  "privacy",
]);

type AttachmentMeta = {
  name: string;
  size: number;
  type: string;
};

type SupportPayload = {
  locale?: string;
  role?: string;
  issueType?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  subject?: string;
  description?: string;
  consent?: boolean;
  metadata?: Record<string, string>;
  attachments?: AttachmentMeta[];
};

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMetadata(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([key, entryValue]) => {
      if (typeof entryValue !== "string") {
        return [];
      }

      const trimmed = entryValue.trim();
      return trimmed.length > 0 ? [[key, trimmed]] : [];
    }),
  );
}

function normalizeAttachments(value: unknown): AttachmentMeta[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      return [];
    }

    const name = normalizeText((entry as AttachmentMeta).name);
    const type = normalizeText((entry as AttachmentMeta).type);
    const size = Number((entry as AttachmentMeta).size);

    if (!name || !Number.isFinite(size) || size < 0) {
      return [];
    }

    return [{ name, size, type }];
  });
}

function validatePayload(body: SupportPayload) {
  const errors: Record<string, string> = {};
  const metadata = normalizeMetadata(body.metadata);

  if (!SUPPORTED_ROLES.has(normalizeText(body.role))) {
    errors.role = "INVALID_ROLE";
  }

  if (!SUPPORTED_ISSUE_TYPES.has(normalizeText(body.issueType))) {
    errors.issueType = "INVALID_ISSUE_TYPE";
  }

  if (!isNonEmptyString(body.fullName)) {
    errors.fullName = "REQUIRED";
  }

  if (!isNonEmptyString(body.email) || !body.email.includes("@")) {
    errors.email = "INVALID_EMAIL";
  }

  if (!isNonEmptyString(body.subject)) {
    errors.subject = "REQUIRED";
  }

  if (!isNonEmptyString(body.description)) {
    errors.description = "REQUIRED";
  }

  if (body.consent !== true) {
    errors.consent = "REQUIRED";
  }

  switch (normalizeText(body.issueType)) {
    case "booking":
      if (!metadata.bookingSubType) errors.bookingSubType = "REQUIRED";
      if (!metadata.salonName) errors.salonName = "REQUIRED";
      if (!metadata.appointmentDate) errors.appointmentDate = "REQUIRED";
      if (!metadata.appointmentTime) errors.appointmentTime = "REQUIRED";
      if (!metadata.location) errors.location = "REQUIRED";
      break;
    case "account":
      if (!metadata.accountEmail) errors.accountEmail = "REQUIRED";
      if (!metadata.affectedRole) errors.affectedRole = "REQUIRED";
      if (!metadata.accountProblemType) errors.accountProblemType = "REQUIRED";
      break;
    case "billing":
      if (!metadata.billingSubType) errors.billingSubType = "REQUIRED";
      if (!metadata.productOrPlan) errors.productOrPlan = "REQUIRED";
      if (!metadata.chargeDate) errors.chargeDate = "REQUIRED";
      break;
    case "technical":
      if (!metadata.platform) errors.platform = "REQUIRED";
      if (!metadata.occurredAt) errors.occurredAt = "REQUIRED";
      if (!metadata.severity) errors.severity = "REQUIRED";
      if (!metadata.reproductionSteps) errors.reproductionSteps = "REQUIRED";
      break;
    case "privacy":
      if (!metadata.privacyRequestType) errors.privacyRequestType = "REQUIRED";
      if (!metadata.accountEmail) errors.accountEmail = "REQUIRED";
      if (!metadata.region) errors.region = "REQUIRED";
      break;
    default:
      break;
  }

  return { errors, metadata };
}

function getTargetEmail(issueType: string): string {
  if (issueType === "partnership") {
    return process.env.SUPPORT_PARTNERSHIP_EMAIL || SUPPORT_EMAIL;
  }

  if (issueType === "privacy") {
    return process.env.SUPPORT_PRIVACY_EMAIL || SUPPORT_EMAIL;
  }

  return SUPPORT_EMAIL;
}

function toReadableLabel(value: string): string {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function buildMailtoBody(
  body: SupportPayload,
  metadata: Record<string, string>,
  attachments: AttachmentMeta[],
): { href: string; bodyTruncated: boolean } {
  const issueType = normalizeText(body.issueType);
  const role = normalizeText(body.role);
  const lines = [
    `Support request`,
    ``,
    `Name: ${normalizeText(body.fullName)}`,
    `Email: ${normalizeText(body.email)}`,
    `Role: ${toReadableLabel(role)}`,
    `Issue type: ${toReadableLabel(issueType)}`,
  ];

  if (isNonEmptyString(body.phone)) {
    lines.push(`Phone / Telegram: ${normalizeText(body.phone)}`);
  }

  const metadataEntries = Object.entries(metadata);
  if (metadataEntries.length > 0) {
    lines.push("", "Details:");
    metadataEntries.forEach(([key, value]) => {
      lines.push(`- ${toReadableLabel(key)}: ${value}`);
    });
  }

  if (attachments.length > 0) {
    lines.push("", "Selected attachments:");
    attachments.forEach((file) => {
      lines.push(`- ${file.name} (${Math.round(file.size / 1024)} KB)`);
    });
    lines.push(
      "Note: if your email client does not attach these files automatically, add them manually before sending.",
    );
  }

  lines.push("", "Description:");

  const description = normalizeText(body.description);
  const maxDescriptionLength = 1200;
  const bodyTruncated = description.length > maxDescriptionLength;
  lines.push(truncate(description, maxDescriptionLength));

  if (bodyTruncated) {
    lines.push(
      "",
      "Note: the description was shortened for the email draft. You can add more details before sending.",
    );
  }

  const targetEmail = getTargetEmail(issueType);
  const subject = `[Maetry support][${issueType || "general"}] ${truncate(
    normalizeText(body.subject),
    90,
  )}`;
  const href = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;

  return { href, bodyTruncated };
}

export async function POST(request: NextRequest) {
  return monitoredRoute(request, "support_request_prepare", async () => {
    let body: SupportPayload;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "INVALID_BODY",
          message: "Invalid request body",
        },
        { status: 400 },
      );
    }

    const attachments = normalizeAttachments(body.attachments);
    const { errors, metadata } = validatePayload(body);

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        {
          error: "VALIDATION_FAILED",
          fieldErrors: errors,
        },
        { status: 422 },
      );
    }

    const normalizedIssueType = normalizeText(body.issueType);
    const targetEmail = getTargetEmail(normalizedIssueType);
    const webhookUrl = process.env.SUPPORT_WEBHOOK_URL?.trim();

    if (webhookUrl) {
      try {
        const webhookResponse = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attachments,
            email: normalizeText(body.email),
            fullName: normalizeText(body.fullName),
            issueType: normalizedIssueType,
            locale: normalizeText(body.locale),
            metadata,
            phone: normalizeText(body.phone),
            role: normalizeText(body.role),
            subject: normalizeText(body.subject),
            description: normalizeText(body.description),
            consent: true,
          }),
        });

        if (webhookResponse.ok) {
          return NextResponse.json({
            delivery: "webhook",
            targetEmail,
          });
        }
      } catch {
        // Fall through to mailto fallback.
      }
    }

    const mailto = buildMailtoBody(body, metadata, attachments);

    return NextResponse.json({
      attachmentCount: attachments.length,
      bodyTruncated: mailto.bodyTruncated,
      delivery: "mailto",
      mailtoHref: mailto.href,
      targetEmail,
    });
  });
}
