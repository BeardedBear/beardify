// Relays MusicBrainz calls with a real User-Agent. Browsers forbid setting one from
// fetch, so the SPA reaches MusicBrainz as an anonymous client and gets throttled with
// 503s — which surface as an empty artist header. Node can set the header, so the SPA
// calls this instead of musicbrainz.org directly.
//
// Every user now shares Netlify's egress IP against a limit MusicBrainz applies per IP,
// so the durable CDN cache below is load-bearing, not an optimisation: without it the
// proxy would pool the throttle instead of relieving it. Artist and release-group data
// changes on the order of days, so a day of edge caching costs nothing.
const MUSICBRAINZ_WS = "https://musicbrainz.org/ws/2/";
const USER_AGENT = "Beardify/1.0.0 (https://github.com/BeardedBear/beardify)";

// Resource segment ("artist", "release-group", "url"), optionally followed by one MBID.
// Anything else is refused: the upstream URL is built from this path, and an unchecked
// value ("//evil.example") would resolve against another host entirely.
const ALLOWED_PATH = /^[a-z-]{1,20}(\/[0-9a-f-]{36})?$/;

export default async (request: Request): Promise<Response> => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const url = new URL(request.url);
  const path = url.pathname.replace(/^.*\/musicbrainz\/?/, "");
  if (!ALLOWED_PATH.test(path)) return new Response("Unsupported MusicBrainz path", { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(new URL(path + url.search, MUSICBRAINZ_WS), {
      headers: { Accept: "application/json", "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return new Response("MusicBrainz unreachable", { status: 504 });
  }

  const headers: Record<string, string> = {
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
  };

  // Only cache what came back clean: caching a 503 would pin the failure for a day.
  if (upstream.ok) {
    headers["Cache-Control"] = "public, max-age=3600";
    headers["Netlify-CDN-Cache-Control"] = "public, durable, max-age=86400";
  } else {
    headers["Cache-Control"] = "no-store";
  }

  return new Response(upstream.body, { headers, status: upstream.status });
};
