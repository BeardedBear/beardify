import ky from "ky";

import { DiscogsArtist } from "@/@types/Artist";

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
const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer" class="discogs-link"';

/**
 * Discogs entity types configuration
 * Maps entity type letter to URL path and display text
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
  try {
    if (!DISCOGS_TOKEN) {
      console.warn("Discogs token not configured");
      return null;
    }

    const response = await discogsClient.get(`artists/${discogsId}`);
    const data = await response.json<DiscogsArtist>();

    return data;
  } catch (error) {
    console.error("Error fetching Discogs artist:", error);
    return null;
  }
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
  let result = text;

  // Escape HTML to prevent XSS
  result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  );

  // [url]http://...[/url] -> <a href="...">...</a>
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  // Convert newlines to <br> tags
  result = result.replace(/\n/g, "<br>");

  return result;
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
