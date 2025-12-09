import ky from "ky";

/**
 * Wikidata API configuration
 * No authentication required for read-only access, only User-Agent is required
 * See: https://www.wikidata.org/wiki/Wikidata:REST_API/Authentication
 */
const WIKIDATA_API_URL = "https://www.wikidata.org/w/api.php";
const WIKIDATA_ENTITY_URL = "https://www.wikidata.org/wiki/Special:EntityData/";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

/**
 * Wikidata property IDs for music-related data
 */
const WIKIDATA_PROPERTIES = {
  ALBUM_OF_THE_YEAR_ID: "P7050",
  ALLMUSIC_ARTIST_ID: "P1728",
  APPLE_MUSIC_ARTIST_ID: "P3943",
  BANDCAMP_ID: "P3283",
  DEEZER_ARTIST_ID: "P2722",
  DISCOGS_ARTIST_ID: "P1953",
  FACEBOOK_ID: "P2013",
  GENIUS_ARTIST_ID: "P2909",
  IMAGE: "P18",
  INSTAGRAM_USERNAME: "P2003",
  MUSICBRAINZ_ARTIST_ID: "P434",
  OFFICIAL_WEBSITE: "P856",
  RATE_YOUR_MUSIC_ID: "P5404",
  SETLISTFM_ARTIST_ID: "P5356",
  SONGKICK_ARTIST_ID: "P3478",
  SOUNDCLOUD_ID: "P3040",
  SPOTIFY_ARTIST_ID: "P1902",
  TWITTER_USERNAME: "P2002",
  YOUTUBE_CHANNEL_ID: "P2397",
};

/**
 * Interface for Wikidata artist data with all external identifiers
 */
export interface WikidataArtist {
  description: null | string;
  id: string;
  identifiers: WikidataArtistIdentifiers;
  imageUrl: null | string;
  label: null | string;
  wikipediaUrl: null | string;
}

/**
 * External identifiers available from Wikidata
 */
export interface WikidataArtistIdentifiers {
  albumOfTheYearId: null | string;
  allMusicId: null | string;
  appleMusicId: null | string;
  bandcampId: null | string;
  deezerId: null | string;
  discogsId: null | string;
  facebookId: null | string;
  geniusId: null | string;
  instagramUsername: null | string;
  musicbrainzId: null | string;
  officialWebsite: null | string;
  rateYourMusicId: null | string;
  setlistfmId: null | string;
  songkickId: null | string;
  soundcloudId: null | string;
  spotifyId: null | string;
  twitterUsername: null | string;
  youtubeChannelId: null | string;
}

/**
 * Interface for Wikidata claim
 */
interface WikidataClaim {
  mainsnak: {
    datatype: string;
    datavalue?: {
      type: string;
      value: { "numeric-id": number } | { id: string } | string;
    };
    property: string;
    snaktype: string;
  };
  rank: string;
  type: string;
}

/**
 * Interface for Wikidata entity
 */
interface WikidataEntity {
  claims?: Record<string, WikidataClaim[]>;
  descriptions?: Record<string, { language: string; value: string }>;
  id: string;
  labels?: Record<string, { language: string; value: string }>;
  sitelinks?: Record<string, { badges: string[]; site: string; title: string }>;
  type: string;
}

/**
 * Interface for Wikidata search result
 */
interface WikidataSearchResult {
  search: Array<{
    description?: string;
    id: string;
    label: string;
    url: string;
  }>;
  searchinfo: {
    search: string;
  };
  success: number;
}

/**
 * Sections to exclude from Wikipedia content
 */
const EXCLUDED_WIKIPEDIA_SECTIONS = [
  "Band members",
  "Discography",
  "External links",
  "Further reading",
  "Members",
  "Notes",
  "References",
  "See also",
  "Sources",
  "Tours",
  "Awards",
  "Bibliography",
  "Chart performance",
  "Credits",
  "Personnel",
];

/**
 * Creates a Wikidata API client instance
 */
const wikidataClient = ky.create({
  headers: {
    "User-Agent": USER_AGENT,
  },
  retry: {
    limit: 1,
    statusCodes: [429, 503],
  },
  timeout: 10000,
});

/**
 * Get artist data from Wikidata by entity ID
 * @param entityId - The Wikidata entity ID (e.g., Q483)
 * @returns Promise resolving to WikidataArtist or null
 */
export async function getWikidataArtist(entityId: string): Promise<null | WikidataArtist> {
  try {
    const response = await wikidataClient.get(`${WIKIDATA_ENTITY_URL}${entityId}.json`);
    const data = await response.json<{ entities: Record<string, WikidataEntity> }>();

    const entity = data.entities[entityId];
    if (!entity) {
      return null;
    }

    return parseWikidataEntity(entity);
  } catch {
    return null;
  }
}

/**
 * Search and get artist data from Wikidata by name
 * @param artistName - The name of the artist
 * @returns Promise resolving to WikidataArtist or null
 */
export async function getWikidataArtistByName(artistName: string): Promise<null | WikidataArtist> {
  try {
    const entityId = await searchWikidataArtist(artistName);
    if (!entityId) {
      return null;
    }

    return await getWikidataArtist(entityId);
  } catch {
    return null;
  }
}

/**
 * Get Wikidata entity ID by Spotify artist ID
 * Uses SPARQL query to find the entity
 * @param spotifyId - The Spotify artist ID
 * @returns Promise resolving to Wikidata entity ID or null
 */
export async function getWikidataIdBySpotifyId(spotifyId: string): Promise<null | string> {
  try {
    const sparqlQuery = `
      SELECT ?item WHERE {
        ?item wdt:${WIKIDATA_PROPERTIES.SPOTIFY_ARTIST_ID} "${spotifyId}".
      }
      LIMIT 1
    `;

    const params = new URLSearchParams({
      format: "json",
      query: sparqlQuery,
    });

    const response = await wikidataClient.get(`https://query.wikidata.org/sparql?${params.toString()}`, {
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent": USER_AGENT,
      },
    });

    const data = await response.json<{
      results: {
        bindings: Array<{
          item: { type: string; value: string };
        }>;
      };
    }>();

    if (data.results.bindings.length > 0) {
      const entityUri = data.results.bindings[0].item.value;
      // Extract entity ID from URI (e.g., "http://www.wikidata.org/entity/Q483" -> "Q483")
      return entityUri.split("/").pop() || null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Get Wikipedia article content (extract) from a Wikipedia URL
 * @param wikipediaUrl - The full Wikipedia URL
 * @returns Promise resolving to the article extract HTML or null
 */
export async function getWikipediaExtract(wikipediaUrl: string): Promise<null | string> {
  try {
    // Extract language and title from URL
    // e.g., "https://en.wikipedia.org/wiki/Radiohead" -> lang: "en", title: "Radiohead"
    const urlMatch = wikipediaUrl.match(/https?:\/\/(\w+)\.wikipedia\.org\/wiki\/(.+)/);
    if (!urlMatch) {
      return null;
    }

    const [, lang, encodedTitle] = urlMatch;
    const title = decodeURIComponent(encodedTitle);

    // Use MediaWiki API with extracts - full article, HTML format
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      origin: "*",
      prop: "extracts",
      titles: title,
    });

    const response = await fetch(`https://${lang}.wikipedia.org/w/api.php?${params.toString()}`);
    const data = (await response.json()) as {
      query?: {
        pages: Record<
          string,
          {
            extract?: string;
            pageid: number;
            title: string;
          }
        >;
      };
    };

    if (!data.query?.pages) {
      return null;
    }

    // Get the first page (there should only be one)
    const pages = Object.values(data.query.pages);
    if (pages.length === 0 || !pages[0].extract) {
      return null;
    }

    // Clean the HTML to remove unwanted sections
    return cleanWikipediaHtml(pages[0].extract);
  } catch {
    return null;
  }
}

/**
 * Search for an artist in Wikidata by name
 * @param artistName - The name of the artist to search for
 * @returns Promise resolving to the Wikidata entity ID or null
 */
export async function searchWikidataArtist(artistName: string): Promise<null | string> {
  try {
    const params = new URLSearchParams({
      action: "wbsearchentities",
      format: "json",
      language: "en",
      limit: "5",
      origin: "*",
      search: artistName,
      type: "item",
    });

    const response = await wikidataClient.get(`${WIKIDATA_API_URL}?${params.toString()}`);
    const data = await response.json<WikidataSearchResult>();

    if (data.success && data.search.length > 0) {
      // Return the first result (most relevant match)
      return data.search[0].id;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Remove unwanted sections from Wikipedia HTML content
 * @param html - The raw HTML content from Wikipedia
 * @returns Cleaned HTML without excluded sections
 */
function cleanWikipediaHtml(html: string): string {
  // Wikipedia can use different HTML structures for headers:
  // - <h2><span id="...">Title</span></h2>
  // - <h2 id="...">Title</h2>
  // - <h2><span class="mw-headline" id="...">Title</span></h2>
  // We need to match all variations and remove everything until the next h2 or end

  let result = html;

  for (const section of EXCLUDED_WIKIPEDIA_SECTIONS) {
    // Pattern to match h2/h3 containing the section title and everything until the next h2 or end
    const patterns = [
      // Match <h2>...<span>Title</span>...</h2> followed by content until next <h2 or end
      new RegExp(`<h2[^>]*>[^<]*<span[^>]*>[^<]*${section}[^<]*</span>[^<]*</h2>[\\s\\S]*?(?=<h2|$)`, "gi"),
      // Match <h2>Title</h2> directly (no span)
      new RegExp(`<h2[^>]*>\\s*${section}\\s*</h2>[\\s\\S]*?(?=<h2|$)`, "gi"),
      // Match <h3> variants for subsections
      new RegExp(`<h3[^>]*>[^<]*<span[^>]*>[^<]*${section}[^<]*</span>[^<]*</h3>[\\s\\S]*?(?=<h[23]|$)`, "gi"),
    ];

    for (const pattern of patterns) {
      result = result.replace(pattern, "");
    }
  }

  return result;
}

/**
 * Extract string value from a Wikidata claim
 * @param claims - The claims object
 * @param propertyId - The property ID to extract
 * @returns The string value or null
 */
function getClaimStringValue(claims: Record<string, WikidataClaim[]>, propertyId: string): null | string {
  const claim = claims[propertyId]?.[0];
  if (!claim?.mainsnak?.datavalue) {
    return null;
  }

  const value = claim.mainsnak.datavalue.value;
  if (typeof value === "string") {
    return value;
  }

  return null;
}

/**
 * Convert Wikimedia Commons image name to URL
 * @param imageName - The image filename from Wikidata
 * @returns The full image URL or null
 */
function getWikimediaImageUrl(imageName: null | string): null | string {
  if (!imageName) {
    return null;
  }

  // Wikimedia Commons URL format
  const encodedName = encodeURIComponent(imageName.replace(/ /g, "_"));
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodedName}?width=300`;
}

/**
 * Get Wikipedia URL from sitelinks
 * @param sitelinks - The sitelinks object from Wikidata
 * @returns Wikipedia URL or null
 */
function getWikipediaUrl(
  sitelinks: Record<string, { badges: string[]; site: string; title: string }> | undefined,
): null | string {
  if (!sitelinks) {
    return null;
  }

  // Prefer English Wikipedia, then French
  const enWiki = sitelinks["enwiki"];
  if (enWiki) {
    return `https://en.wikipedia.org/wiki/${encodeURIComponent(enWiki.title.replace(/ /g, "_"))}`;
  }

  const frWiki = sitelinks["frwiki"];
  if (frWiki) {
    return `https://fr.wikipedia.org/wiki/${encodeURIComponent(frWiki.title.replace(/ /g, "_"))}`;
  }

  return null;
}

/**
 * Parse a Wikidata entity into a WikidataArtist object
 * @param entity - The raw Wikidata entity
 * @returns WikidataArtist object
 */
function parseWikidataEntity(entity: WikidataEntity): WikidataArtist {
  const claims = entity.claims || {};

  return {
    description: entity.descriptions?.en?.value || entity.descriptions?.fr?.value || null,
    id: entity.id,
    identifiers: {
      albumOfTheYearId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.ALBUM_OF_THE_YEAR_ID),
      allMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.ALLMUSIC_ARTIST_ID),
      appleMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.APPLE_MUSIC_ARTIST_ID),
      bandcampId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.BANDCAMP_ID),
      deezerId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.DEEZER_ARTIST_ID),
      discogsId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.DISCOGS_ARTIST_ID),
      facebookId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.FACEBOOK_ID),
      geniusId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.GENIUS_ARTIST_ID),
      instagramUsername: getClaimStringValue(claims, WIKIDATA_PROPERTIES.INSTAGRAM_USERNAME),
      musicbrainzId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.MUSICBRAINZ_ARTIST_ID),
      officialWebsite: getClaimStringValue(claims, WIKIDATA_PROPERTIES.OFFICIAL_WEBSITE),
      rateYourMusicId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.RATE_YOUR_MUSIC_ID),
      setlistfmId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SETLISTFM_ARTIST_ID),
      songkickId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SONGKICK_ARTIST_ID),
      soundcloudId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SOUNDCLOUD_ID),
      spotifyId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.SPOTIFY_ARTIST_ID),
      twitterUsername: getClaimStringValue(claims, WIKIDATA_PROPERTIES.TWITTER_USERNAME),
      youtubeChannelId: getClaimStringValue(claims, WIKIDATA_PROPERTIES.YOUTUBE_CHANNEL_ID),
    },
    imageUrl: getWikimediaImageUrl(getClaimStringValue(claims, WIKIDATA_PROPERTIES.IMAGE)),
    label: entity.labels?.en?.value || entity.labels?.fr?.value || null,
    wikipediaUrl: getWikipediaUrl(entity.sitelinks),
  };
}
