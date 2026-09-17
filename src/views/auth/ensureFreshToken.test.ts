import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Token renewal used to be orchestrated in three places — the 20-minute timer,
 * the 401 hook in api.ts and App.vue's visibilitychange handler — each with its
 * own attempt counter and backoff. Two could refresh at once, and only the 401
 * path ever gave up and sent the user back to login. These tests pin the three
 * properties that made consolidating them worth it.
 */

const post = vi.fn();
const forceReauth = vi.fn();

vi.mock("@/helpers/http", (): Record<string, unknown> => ({ http: { post: (...args: unknown[]): unknown => post(...args) } }));
vi.mock("@/api", (): Record<string, unknown> => ({ api: { clientId: "test" }, instance: (): unknown => ({ get: vi.fn() }) }));
vi.mock("@/router", (): Record<string, unknown> => ({ default: { push: vi.fn() }, RouteName: { Home: "home", Login: "login" } }));
vi.mock("@/components/config/ConfigStore", (): Record<string, unknown> => ({ useConfig: (): unknown => ({ close: vi.fn() }) }));
vi.mock("@/components/player/PlayerStore", (): Record<string, unknown> => ({ usePlayer: (): unknown => ({ pause: vi.fn() }) }));

const { useAuth } = await import("@/views/auth/AuthStore");

/** Holds the refresh request open until the test releases it, to keep one in flight. */
function gateRefresh(): () => void {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  post.mockImplementation((): unknown => ({
    json: async (): Promise<unknown> => {
      await gate;
      return { access_token: "fresh", refresh_token: "r" };
    },
  }));
  return release;
}

function setupStore(): ReturnType<typeof useAuth> {
  const store = useAuth();
  store.storage = { codeChallenge: "", codeVerifier: "", referer: "", refreshToken: "r" };
  store.forceReauthentication = forceReauth;
  return store;
}

describe("ensureFreshToken", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    post.mockReset();
    forceReauth.mockReset();
  });

  it("collapses concurrent callers onto one refresh request", async () => {
    const release = gateRefresh();
    const store = setupStore();

    const calls = [store.ensureFreshToken(true), store.ensureFreshToken(true), store.ensureFreshToken(true)];
    release();
    await Promise.all(calls);

    // The race the three separate orchestrators could lose.
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("skips an unforced refresh while the token is still recent", async () => {
    post.mockImplementation((): unknown => ({ json: async (): Promise<unknown> => ({ access_token: "fresh" }) }));
    const store = setupStore();
    localStorage.setItem("spotify_token_last_refresh", Date.now().toString());

    await store.ensureFreshToken();
    expect(post).not.toHaveBeenCalled();

    // A 401 says the token is dead whatever its age, so forcing must still go out.
    await store.ensureFreshToken(true);
    expect(post).toHaveBeenCalledTimes(1);
  });

  it("gives up once, after the failures add up across triggers", async () => {
    post.mockImplementation((): never => {
      throw new Error("network down");
    });
    const store = setupStore();

    await store.ensureFreshToken(true).catch(() => {});
    await store.ensureFreshToken(true).catch(() => {});
    expect(forceReauth).not.toHaveBeenCalled();

    await store.ensureFreshToken(true).catch(() => {});
    expect(forceReauth).toHaveBeenCalledTimes(1);
  });
});
