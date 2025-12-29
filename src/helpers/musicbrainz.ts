import ky from "ky";

/**
 * MusicBrainz API configuration
 */
const MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2/";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

/**
 * Interface for MusicBrainz area/location
 */
interface MusicBrainzArea {
  id: string;
  type: string;
  "type-id": string;
  name: string;
  "sort-name": string;
  "life-span": {
    ended: string | null;
  };
}

/**
 * Interface for MusicBrainz life span
 */
interface MusicBrainzLifeSpan {
  begin: string | null;
  ended: string | null;
}

/**
 * Interface for MusicBrainz tag
 */
interface MusicBrainzTag {
  count: number;
  name: string;
}

/**
 * Interface for MusicBrainz artist relation
 */
interface MusicBrainzArtistRelation {
  "attribute-ids": Record<string, string>;
  begin: string | null;
  "target-credit": string;
  direction: string;
  "target-type": string;
  "attribute-values": Record<string, string>;
  ended: boolean;
  type: "discogs" | "wikidata" | "allmusic" | "official homepage" | string;
  attributes: unknown[];
  "type-id": string;
  url?: {
    id: string;
    resource: string;
  };
  end: string | null;
  "source-credit": string;
}

/**
 * Interface for MusicBrainz artist
 */
export interface MusicBrainzArtist {
  id: string;
  type: string;
  "type-id": string;
  score?: number;
  name: string;
  "sort-name": string;
  country?: string;
  area?: MusicBrainzArea;
  "begin-area"?: MusicBrainzArea;
  disambiguation?: string;
  "life-span"?: MusicBrainzLifeSpan;
  tags?: MusicBrainzTag[];
  /** available only for artist search results */
  relations?: MusicBrainzArtistRelation[];
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
 * Creates a MusicBrainz API client instance
 */
const musicbrainzClient = ky.create({
  headers: {
    "User-Agent": USER_AGENT,
  },
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
 * @returns Promise resolving to an object with discogsId and wikidataId, or null
 */
export async function getIdsFromMusicBrainz(musicbrainzId: string): Promise<MusicBrainzArtist | null> {
  try {
    const response = await musicbrainzClient.get(`artist/${musicbrainzId}`, {
      searchParams: {
        fmt: "json",
        inc: "url-rels",
      },
    });

    const data = await response.json<MusicBrainzArtist>();

    return data;

    // console.log("data", data);

    // let discogsId = "";
    // let wikidataId = "";
  } catch {
    return null;
  }
}

/**
 * Search for an artist by name in MusicBrainz
 * @param artistName - The name of the artist to search for
 * @returns Promise resolving MusicBrainzArtist
 */
export async function searchMusicBrainzArtistId(artistName: string): Promise<null | MusicBrainzArtist> {
  try {
    const response = await musicbrainzClient.get("artist", {
      searchParams: {
        fmt: "json",
        limit: 1,
        query: `artist:"${artistName}"`,
      },
    });

    const data = await response.json<MusicBrainzArtistSearch>();

    if (data.artists && data.artists.length > 0) {
      return data.artists[0];
    }

    return null;
  } catch {
    return null;
  }
}
