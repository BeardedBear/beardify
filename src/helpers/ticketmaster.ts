import { TicketmasterEvent, TicketmasterSearchResponse } from "@/@types/Ticketmaster";
import { normalizeString } from "@/helpers/helper";
import { http } from "@/helpers/http";

const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const TICKETMASTER_API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY || "";

/** Whether a Ticketmaster key was bundled; without it every lookup returns nothing. */
export const hasTicketmaster = Boolean(TICKETMASTER_API_KEY);

const eventsCache = new Map<string, TicketmasterEvent[]>();

/**
 * Get upcoming concerts for an artist from the Ticketmaster Discovery API.
 * Keyword search returns loosely matched events, so results are filtered down
 * to the ones whose attraction lineup actually contains the artist name.
 * @param artistName - The artist name to search for
 * @param countryCode - ISO 3166-1 alpha-2 code to filter on, empty for every country
 * @param signal - Cancels the request when the artist or country changes
 * @returns Promise resolving to a list of upcoming events (empty on error, no key, or no data)
 */
export async function getTicketmasterEvents(
  artistName: string,
  countryCode = "",
  signal?: AbortSignal,
): Promise<TicketmasterEvent[]> {
  if (!TICKETMASTER_API_KEY || !artistName) return [];

  const cacheKey = `${artistName}|${countryCode}`;
  const cached = eventsCache.get(cacheKey);
  if (cached) return cached;

  const searchParams: Record<string, number | string> = {
    apikey: TICKETMASTER_API_KEY,
    classificationName: "music",
    keyword: artistName,
    size: 50,
    sort: "date,asc",
  };
  if (countryCode) searchParams.countryCode = countryCode;

  try {
    const data = await http.get(TICKETMASTER_API_URL, { searchParams, signal }).json<TicketmasterSearchResponse>();

    const normalizedName = normalizeString(artistName);
    const events = (data._embedded?.events ?? []).filter(
      (event) =>
        // event.url lands in an <a href> in ArtistConcerts.vue, so keep http(s) only
        /^https?:\/\//i.test(event.url)
        && event._embedded?.attractions?.some(
          (attraction) => normalizeString(attraction.name) === normalizedName,
        ),
    );

    eventsCache.set(cacheKey, events);
    return events;
  } catch {
    return [];
  }
}
