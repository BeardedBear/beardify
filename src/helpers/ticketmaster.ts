import { TicketmasterEvent, TicketmasterSearchResponse } from "@/@types/Ticketmaster";
import { normalizeString } from "@/helpers/helper";
import { http } from "@/helpers/http";

const TICKETMASTER_API_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const TICKETMASTER_API_KEY = import.meta.env.VITE_TICKETMASTER_API_KEY || "";

const eventsCache = new Map<string, TicketmasterEvent[]>();

/**
 * Get upcoming concerts for an artist from the Ticketmaster Discovery API.
 * Keyword search returns loosely matched events, so results are filtered down
 * to the ones whose attraction lineup actually contains the artist name.
 * @param artistName - The artist name to search for
 * @returns Promise resolving to a list of upcoming events (empty on error, no key, or no data)
 */
export async function getTicketmasterEvents(artistName: string): Promise<TicketmasterEvent[]> {
  if (!TICKETMASTER_API_KEY) return [];

  const cached = eventsCache.get(artistName);
  if (cached) return cached;

  try {
    const data = await http
      .get(TICKETMASTER_API_URL, {
        searchParams: {
          apikey: TICKETMASTER_API_KEY,
          classificationName: "music",
          keyword: artistName,
          sort: "date,asc",
        },
      })
      .json<TicketmasterSearchResponse>();

    const normalizedName = normalizeString(artistName);
    const events = (data._embedded?.events ?? []).filter((event) =>
      event._embedded?.attractions?.some(
        (attraction) => normalizeString(attraction.name) === normalizedName,
      ),
    );

    eventsCache.set(artistName, events);
    return events;
  } catch {
    return [];
  }
}
