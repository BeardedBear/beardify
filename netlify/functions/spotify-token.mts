// Mints a Spotify app access token (Client Credentials flow) so the public
// share pages can read public playlists without a user login. Client secret
// stays server-side; never exposed to the SPA.
interface AppToken {
  expiresAt: number;
  token: string;
}

let cachedToken: AppToken | null = null;

/**
 * The mint currently in flight, if any.
 *
 * A token is cached for its whole life, so the only window where this endpoint
 * really calls Spotify is a cold cache — which is exactly when a share page
 * fires its requests, all at once. Without joining them, each concurrent
 * request mints a token of its own.
 */
let inFlight: null | Promise<AppToken> = null;

export default async (): Promise<Response> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return tokenResponse(cachedToken);
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response("Missing Spotify credentials", { status: 500 });
  }

  inFlight ??= mintToken(clientId, clientSecret).finally(() => {
    inFlight = null;
  });

  try {
    cachedToken = await inFlight;
  } catch {
    return new Response("Spotify auth failed", { status: 502 });
  }

  return tokenResponse(cachedToken);
};

/**
 * Ask Spotify for a fresh Client Credentials token.
 * @param clientId - Spotify app client id
 * @param clientSecret - Spotify app client secret
 * @throws When Spotify refuses the credentials
 */
async function mintToken(clientId: string, clientSecret: string): Promise<AppToken> {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Spotify auth failed");
  }

  const data = (await response.json()) as { access_token: string; expires_in: number };
  return { expiresAt: Date.now() + (data.expires_in - 60) * 1000, token: data.access_token };
}

/**
 * Hand the token to the SPA with the time it has left.
 *
 * `expires_in` is what the caller has left on *this* token, not the original
 * TTL: a client served from the cache 50 minutes in must not hold it for a
 * fresh hour. It is also required — the SPA caches on it, and its absence made
 * every public read fetch a new token.
 * @param token - The cached or freshly minted token
 */
function tokenResponse(token: AppToken): Response {
  return Response.json({
    access_token: token.token,
    expires_in: Math.max(0, Math.floor((token.expiresAt - Date.now()) / 1000)),
  });
}
