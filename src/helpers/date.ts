// https://date-fns.org/v2.27.0/docs/format
import { parseISO } from "date-fns";
import { format } from "date-fns/format";
import { formatDuration } from "date-fns/formatDuration";
import { enUS } from "date-fns/locale";

const options = { locale: enUS };

/**
 * Format a timestamp or date string as "d MMM y" (e.g. "17 May 2026").
 * @param date - Unix timestamp (ms) or any date string accepted by `new Date()`
 */
export function date(date: number | string): string {
  return format(new Date(date), "d MMM y", options);
}

/**
 * Format an ISO date string using the browser locale.
 * Handles year-only strings ("1999"), full ISO dates, and invalid values gracefully.
 * @param date - ISO 8601 date string or year string
 * @returns Formatted date string, or the original value if parsing fails
 */
export function formatDate(date?: null | string): string {
  if (!date) return "";
  // If just a year (e.g. "1999") keep as-is
  if (/^\d{4}$/.test(date)) return date;

  try {
    const parsed = parseISO(date as string);
    const d = !isNaN(parsed.getTime()) ? parsed : new Date(date as string);
    if (isNaN(d.getTime())) return date as string;

    // Use browser locale when available, fallback to en-US
    const locale
      = typeof navigator !== "undefined" && (navigator as unknown as { language?: string }).language
        ? (navigator as unknown as { language?: string }).language
        : "en-US";

    const formatter = new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return formatter.format(d);
  } catch {
    return date as string;
  }
}

/**
 * Format a duration in milliseconds as a compact timecode string ("m:ss" or "h:mm:ss").
 * @param date - Duration in milliseconds
 * @returns Timecode string, or empty string if date is falsy
 */
/*
 * Plain arithmetic on the millisecond count, not `new Date(ms).getHours()`.
 *
 * That trick read the epoch offset back as a *local* clock time, so the result
 * depended on where the reader was sitting: a 3:59 track rendered as "18:03:59"
 * in New York and "8:03:59" in Tokyo, and even in UTC an hour-long album came
 * out as "4:20" instead of "1:04:20". Only Europe/Paris was right. It never
 * showed up locally, but the public web build and every /share link are opened
 * from other timezones.
 * @param date - Duration in milliseconds
 */
export function timecode(date: null | number | undefined): string {
  if (!date) return "";

  const totalSeconds = Math.floor(date / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number): string => String(value).padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}

/**
 * Format a duration in milliseconds as a human-readable string with units (e.g. "1 hour 23 minutes 45 seconds").
 * @param date - Duration in milliseconds
 */
export function timecodeWithUnits(date: number): string {
  // Timezone-free for the same reason as `timecode` above.
  const totalSeconds = Math.floor(date / 1000);

  return formatDuration(
    {
      hours: Math.floor(totalSeconds / 3600),
      minutes: Math.floor((totalSeconds % 3600) / 60),
      seconds: totalSeconds % 60,
    },
    options,
  );
}
