import { NextResponse } from "next/server";

function escapeIcsText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function formatIcsDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim();
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const details = searchParams.get("details")?.trim() ?? "";
  const location = searchParams.get("location")?.trim() ?? "";

  if (!title || !start || !end) {
    return NextResponse.json(
      {
        error: "INVALID_CALENDAR_EVENT",
        message: "Missing title, start, or end.",
      },
      { status: 400 },
    );
  }

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (
    Number.isNaN(startDate.getTime()) ||
    Number.isNaN(endDate.getTime()) ||
    endDate <= startDate
  ) {
    return NextResponse.json(
      {
        error: "INVALID_CALENDAR_EVENT",
        message: "Calendar event dates are invalid.",
      },
      { status: 400 },
    );
  }

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Maetry//Booking Event//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}`,
    `DTSTAMP:${formatIcsDate(new Date())}`,
    `DTSTART:${formatIcsDate(startDate)}`,
    `DTEND:${formatIcsDate(endDate)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(details)}`,
    `LOCATION:${escapeIcsText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'inline; filename="maetry-booking.ics"',
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
