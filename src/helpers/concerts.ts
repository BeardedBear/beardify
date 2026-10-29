import { format } from "date-fns";

import { Coords, Setlist } from "@/@types/Setlistfm";
import { TicketmasterEvent } from "@/@types/Ticketmaster";
import { setlistDate } from "@/helpers/setlistfm";

/** One show, whichever source it came from, in the shape the concerts tab renders. */
export interface Concert {
  coords: Coords | null;
  countryCode?: string;
  /** ISO "yyyy-MM-dd" */
  date: string;
  id: string;
  location: string;
  songs: string[];
  source: "setlistfm" | "ticketmaster";
  tour?: string;
  url: string;
  venue: string;
}

/**
 * Convert a Ticketmaster event, which carries the ticket link.
 * @param event - Event from the Discovery API
 */
export function fromEvent(event: TicketmasterEvent): Concert {
  const venue = event._embedded?.venues?.[0];
  const loc = venue?.location;
  return {
    coords: loc ? { lat: Number(loc.latitude), lon: Number(loc.longitude) } : null,
    countryCode: venue?.country?.countryCode,
    date: event.dates.start.localDate,
    id: event.id,
    location: [venue?.city?.name, venue?.state?.name, venue?.country?.name].filter(Boolean).join(", "),
    songs: [],
    source: "ticketmaster",
    url: event.url,
    venue: venue?.name ?? "Unknown venue",
  };
}

/**
 * Convert a setlist.fm setlist, which carries the songs played.
 * @param setlist - Setlist from the search endpoint
 */
export function fromSetlist(setlist: Setlist): Concert {
  const city = setlist.venue.city;
  return {
    coords: city?.coords ? { lat: city.coords.lat, lon: city.coords.long } : null,
    countryCode: city?.country?.code,
    date: setlistDate(setlist.eventDate),
    id: setlist.id,
    location: [city?.name, city?.state, city?.country?.name].filter(Boolean).join(", "),
    songs: setlist.sets.set.flatMap((set) => set.song.filter((song) => song.name).map((song) => song.name)),
    source: "setlistfm",
    tour: setlist.tour?.name,
    url: setlist.url,
    venue: setlist.venue.name,
  };
}

/**
 * Split both sources into upcoming (soonest first) and past (newest first) shows.
 * Today counts as upcoming: the show is still ahead.
 * Ticketmaster has the ticket link, so its show wins over setlist.fm's announcement of the same date.
 * ponytail: matched on date alone — an artist rarely plays twice the same day
 * @param events - Ticketmaster events, all upcoming
 * @param setlists - setlist.fm setlists, newest first
 * @param now - Reference date, local time
 */
export function splitConcerts(
  events: TicketmasterEvent[],
  setlists: Setlist[],
  now = new Date(),
): { past: Concert[]; upcoming: Concert[] } {
  const today = format(now, "yyyy-MM-dd");
  const ticketed = events.map(fromEvent);
  const ticketedDates = new Set(ticketed.map((concert) => concert.date));
  const past: Concert[] = [];
  const announced: Concert[] = [];
  for (const concert of setlists.map(fromSetlist)) {
    // ISO strings compare in date order
    if (concert.date < today) past.push(concert);
    else if (!ticketedDates.has(concert.date)) announced.push(concert);
  }
  const upcoming = [...ticketed, ...announced].sort((a, b) => a.date.localeCompare(b.date));
  return { past, upcoming };
}
