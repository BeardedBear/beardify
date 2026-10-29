import { Coords, SetlistPage } from "@/@types/Setlistfm";
import { http } from "@/helpers/http";

// Relayed: setlist.fm has no CORS and the key stays server-side (netlify/functions/setlistfm.mts).
// ponytail: no Tauri path — the desktop build has no function host, so the tab stays empty there.
const SETLISTFM_URL = `${location.origin}/.netlify/functions/setlistfm/`;

/**
 * Great-circle distance (haversine), good to a few km — plenty for "is it near me".
 * @param from - First point
 * @param to - Second point
 * @returns Distance in kilometres
 */
export function distanceKm(from: Coords, to: Coords): number {
  const rad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLon = rad(to.lon - from.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/**
 * Get one page (20 items, newest first) of an artist's setlists.
 * @param musicbrainzId - setlist.fm keys artists by MusicBrainz ID
 * @param page - 1-based page number
 * @param countryCode - ISO 3166-1 alpha-2 code to filter on, empty for every country
 * @returns The page, or null on error (404 = no setlist matching)
 */
export async function getSetlists(musicbrainzId: string, page = 1, countryCode = ""): Promise<null | SetlistPage> {
  const searchParams: Record<string, number | string> = { artistMbid: musicbrainzId, p: page };
  if (countryCode) searchParams.countryCode = countryCode;
  try {
    return await http.get(`${SETLISTFM_URL}search/setlists`, { searchParams }).json<SetlistPage>();
  } catch {
    return null;
  }
}

/**
 * Whether a concert hasn't happened yet. Today counts as upcoming: the show is still ahead.
 * @param eventDate - Date as returned by setlist.fm ("dd-MM-yyyy")
 * @param now - Reference date, local time
 */
export function isUpcoming(eventDate: string, now = new Date()): boolean {
  const today = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
  // ISO strings compare in date order
  return setlistDate(eventDate) >= today;
}

/**
 * Convert setlist.fm's "dd-MM-yyyy" event date to ISO "yyyy-MM-dd".
 * @param eventDate - Date as returned by setlist.fm
 * @returns ISO date, or the input unchanged when it doesn't match
 */
export function setlistDate(eventDate: string): string {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(eventDate);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : eventDate;
}
