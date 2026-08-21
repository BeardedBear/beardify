import ky, { HTTPError } from "ky";

import type { BandMember } from "@/@types/Artist";

import { normalizeString } from "@/helpers/helper";
import { sleep } from "@/helpers/sleep";

/**
 * MusicBrainz API configuration
 */
const MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2/";

/**
 * Interface for MusicBrainz artist
 */
export interface MusicBrainzArtist {
  area?: MusicBrainzArea;
  "begin-area"?: MusicBrainzArea;
  country?: string;
  disambiguation?: string;
  id: string;
  "life-span"?: MusicBrainzLifeSpan;
  name: string;
  relations?: MusicBrainzArtistRelation[];
  score?: number;
  "sort-name": string;
  tags?: MusicBrainzTag[];
  type: "Character" | "Choir" | "Group" | "Orchestra" | "Person" | string;
  "type-id": string;
}

/**
 * Interface for MusicBrainz area/location
 */
interface MusicBrainzArea {
  id: string;
  "life-span": {
    ended: null | string;
  };
  name: string;
  "sort-name": string;
  type: string;
  "type-id": string;
}

/**
 * Interface for MusicBrainz artist relation
 */
interface MusicBrainzArtistRelation {
  artist?: MusicBrainzArtist;
  "attribute-ids": Record<string, string>;
  "attribute-values": Record<string, string>;
  attributes: string[];
  begin: null | string;
  direction: string;
  end: null | string;
  ended: boolean;
  "source-credit": string;
  "target-credit": string;
  "target-type": string;
  type: "allmusic" | "discogs" | "member of band" | "official homepage" | "wikidata" | string;
  "type-id": string;
  url?: {
    id: string;
    resource: string;
  };
}

/**
 * Interface for MusicBrainz artist search results
 */
interface MusicBrainzArtistSearch {
  artists: MusicBrainzArtist[];
  count: number;
  created: string;
  offset: number;
}

/**
 * Interface for MusicBrainz life span
 */
interface MusicBrainzLifeSpan {
  begin: null | string;
  end: null | string;
  ended: null | string;
}

/**
 * Interface for a MusicBrainz release-group (an "album" in the abstract sense,
 * grouping all its editions). Carries the reliable type metadata Spotify lacks.
 */
interface MusicBrainzReleaseGroup {
  "first-release-date"?: string;
  id: string;
  "primary-type": null | string;
  "secondary-types": string[];
  title: string;
}

/**
 * Interface for the release-group browse response
 */
interface MusicBrainzReleaseGroupBrowse {
  "release-group-count": number;
  "release-groups": MusicBrainzReleaseGroup[];
}

/**
 * Interface for MusicBrainz tag
 */
interface MusicBrainzTag {
  count: number;
  name: string;
}

/**
 * Interface for MusicBrainz URL lookup response with artist relations
 */
interface MusicBrainzUrlLookup {
  id: string;
  relations: {
    artist: MusicBrainzArtist;
    direction: string;
    "target-type": string;
    type: string;
  }[];
  resource: string;
}

/**
 * Creates a MusicBrainz API client instance
 */
const musicbrainzClient = ky.create({
  baseUrl: MUSICBRAINZ_API_URL,
  // No client retry: ky retries inside the already-granted queue slot, unpaced, so a 429/503
  // was re-fired within the very second the queue exists to protect. The queue below is the
  // single owner of rate-limit policy; a failed request returns null and the caller moves on.
  retry: { limit: 0 },
  timeout: 10000,
});

/**
 * MusicBrainz allows ~1 request/s per IP for anonymous clients and answers 503 as soon as
 * the rate is exceeded. Callers otherwise fire concurrently — artist search, id lookup and
 * the paginated release-group browse all overlap, and a fast artist-to-artist navigation
 * stacks several such chains — so every request goes through one queue that serializes and
 * spaces them instead of each caller racing the limit on its own.
 */
const MIN_REQUEST_INTERVAL_MS = 1100;
let requestQueue: Promise<unknown> = Promise.resolve();
let lastRequestAt = 0;

/**
 * Build a map of normalized base title (before subtitle separator) -> type.
 * Only includes entries where the base title differs from the full title,
 * enabling fuzzy matching when MB and Spotify use different subtitle phrasings
 * (e.g. MB "Moonage Daydream: A Film by Brett Morgen" vs
 *       Spotify "Moonage Daydream – A Brett Morgen Film").
 * Ambiguous bases (same base, different types) are excluded to avoid false positives.
 */
export function buildBaseTitleMap(groups: MusicBrainzReleaseGroup[]): Map<string, string> {
  const map = new Map<string, string>();
  const ambiguous = new Set<string>();

  groups.forEach((group) => {
    const secondary = group["secondary-types"] ?? [];
    const primary = group["primary-type"];
    let type: null | string = null;

    if (secondary.includes("Live")) type = "Live";
    else if (secondary.includes("Compilation") || secondary.includes("Soundtrack")) type = "Compilation";
    else if (primary === "EP") type = "EP";
    else if (primary === "Album") type = "Album";

    if (!type) return;

    const baseTitle = group.title.split(/:\s+|\s+[–-]\s+/)[0].trim();
    const normalizedBase = normalizeString(baseTitle);
    const normalizedFull = normalizeString(group.title);

    if (normalizedBase === normalizedFull) return;

    if (ambiguous.has(normalizedBase)) return;

    const existing = map.get(normalizedBase);
    if (existing && existing !== type) {
      ambiguous.add(normalizedBase);
      map.delete(normalizedBase);
    } else if (!existing) {
      map.set(normalizedBase, type);
    }
  });

  return map;
}

/**
 * Build a map of normalized release title -> type ("Live" | "Compilation" | "EP"
 * | "Album") from MusicBrainz release-groups.
 *
 * MusicBrainz is the most reliable source for this: "Live" and "Compilation" are
 * explicit secondary types, independent of the primary type, so a live album is
 * tagged primary "Album" + secondary "Live" (unlike Spotify, which mislabels
 * them, and unlike Discogs, whose master entries expose no format string).
 * @param groups - Release-groups from {@link getMusicBrainzReleaseGroups}
 */
export function buildReleaseTypeMap(groups: MusicBrainzReleaseGroup[]): Map<string, string> {
  const map = new Map<string, string>();
  const ambiguous = new Set<string>();

  groups.forEach((group) => {
    const secondary = group["secondary-types"] ?? [];
    const primary = group["primary-type"];
    let type: null | string = null;

    // Secondary types win: a live or compilation album keeps primary "Album".
    if (secondary.includes("Live")) type = "Live";
    else if (secondary.includes("Compilation") || secondary.includes("Soundtrack")) type = "Compilation";
    else if (primary === "EP") type = "EP";
    else if (primary === "Album") type = "Album";

    if (!type) return;

    const key = normalizeString(group.title);
    if (ambiguous.has(key)) return;

    const existing = map.get(key);
    if (existing && existing !== type) {
      // Same normalized title, different types: we can't tell which Spotify release maps to which
      // MB group, so leave it unclassified to avoid false positives.
      ambiguous.add(key);
      map.delete(key);
    } else if (!existing) {
      map.set(key, type);
    }
  });

  return map;
}

/**
 * Extracts band members (with active periods and instruments) from the
 * "member of band" relations of a MusicBrainz group artist.
 * @param artist - The full MusicBrainz artist (fetched with artist-rels)
 * @returns Array of band members, empty when none
 */
export function extractBandMembers(artist: MusicBrainzArtist): BandMember[] {
  if (!artist.relations) return [];

  return artist.relations
    .filter(
      (rel) => rel.type === "member of band" && rel["target-type"] === "artist" && rel.artist,
    )
    .map((rel) => ({
      begin: rel.begin,
      end: rel.end,
      ended: rel.ended,
      id: rel.artist!.id,
      instruments: Array.isArray(rel.attributes) ? rel.attributes : [],
      name: rel.artist!.name,
    }));
}

/**
 * Extracts external IDs (Discogs, Wikidata) from MusicBrainz relations
 */
export function extractExternalIds(artistFull: MusicBrainzArtist): {
  discogsId: null | string;
  wikidataId: null | string;
} {
  let discogsId: null | string = null;
  let wikidataId: null | string = null;

  if (artistFull.relations) {
    // Extract Discogs ID
    const discogsRelation = artistFull.relations.find(
      (rel) =>
        rel.type === "discogs" && rel["target-type"] === "url" && rel.url,
    );

    if (discogsRelation?.url) {
      const match = discogsRelation.url.resource.match(/\/artist\/(\d+)/);
      if (match?.[1]) {
        discogsId = match[1];
      }
    }

    // Extract Wikidata ID
    const wikidataRelation = artistFull.relations.find(
      (rel) =>
        rel.type === "wikidata" && rel["target-type"] === "url" && rel.url,
    );

    if (wikidataRelation?.url) {
      const match = wikidataRelation.url.resource.match(/\/wiki\/(Q\d+)/);
      if (match?.[1]) {
        wikidataId = match[1];
      }
    }
  }

  return { discogsId, wikidataId };
}

/**
 * Get Discogs ID, Wikidata ID and band members from MusicBrainz artist
 * @param musicbrainzId - The MusicBrainz ID of the artist
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to the MusicBrainzArtist object with relations, or null
 */
export async function getIdsFromMusicBrainz(
  musicbrainzId: string,
  signal?: AbortSignal,
): Promise<MusicBrainzArtist | null> {
  return fetchFromMusicBrainz<MusicBrainzArtist>(`artist/${musicbrainzId}`, {
    inc: "artist-rels+url-rels",
  }, signal);
}

/**
 * Browse all release-groups of a MusicBrainz artist (paginated, 100 per page).
 * @param musicbrainzId - The MusicBrainz ID of the artist
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to every release-group, or an empty array on failure
 */
export async function getMusicBrainzReleaseGroups(
  musicbrainzId: string,
  signal?: AbortSignal,
): Promise<MusicBrainzReleaseGroup[]> {
  const PAGE_SIZE = 100;
  const all: MusicBrainzReleaseGroup[] = [];
  let offset = 0;

  for (;;) {
    // Page spacing and abort handling both live in the shared request queue: an aborted
    // browse gets null back immediately and falls out through the check below.
    const data = await fetchFromMusicBrainz<MusicBrainzReleaseGroupBrowse>("release-group", {
      artist: musicbrainzId,
      limit: PAGE_SIZE,
      offset,
    }, signal);

    // null means a fetch/network error — stop, don't confuse with an empty last page.
    if (data === null) break;

    const groups = data["release-groups"];
    if (!groups?.length) break;

    all.push(...groups);
    offset += groups.length;
    if (offset >= data["release-group-count"]) break;
  }

  return all;
}

/**
 * Search for artists by name in MusicBrainz
 * @param artistName - The name of the artist to search for
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to all matching MusicBrainzArtist with the same name, or empty array
 */
export async function searchMusicBrainzArtistId(
  artistName: string,
  signal?: AbortSignal,
): Promise<MusicBrainzArtist[]> {
  const data = await fetchFromMusicBrainz<MusicBrainzArtistSearch>("artist", {
    limit: 10,
    query: `artist:"${artistName}"`,
  }, signal);

  if (data && data.artists && data.artists.length > 0) {
    const normalizedSearchName = normalizeName(artistName);
    return data.artists.filter(
      (artist) => normalizeName(artist.name) === normalizedSearchName,
    );
  }

  return [];
}

/**
 * Search for an artist by Spotify ID via MusicBrainz URL lookup.
 * This avoids homonym issues by matching the exact Spotify URL relationship.
 * @param spotifyId - The Spotify artist ID
 * @param signal - Aborts the request when the caller moves on (e.g. artist navigation)
 * @returns Promise resolving to the MusicBrainzArtist or null
 */
export async function searchMusicBrainzBySpotifyId(
  spotifyId: string,
  signal?: AbortSignal,
): Promise<MusicBrainzArtist | null> {
  const data = await fetchFromMusicBrainz<MusicBrainzUrlLookup>("url", {
    inc: "artist-rels",
    resource: `https://open.spotify.com/artist/${spotifyId}`,
  }, signal);

  if (data?.relations?.length) {
    const artistRel = data.relations.find(
      (rel) => rel["target-type"] === "artist",
    );
    if (artistRel?.artist) return artistRel.artist;
  }

  return null;
}

/**
 * Run a MusicBrainz request once the queue reaches it and the spacing has elapsed.
 * @param task - The request to run
 * @param signal - Skips the slot entirely when the caller has already moved on
 */
function enqueue<T>(task: () => Promise<T>, signal?: AbortSignal): Promise<null | T> {
  const scheduled = requestQueue.then(async (): Promise<null | T> => {
    // Checked before waiting: an abandoned request must not hold the queue for a second.
    if (signal?.aborted) return null;

    const wait = lastRequestAt + MIN_REQUEST_INTERVAL_MS - Date.now();
    if (wait > 0) await sleep(wait);
    if (signal?.aborted) return null;

    lastRequestAt = Date.now();
    return task();
  });

  // The chain must survive a failed request, otherwise one rejection blocks every later one.
  requestQueue = scheduled.then(() => undefined, () => undefined);
  return scheduled;
}

/**
 * Generic fetch function for MusicBrainz API
 * @param path - API endpoint path
 * @param searchParams - Query parameters
 * @returns Promise resolving to the requested data type or null
 */
async function fetchFromMusicBrainz<T>(
  path: string,
  searchParams: Record<string, number | string> = {},
  signal?: AbortSignal,
): Promise<null | T> {
  const request = async (): Promise<null | T> => enqueue(async () => {
    const response = await musicbrainzClient.get(path, {
      searchParams: {
        fmt: "json",
        ...searchParams,
      },
      signal,
    });

    return await response.json<T>();
  }, signal);

  try {
    return await request();
  } catch (error) {
    // MusicBrainz answers 503 whenever its throttle trips, even at the paced rate. Retrying once
    // through the queue puts the second try at least MIN_REQUEST_INTERVAL_MS later, which is what
    // the service asks for. Any other failure (404, timeout, abort) is final.
    if (!(error instanceof HTTPError) || error.response.status !== 503) return null;

    try {
      return await request();
    } catch {
      return null;
    }
  }
}

/**
 * Normalize a string by removing punctuation but keeping accents
 * @param str - The string to normalize
 * @returns The normalized string
 */
function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "") // Remove all punctuation but keep letters (with accents) and numbers
    .replace(/\s+/g, " ") // Normalize whitespace
    .trim();
}
