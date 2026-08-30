import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The endpoint keeps its token in module state, so every case loads a fresh
 * copy of the module rather than sharing one cache across tests.
 */
async function loadHandler(): Promise<() => Promise<Response>> {
  vi.resetModules();
  return (await import("../functions/spotify-token.mts")).default as () => Promise<Response>;
}

/**
 * Stands in for accounts.spotify.com. Resolving through a microtask rather
 * than instantly is the point: it lets concurrent callers pile up while the
 * first mint is still in flight.
 * @param ok - Whether Spotify accepts the credentials
 * @returns How many requests have actually gone upstream so far
 */
function stubSpotify(ok = true): () => number {
  let calls = 0;

  vi.stubGlobal("fetch", async () => {
    calls++;
    await Promise.resolve();
    return ok
      ? new Response(JSON.stringify({ access_token: "tok", expires_in: 3600 }))
      : new Response("nope", { status: 400 });
  });

  return () => calls;
}

describe("spotify-token", () => {
  beforeEach(() => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "id");
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "secret");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("mints one token for concurrent cold-cache requests", async () => {
    const upstreamCalls = stubSpotify();
    const handler = await loadHandler();

    const bodies = await Promise.all(
      [1, 2, 3, 4, 5].map(async () => (await handler()).json() as Promise<{ access_token: string }>),
    );

    expect(upstreamCalls()).toBe(1);
    bodies.forEach((body) => expect(body.access_token).toBe("tok"));
  });

  it("reports the time left on the cached token, not its original TTL", async () => {
    vi.useFakeTimers();
    stubSpotify();
    const handler = await loadHandler();

    const cold = (await (await handler()).json()) as { expires_in: number };
    // 3600 minus the 60s safety margin the mint takes off.
    expect(cold.expires_in).toBe(3540);

    vi.setSystemTime(Date.now() + 600_000);
    const warm = (await (await handler()).json()) as { expires_in: number };

    expect(warm.expires_in).toBe(2940);
  });

  it("serves later requests from cache without calling Spotify again", async () => {
    const upstreamCalls = stubSpotify();
    const handler = await loadHandler();

    await handler();
    await handler();

    expect(upstreamCalls()).toBe(1);
  });

  it("releases the in-flight mint after a failure so the next request retries", async () => {
    const upstreamCalls = stubSpotify(false);
    const handler = await loadHandler();

    expect((await handler()).status).toBe(502);
    expect(upstreamCalls()).toBe(1);

    // A poisoned in-flight promise would make this resolve to 502 forever.
    vi.unstubAllGlobals();
    stubSpotify();
    expect((await handler()).status).toBe(200);
  });

  it("refuses to run without credentials", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_ID", "");
    stubSpotify();
    const handler = await loadHandler();

    expect((await handler()).status).toBe(500);
  });
});
