export type NativePlatformTarget = "android" | "apple";

type MapsLinkParams = {
  address: string;
  salonName: string;
};

type CalendarLinkParams = {
  details: string;
  endDate: Date;
  location: string;
  startDate: Date;
  title: string;
};

function formatGoogleCalendarDate(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

export function buildPlatformMapsUrl(
  platform: NativePlatformTarget,
  { address, salonName }: MapsLinkParams,
): string {
  if (platform === "android") {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${salonName} ${address}`)}`;
  }

  return `https://maps.apple.com/?q=${encodeURIComponent(salonName)}&address=${encodeURIComponent(address)}`;
}

export function buildPlatformCalendarUrl(
  platform: NativePlatformTarget,
  { details, endDate, location, startDate, title }: CalendarLinkParams,
): string {
  if (platform === "android") {
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGoogleCalendarDate(startDate)}/${formatGoogleCalendarDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
  }

  const params = new URLSearchParams({
    details,
    end: endDate.toISOString(),
    location,
    start: startDate.toISOString(),
    title,
  });

  return `/api/calendar/booking-event?${params.toString()}`;
}
