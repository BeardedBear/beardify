// ponytail: one self-check for the path guard — the only branch here with a security
// consequence. Run with `bun scripts/musicbrainz-relay.check.ts`.
//
// Lives here, not beside the function: Netlify bundles every *.mts under netlify/functions
// as a deployable function, and esbuild's cjs output rejects the top-level awaits below.
import assert from "node:assert/strict";

import handler from "../netlify/functions/musicbrainz.mjs";

const BASE = "https://beardify.test/.netlify/functions/musicbrainz";
const call = (path: string): Promise<Response> => handler(new Request(`${BASE}${path}`)) as Promise<Response>;

let lastUpstream = "";
globalThis.fetch = (async (input: string | URL): Promise<Response> => {
  lastUpstream = input.toString();
  return new Response("{\"id\":\"ok\"}", { headers: { "content-type": "application/json" }, status: 200 });
}) as typeof fetch;

// Rejected: a protocol-relative path would otherwise resolve against another host.
assert.equal((await call("//evil.example/x?fmt=json")).status, 400);
assert.equal((await call("/artist/../../etc/passwd")).status, 400);
assert.equal((await call("/artist/not-an-mbid")).status, 400);
assert.equal((await handler(new Request(`${BASE}/artist/x`, { method: "POST" }))).status, 405);

// Accepted: the two shapes the app actually sends.
const detail = await call("/artist/deaddf4e-1209-4d93-bb75-f53780d1c0c4?fmt=json&inc=artist-rels");
assert.equal(detail.status, 200);
assert.equal(lastUpstream, "https://musicbrainz.org/ws/2/artist/deaddf4e-1209-4d93-bb75-f53780d1c0c4?fmt=json&inc=artist-rels");
assert.match(detail.headers.get("netlify-cdn-cache-control") ?? "", /durable/);

assert.equal((await call("/release-group?artist=deaddf4e-1209-4d93-bb75-f53780d1c0c4&limit=100")).status, 200);

// A failing upstream must not be cached.
globalThis.fetch = (async (): Promise<Response> => new Response("", { status: 503 })) as typeof fetch;
const failed = await call("/artist/deaddf4e-1209-4d93-bb75-f53780d1c0c4?fmt=json");
assert.equal(failed.status, 503);
assert.equal(failed.headers.get("cache-control"), "no-store");
assert.equal(failed.headers.get("netlify-cdn-cache-control"), null);

console.warn("musicbrainz relay: all checks passed");
