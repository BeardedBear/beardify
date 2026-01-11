import ky from "ky";

import { DiscogsArtist, DiscogsArtistReleasesResponse, DiscogsRelease } from "@/@types/Artist";
import { normalizeString } from "@/helpers/helper";

/**
 * Discogs API configuration
 */
const DISCOGS_API_URL = "https://api.discogs.com/";
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN || "";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

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
 * Creates a Discogs API client instance
 */
const discogsClient = ky.create({
  headers: {
    Authorization: `Discogs token=${DISCOGS_TOKEN}`,
    "User-Agent": USER_AGENT,
  },
  prefixUrl: DISCOGS_API_URL,
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

/**
 * Processes Discogs releases to create a map of title -> release type (EP, Album)
 */

export function processDiscogsReleases(releases: DiscogsRelease[]): Map<string, string> {
  const releaseMap = new Map<string, string>();

  releases.forEach((release) => {
    const normalizedTitle = normalizeString(release.title);

    if (release.type === "master" && release.format) {
      const format = release.format.toLowerCase();

      if (format.includes("ep")) {
        releaseMap.set(normalizedTitle, "EP");
      } else if (
        format.includes("album")
        || format.includes("lp")
        || format.includes("vinyl")
        || format.includes("cd")
      ) {
        releaseMap.set(normalizedTitle, "Album");
      }
    }
  });

  return releaseMap;
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
    const response = await discogsClient.get(path, { searchParams });
    return await response.json<T>();
  } catch {
    return null;
  }
}
