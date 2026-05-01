export const DAYS_AHEAD = 21;

export function getTimeZoneParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  });

  return formatter.formatToParts(date).reduce<Record<string, string>>(
    (acc, part) => {
      if (part.type !== "literal") {
        acc[part.type] = part.value;
      }
      return acc;
    },
    {},
  );
}

export function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );

  return (asUtc - date.getTime()) / 60_000;
}

export function getDateKeyForTimeZone(date: Date, timeZone: string) {
  const parts = getTimeZoneParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const nextDate = new Date(Date.UTC(year, month - 1, day + days, 12));
  const nextYear = nextDate.getUTCFullYear();
  const nextMonth = `${nextDate.getUTCMonth() + 1}`.padStart(2, "0");
  const nextDay = `${nextDate.getUTCDate()}`.padStart(2, "0");

  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function toTimeZoneIsoDate(
  dateKey: string,
  timeZone: string,
  hour = 12,
) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, 0, 0));
  const firstOffset = getTimeZoneOffsetMinutes(guessUtc, timeZone);
  const firstPass = new Date(guessUtc.getTime() - firstOffset * 60_000);
  const secondOffset = getTimeZoneOffsetMinutes(firstPass, timeZone);
  const resolvedDate =
    firstOffset === secondOffset
      ? firstPass
      : new Date(guessUtc.getTime() - secondOffset * 60_000);

  return resolvedDate.toISOString();
}

export function formatDateLabel(
  dateKey: string,
  locale: string,
  timeZone: string,
) {
  const date = new Date(toTimeZoneIsoDate(dateKey, timeZone));

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone,
    weekday: "short",
  }).format(date);
}

/** Заголовок выбранного слота: дата как в локали + время в локальном 12/24h. */
export function formatSlotSummaryTitle(
  date: Date,
  locale: string,
  timeZone: string,
) {
  const dateFmt = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone,
    weekday: "short",
  });
  const timeFmt = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZone,
  });

  const dParts = dateFmt.formatToParts(date);

  const datePortion = dParts
    .map((p) => {
      if (p.type === "weekday") {
        const w = p.value.replace(/\.$/, "").trim();
        return w.length > 0
          ? w.charAt(0).toLocaleUpperCase(locale) + w.slice(1)
          : "";
      }
      if (p.type === "month") {
        return p.value.replace(/\.$/, "").trim();
      }
      if (p.type === "day") {
        return p.value;
      }
      if (p.type === "literal") {
        return p.value;
      }
      return "";
    })
    .join("");

  return `${datePortion} • ${timeFmt.format(date)}`;
}

export function getNightPeriodLabel(locale: string) {
  const lowerLocale = locale.toLowerCase();
  if (lowerLocale.startsWith("ru")) return "Ночь";
  if (lowerLocale.startsWith("es")) return "Noche";
  return "Night";
}

export function getVisitOrigin() {
  if (typeof window === "undefined") return "";

  const configuredShortlinkHost =
    process.env.NEXT_PUBLIC_SHORTLINK_HOST || "link.maetry.com";
  const shortlinkHost = configuredShortlinkHost
    .replace(/^https?:\/\//, "")
    .split("/")[0];

  if (
    window.location.hostname === shortlinkHost ||
    window.location.hostname.includes(shortlinkHost)
  ) {
    const mainHost = window.location.hostname.replace(/^link\./, "");
    return `${window.location.protocol}//${mainHost}`;
  }

  return window.location.origin;
}

export function buildVisitUrl(locale: string, appointmentId: string) {
  return new URL(
    `/${locale}/visit/${appointmentId}`,
    getVisitOrigin(),
  ).toString();
}

export function inferProcedureCategoryLabel(group: { title: string }) {
  const title = group.title.trim();

  for (const separator of [":", " - ", " — ", " / "]) {
    if (title.includes(separator)) {
      const prefix = title.split(separator)[0]?.trim();
      if (prefix && prefix.length >= 3 && prefix.length <= 28) {
        return prefix;
      }
    }
  }

  return null;
}

/** id «прочих» услуг без тега и без префикса в названии. */
export const BOOKING_UNCATEGORIZED_SERVICE_CATEGORY_ID =
  "__booking_uncategorized__";

/**
 * Категория из первого тега сервиса API (например spa → «SPA» в текущей локали).
 */
export function inferProcedureCategoryFromTags(group: {
  procedures: Array<{ serviceTags?: Array<{ tag: string; translate: string }> }>;
}): { categoryId: string; title: string } | null {
  const primary = group.procedures[0]?.serviceTags?.[0];
  if (!primary) {
    return null;
  }

  return {
    categoryId: primary.tag,
    title: primary.translate?.trim() || primary.tag,
  };
}

export function getProcedureSelectionKey(procedure: {
  id: string;
  masterId?: string | null;
}) {
  return `${procedure.id}:${procedure.masterId ?? "any"}`;
}

export function buildSlotsCacheKey(
  procedure: { id: string; masterId?: string | null },
  dateKey: string,
) {
  return `${getProcedureSelectionKey(procedure)}|${dateKey}`;
}
