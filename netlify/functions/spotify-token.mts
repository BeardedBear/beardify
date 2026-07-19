// Mints a Spotify app access token (Client Credentials flow) so the public
// share pages can read public playlists without a user login. Client secret
// stays server-side; never exposed to the SPA.
let cachedToken: { expiresAt: number; token: string } | null = null;

export default async (): Promise<Response> => {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return Response.json({ access_token: cachedToken.token });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new Response("Missing Spotify credentials", { status: 500 });
  }

  const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    method: "POST",
  });

  if (!tokenResponse.ok) {
    return new Response("Spotify auth failed", { status: 502 });
  }

  const data = (await tokenResponse.json()) as { access_token: string; expires_in: number };
  cachedToken = { expiresAt: Date.now() + (data.expires_in - 60) * 1000, token: data.access_token };

  return Response.json({ access_token: cachedToken.token });
};
