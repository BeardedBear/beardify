import ky from "ky";

/**
 * MusicBrainz API configuration
 */
const MUSICBRAINZ_API_URL = "https://musicbrainz.org/ws/2/";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

/**
 * Interface for MusicBrainz artist details with relations
 */
interface MusicBrainzArtist {
  id: string;
  name: string;
  relations?: Array<{
    "target-type": string;
    type: string;
    url?: {
      id: string;
      resource: string;
    };
  }>;
}

/**
 * Interface for MusicBrainz artist search results
 */
interface MusicBrainzArtistSearch {
  artists: Array<{
    id: string;
    name: string;
    relations?: Array<{
      "target-type": string;
      type: string;
      url?: {
        id: string;
        resource: string;
      };
    }>;
    score: number;
  }>;
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
export async function getDiscogsIdByArtistName(artistName: string): Promise<null | string> {
  try {
    // First, search for the artist in MusicBrainz
    const musicbrainzId = await searchMusicBrainzArtist(artistName);

    if (!musicbrainzId) {
      return null;
    }

    // Then, get the Discogs ID from the MusicBrainz artist
    const discogsId = await getDiscogsIdFromMusicBrainz(musicbrainzId);

    return discogsId;
  } catch {
    return null;
  }
}

/**
 * Get Discogs ID from MusicBrainz artist
 * @param musicbrainzId - The MusicBrainz ID of the artist
 * @returns Promise resolving to the Discogs ID or null
 */
export async function getDiscogsIdFromMusicBrainz(musicbrainzId: string): Promise<null | string> {
  try {
    const response = await musicbrainzClient.get(`artist/${musicbrainzId}`, {
      searchParams: {
        fmt: "json",
        inc: "url-rels",
      },
    });

    const data = await response.json<MusicBrainzArtist>();

    if (data.relations) {
      const discogsRelation = data.relations.find(
        (rel) => rel.type === "discogs" && rel["target-type"] === "url" && rel.url,
      );

      if (discogsRelation && discogsRelation.url) {
        // Extract Discogs ID from URL
        // Example URL: https://www.discogs.com/artist/12345
        const match = discogsRelation.url.resource.match(/\/artist\/(\d+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Search for an artist by name in MusicBrainz
 * @param artistName - The name of the artist to search for
 * @returns Promise resolving to the MusicBrainz artist ID or null
 */
export async function searchMusicBrainzArtist(artistName: string): Promise<null | string> {
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
      return data.artists[0].id;
    }

    return null;
  } catch {
    return null;
  }
}
