import { api } from "@/api";
import { http } from "@/helpers/http";
import { cleanUrl } from "@/helpers/urls";

const TOKEN_ENDPOINT = "/.netlify/functions/spotify-token";

interface AppToken {
  access_token: string;
  expires_in: number;
}

let cachedToken: { expiresAt: number; token: string } | null = null;

/**
 * Reads public Spotify data (no user login) via the app-level Client Credentials
 * token minted by the Netlify function. Only works for public playlists/albums.
 */
export async function publicSpotifyGet<T>(url: string): Promise<T> {
  const token = await getAppToken();
  return http.get(`${api.url}${cleanUrl(url)}`, { headers: { Authorization: `Bearer ${token}` } }).json<T>();
}

async function getAppToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;
  const data = await http.get(TOKEN_ENDPOINT).json<AppToken>();
  cachedToken = { expiresAt: Date.now() + (data.expires_in - 60) * 1000, token: data.access_token };
  return cachedToken.token;
}
