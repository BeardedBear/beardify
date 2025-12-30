import ky from "ky";

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
  type: string;
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
  "attribute-ids": Record<string, string>;
  "attribute-values": Record<string, string>;
  attributes: unknown[];
  begin: null | string;
  direction: string;
  end: null | string;
  ended: boolean;
  "source-credit": string;
  "target-credit": string;
  "target-type": string;
  type: "allmusic" | "discogs" | "official homepage" | "wikidata" | string;
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
  ended: null | string;
}

/**
 * Interface for MusicBrainz tag
 */
interface MusicBrainzTag {
  count: number;
  name: string;
}

/**
 * Creates a MusicBrainz API client instance
 */
const musicbrainzClient = ky.create({
  prefixUrl: MUSICBRAINZ_API_URL,
  retry: {
    limit: 1,
    statusCodes: [429, 503],
  },
  timeout: 10000,
});

/**
 * Get Discogs ID and Wikidata ID from MusicBrainz artist
 * @param musicbrainzId - The MusicBrainz ID of the artist
 * @returns Promise resolving to the MusicBrainzArtist object with relations, or null
 */
export async function getIdsFromMusicBrainz(musicbrainzId: string): Promise<MusicBrainzArtist | null> {
  return fetchFromMusicBrainz<MusicBrainzArtist>(`artist/${musicbrainzId}`, {
    inc: "url-rels",
  });
}

/**
 * Search for an artist by name in MusicBrainz
 * @param artistName - The name of the artist to search for
 * @returns Promise resolving to the first matching MusicBrainzArtist or null
 */
export async function searchMusicBrainzArtistId(artistName: string): Promise<MusicBrainzArtist | null> {
  const data = await fetchFromMusicBrainz<MusicBrainzArtistSearch>("artist", {
    limit: 1,
    query: `artist:"${artistName}"`,
  });

  if (data && data.artists && data.artists.length > 0) {
    return data.artists[0];
  }

  return null;
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
): Promise<null | T> {
  try {
    const response = await musicbrainzClient.get(path, {
      searchParams: {
        fmt: "json", // Always request JSON format
        ...searchParams,
      },
    });

    return await response.json<T>();
  } catch (error) {
    console.error(`Error fetching MusicBrainz data from ${path}:`, error);
    return null;
  }
}
