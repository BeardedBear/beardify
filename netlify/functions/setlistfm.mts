// Relays setlist.fm calls. The API sends no CORS headers, so the SPA can't reach it
// directly, and the key must stay server-side anyway (no VITE_ prefix: never bundled).
//
// The standard key is capped at 2 req/s and 1440 req/day for every user combined, so
// the CDN cache below is what keeps the tab working, not an optimisation.
const SETLISTFM_API = "https://api.setlist.fm/rest/1.0/";

// Only the setlist search, and only the params the SPA sends: the upstream URL is built
// from this request, so anything unchecked could reach another endpoint with our key.
const ALLOWED_PATH = "search/setlists";
const ALLOWED_PARAMS: Record<string, RegExp> = {
  artistMbid: /^[0-9a-f-]{36}$/,
  countryCode: /^[A-Z]{2}$/,
  p: /^\d{1,3}$/,
};

export default async (request: Request): Promise<Response> => {
  if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });

  const apiKey = process.env.SETLISTFM_API_KEY;
  if (!apiKey) return new Response("setlist.fm key missing", { status: 503 });

  const url = new URL(request.url);
  const path = url.pathname.replace(/^.*\/setlistfm\/?/, "");
  if (path !== ALLOWED_PATH) return new Response("Unsupported setlist.fm path", { status: 400 });

  const params = new URLSearchParams();
  for (const [key, value] of url.searchParams) {
    // hasOwn: a key like "constructor" would otherwise resolve on the prototype and throw
    if (!Object.hasOwn(ALLOWED_PARAMS, key) || !ALLOWED_PARAMS[key].test(value)) return new Response(`Invalid param: ${key}`, { status: 400 });
    params.set(key, value);
  }
  if (!params.has("artistMbid")) return new Response("artistMbid required", { status: 400 });

  let upstream: Response;
  try {
    upstream = await fetch(new URL(`${path}?${params}`, SETLISTFM_API), {
      headers: { Accept: "application/json", "x-api-key": apiKey },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    return new Response("setlist.fm unreachable", { status: 504 });
  }

  const headers: Record<string, string> = {
    "Content-Type": upstream.headers.get("content-type") ?? "application/json",
  };

  // Only cache what came back clean: caching a 429 would pin the failure for hours.
  // A 404 is clean too (no setlist for that artist/country) and common, so it gets a
  // shorter cache rather than costing a quota call on every visit.
  if (upstream.ok) {
    headers["Cache-Control"] = "public, max-age=3600";
    headers["Netlify-CDN-Cache-Control"] = "public, durable, max-age=43200";
  } else if (upstream.status === 404) {
    headers["Cache-Control"] = "public, max-age=3600";
    headers["Netlify-CDN-Cache-Control"] = "public, durable, max-age=3600";
  } else {
    headers["Cache-Control"] = "no-store";
  }

  return new Response(upstream.body, { headers, status: upstream.status });
};
