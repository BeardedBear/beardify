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
export function timecode(date: null | number | undefined): string {
  if (date) {
    const hours = new Date(date).getHours() - 1;
    if (hours > 0) {
      return format(new Date(date), `${hours}:mm:ss`, options);
    }
    return format(new Date(date), "m:ss", options);
  }
  return "";
}

/**
 * Format a duration in milliseconds as a human-readable string with units (e.g. "1 hour 23 minutes 45 seconds").
 * @param date - Duration in milliseconds
 */
export function timecodeWithUnits(date: number): string {
  const hours = new Date(date).getHours() - 1;
  const minutes = new Date(date).getMinutes();
  const seconds = new Date(date).getSeconds();

  return formatDuration({ hours, minutes, seconds }, options);
}
