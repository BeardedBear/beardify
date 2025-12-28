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
 * Get Discogs ID for an artist by searching MusicBrainz by artist name
 * @param artistName - The name of the artist
 * @returns Promise resolving to the Discogs ID or null
 */
// export async function getDiscogsIdByArtistName(artistName: string): Promise<null | string> {
//   console.log("getDiscogsIdByArtistName");
//   try {
//     // First, search for the artist's ID in MusicBrainz
//     const musicbrainzId = await searchMusicBrainzArtistId(artistName);

//     if (!musicbrainzId) {
//       return null;
//     }

//     // Then, get the Discogs ID from the MusicBrainz artist
//     const result = await getIdsFromMusicBrainz(musicbrainzId);

//     return result?.discogsId || null;
//   } catch {
//     return null;
//   }
// }

/**
 * Get Discogs ID and Wikidata ID from MusicBrainz artist
 * @param musicbrainzId - The MusicBrainz ID of the artist
 * @returns Promise resolving to an object with discogsId and wikidataId, or null
 */
export async function getIdsFromMusicBrainz(
  musicbrainzId: string,
): Promise<{ discogsId: string; wikidataId: string } | null> {
  console.log("getIdsFromMusicBrainz");
  try {
    const response = await musicbrainzClient.get(`artist/${musicbrainzId}`, {
      searchParams: {
        fmt: "json",
        inc: "url-rels",
      },
    });

    const data = await response.json<MusicBrainzArtist>();

    let discogsId = "";
    let wikidataId = "";

    if (data.relations) {
      // Extract Discogs ID
      const discogsRelation = data.relations.find(
        (rel) => rel.type === "discogs" && rel["target-type"] === "url" && rel.url,
      );

      if (discogsRelation && discogsRelation.url) {
        // Extract Discogs ID from URL
        // Example URL: https://www.discogs.com/artist/12345
        const match = discogsRelation.url.resource.match(/\/artist\/(\d+)/);
        if (match && match[1]) {
          discogsId = match[1];
        }
      }

      // Extract Wikidata ID
      const wikidataRelation = data.relations.find(
        (rel) => rel.type === "wikidata" && rel["target-type"] === "url" && rel.url,
      );

      if (wikidataRelation && wikidataRelation.url) {
        // Extract Wikidata ID from URL
        // Example URL: https://www.wikidata.org/wiki/Q1625046
        const match = wikidataRelation.url.resource.match(/\/wiki\/(Q\d+)/);
        if (match && match[1]) {
          wikidataId = match[1];
        }
      }
    }

    // Return null if neither ID was found
    if (!discogsId && !wikidataId) {
      return null;
    }

    console.log("{ discogsId, wikidataId }", { discogsId, wikidataId });

    return { discogsId, wikidataId };
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

    console.log(data);

    return null;
  } catch {
    return null;
  }
}
