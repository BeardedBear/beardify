import ky from "ky";

import { DiscogsArtist } from "@/@types/Artist";

/**
 * Discogs API configuration
 */
const DISCOGS_API_URL = "https://api.discogs.com/";
const DISCOGS_TOKEN = import.meta.env.VITE_DISCOGS_TOKEN || "";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

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
