import ky from "ky";

import { DiscogsArtist, DiscogsArtistReleasesResponse, DiscogsRelease, MemberInfo } from "@/@types/Artist";
import { normalizeString } from "@/helpers/helper";

const DISCOGS_API_URL = "https://api.discogs.com/";
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN || "";

/**
 * Discogs markup parsing configuration
 */
const DISCOGS_BASE_URL = "https://www.discogs.com";
const LINK_ATTRS = "target=\"_blank\" rel=\"noopener noreferrer\" class=\"discogs-link\"";

/**
 * Discogs entity types configuration
 */
const DISCOGS_ENTITIES: Record<string, { path: string; searchType: string; text: string }> = {
  a: { path: "artist", searchType: "artist", text: "artist" },
  l: { path: "label", searchType: "label", text: "label" },
  m: { path: "master", searchType: "master", text: "release" },
  r: { path: "release", searchType: "release", text: "release" },
};

/**
 * Text formatting tags configuration
 */
const TEXT_FORMATS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
  { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
  { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
];

/**
 * Creates a Discogs API client instance.
 *
 * Auth uses the `token` query param (added in `fetchFromDiscogs`) rather than an
 * `Authorization` header: a custom header would trigger a CORS preflight that the
 * Discogs API does not answer, blocking every browser request. The `User-Agent`
 * header is likewise omitted because browsers forbid overriding it from fetch.
 */
const discogsClient = ky.create({
  baseUrl: DISCOGS_API_URL,
  retry: {
    limit: 1,
    statusCodes: [429, 503],
  },
  timeout: 10000,
});

/**
 * Get artist data from Discogs
 * @param discogsId - The Discogs ID of the artist
 * @returns Promise resolving to the full DiscogsArtist object or null
 */
export async function getDiscogsArtist(discogsId: string): Promise<DiscogsArtist | null> {
  return fetchFromDiscogs<DiscogsArtist>(`artists/${discogsId}`);
}

/**
 * In-memory cache for member popover lookups (keyed by discogs id or normalized name)
 */
const memberInfoCache = new Map<string, MemberInfo | null>();

/**
 * Get artist releases from Discogs
 * @param discogsId - The Discogs ID of the artist
 * @param page - Page number (default: 1)
 * @param perPage - Results per page (default: 100, max: 100)
 * @returns Promise resolving to DiscogsArtistReleasesResponse or null
 */
export async function getDiscogsArtistReleases(
  discogsId: string,
  page = 1,
  perPage = 100,
): Promise<DiscogsArtistReleasesResponse | null> {
  return fetchFromDiscogs<DiscogsArtistReleasesResponse>(`artists/${discogsId}/releases`, {
    page: page.toString(),
    per_page: perPage.toString(),
    sort: "year",
    sort_order: "desc",
  });
}

/**
 * Get condensed member info (image, real name, band history) for the member
 * popover. Resolves by Discogs id when known, otherwise searches by name.
 * Results are cached for the session.
 * @param options - The member's Discogs id (preferred) and/or name
 * @returns Promise resolving to MemberInfo or null when nothing is found
 */
export async function getDiscogsMemberInfo(options: {
  discogsId?: null | number;
  name: string;
}): Promise<MemberInfo | null> {
  const cacheKey = options.discogsId ? `id:${options.discogsId}` : `name:${normalizeString(options.name)}`;
  const cached = memberInfoCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const id = options.discogsId ?? (await searchDiscogsArtistId(options.name));
  if (!id) {
    memberInfoCache.set(cacheKey, null);
    return null;
  }

  const artist = await getDiscogsArtist(id.toString());
  if (!artist) {
    memberInfoCache.set(cacheKey, null);
    return null;
  }

  const info: MemberInfo = {
    discogsId: id,
    groups: (artist.groups ?? []).map((group) => ({
      active: group.active,
      name: cleanDiscogsName(group.name),
    })),
    image: artist.images?.[0]?.uri || artist.images?.[0]?.uri150 || null,
    profileUrl: `https://www.discogs.com/artist/${id}`,
    realName: artist.realname?.trim() || null,
  };
  memberInfoCache.set(cacheKey, info);
  return info;
}

/**
 * Parse Discogs markup and convert to HTML
 * Supported tags:
 * - [i], [b], [u] -> text formatting
 * - [a], [l], [r], [m] -> Discogs entity links (by ID or name)
 * - [url] -> external links
 * @param text - The Discogs markup text to parse
 * @returns HTML string with converted markup
 */
export function parseDiscogsMarkup(text: string): string {
  let result = escapeHtml(text);

  // Apply text formatting
  for (const { pattern, replacement } of TEXT_FORMATS) {
    result = result.replace(pattern, replacement);
  }

  // [x123456] or [x=123456] -> link to Discogs entity by ID
  result = result.replace(/\[([almr])=?(\d+)\]/gi, (_, type, id) => createDiscogsLinkById(type, id));

  // [x=Name] -> link to Discogs search by name (non-numeric)
  result = result.replace(/\[([al])=([^\]]+)\]/gi, (_, type, name) => createDiscogsSearchLink(type, name));

  // [url=http://...]text[/url] -> <a href="...">text</a>
  result = result.replace(
    /\[url=(.*?)\](.*?)\[\/url\]/gi,
    "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">$2</a>",
  );

  // [url]http://...[/url] -> <a href="...">...</a>
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, "<a href=\"$1\" target=\"_blank\" rel=\"noopener noreferrer\">$1</a>");

  // Convert newlines to <br> tags
  result = result.replace(/\n/g, "<br>");

  return result;
}

// Priority for type upgrades: Live beats Compilation beats EP beats Album.
// Multiple editions of the same release can have different formats; we keep
// the most specific type (e.g. a CD and a Live-DVD entry for the same title
// → the title is classified as "Live").
const RELEASE_TYPE_PRIORITY: Record<string, number> = {
  Album: 1,
  Compilation: 2,
  EP: 3,
  Live: 4,
};

/**
 * Build a map of normalized release title -> type ("Live" | "Compilation" | "EP"
 * | "Album") from Discogs release entries.
 *
 * Important: Discogs **master** entries always have `format: null`. The format
 * string (e.g. "CD, Album, Live") only exists on per-edition **release** entries.
 * We therefore scan `type === "release"` rows and group by normalized title,
 * keeping the highest-priority type when multiple editions of the same title
 * carry conflicting formats.
 */
export function processDiscogsReleases(releases: DiscogsRelease[]): Map<string, string> {
  const releaseMap = new Map<string, string>();

  releases.forEach((release) => {
    if (release.type !== "release" || !release.format) return;

    const normalizedTitle = normalizeString(release.title);
    const format = release.format.toLowerCase();
    let type: null | string = null;

    // "Live"/"Compilation" are layered descriptors (e.g. "CD, Album, Live"),
    // so they must win over the generic Album/EP checks below.
    if (format.includes("live")) type = "Live";
    else if (format.includes("compilation")) type = "Compilation";
    else if (format.includes("ep")) type = "EP";
    else if (format.includes("album") || format.includes("lp") || format.includes("vinyl") || format.includes("cd")) {
      type = "Album";
    }

    if (type) {
      const existing = releaseMap.get(normalizedTitle);
      if (!existing || (RELEASE_TYPE_PRIORITY[type] ?? 0) > (RELEASE_TYPE_PRIORITY[existing] ?? 0)) {
        releaseMap.set(normalizedTitle, type);
      }
    }
  });

  return releaseMap;
}

/**
 * Search Discogs for an artist by name and return the best matching id.
 * @param name - The artist name to search for
 * @returns Promise resolving to the Discogs artist id or null
 */
export async function searchDiscogsArtistId(name: string): Promise<null | number> {
  const data = await fetchFromDiscogs<{ results: { id: number; title: string }[] }>("database/search", {
    per_page: "5",
    q: name,
    type: "artist",
  });

  if (!data?.results?.length) return null;

  const normalizedQuery = normalizeString(name);
  const exact = data.results.find((result) => normalizeString(cleanDiscogsName(result.title)) === normalizedQuery);
  return (exact ?? data.results[0]).id;
}

/**
 * Processes Discogs releases to create a map of title -> release type (EP, Album)
 */

/**
 * Strip the Discogs disambiguation suffix, e.g. "Exodus (6)" -> "Exodus".
 */
function cleanDiscogsName(name: string): string {
  return name.replace(/\s*\(\d+\)$/, "");
}

/**
 * Create a Discogs link by ID
 */
function createDiscogsLinkById(type: string, id: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}${id}]`;
  return `<a href="${DISCOGS_BASE_URL}/${entity.path}/${id}" ${LINK_ATTRS}>${entity.text}</a>`;
}

/**
 * Create a Discogs search link by name
 */
function createDiscogsSearchLink(type: string, name: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}=${name}]`;
  return `<a href="${DISCOGS_BASE_URL}/search/?q=${encodeURIComponent(name)}&type=${entity.searchType}" ${LINK_ATTRS}>${name}</a>`;
}

/**
 * Helper to escape HTML characters
 */
function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * Generic fetch function for Discogs API
 * @param path - API endpoint path
 * @param searchParams - Query parameters
 * @returns Promise resolving to the requested data type or null
 */
async function fetchFromDiscogs<T>(path: string, searchParams?: Record<string, string>): Promise<null | T> {
  if (!DISCOGS_TOKEN) {
    return null;
  }

  try {
    const response = await discogsClient.get(path, {
      searchParams: { ...searchParams, token: DISCOGS_TOKEN },
    });
    return await response.json<T>();
  } catch {
    return null;
  }
}
