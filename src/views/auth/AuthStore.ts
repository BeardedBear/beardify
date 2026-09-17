import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import pkceChallenge from "pkce-challenge";

import type { Auth, AuthAPIResponse } from "@/@types/Auth";
import type { User } from "@/@types/User";

import { api, instance } from "@/api";
import { useConfig } from "@/components/config/ConfigStore";
import { usePlayer } from "@/components/player/PlayerStore";
import { clearAuthData } from "@/helpers/authUtils";
import { http } from "@/helpers/http";
import router, { RouteName } from "@/router";

// Refresh plumbing lives outside the store state: an in-flight request and a
// failure count must not be persisted or survive a reload.
let refreshIntervalId: null | number = null;
let inFlightRefresh: null | Promise<void> = null;
let consecutiveFailures = 0;

const MAX_REFRESH_ATTEMPTS = 3;
/** Spotify tokens last an hour; anything renewed more recently than this is still good. */
const REFRESH_THRESHOLD_MS = 15 * 60 * 1000;

/**
 * True while a refresh is in flight.
 *
 * The API layer needs this: `refresh()` calls `getMe()` through the intercepted
 * instance, so a 401 there would re-enter the response hook and, if the hook
 * awaited the refresh already running, deadlock on it.
 */
export function isRefreshing(): boolean {
  return inFlightRefresh !== null;
}

export const useAuth = defineStore("auth", {
  actions: {
    async authentification(query: string) {
      if (!this.storage) {
        router.push(RouteName.Login);
        return;
      }

      const payload = {
        client_id: api.clientId,
        code: query,
        code_verifier: this.storage.codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: api.redirectUri,
      };

      try {
        const data = await http
          .post("https://accounts.spotify.com/api/token", {
            body: formUrlEncoded(payload),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          })
          .json<AuthAPIResponse>();

        this.accessToken = data.access_token;
        this.code = query;

        const referer = this.storage.referer;
        this.storage = {
          codeChallenge: "",
          codeVerifier: "",
          referer: referer,
          refreshToken: data.refresh_token,
        };

        // Get user info before redirecting
        await this.getMe();

        // Start auto-refresh timer
        this.startAutoRefresh();

        router.push(referer || RouteName.Home);
      } catch {
        router.push(RouteName.Login);
        throw new Error("Authentication failed");
      }
    },

    /**
     * The single way to renew the access token.
     *
     * Three triggers wanted a fresh one — the 20-minute timer, a 401 from the
     * API layer and the tab returning to the foreground — and each carried its
     * own attempt counter and backoff. Two could refresh at once, and only the
     * 401 path ever gave up and sent the user back to login. They share one
     * in-flight request and one failure count here, so giving up happens once.
     * @param force - Renew even when the last refresh is recent; a 401 means the token is dead whatever its age
     */
    async ensureFreshToken(force = false): Promise<void> {
      if (inFlightRefresh) return inFlightRefresh;

      if (!force) {
        const lastRefresh = Number(localStorage.getItem("spotify_token_last_refresh") ?? 0);
        if (lastRefresh && Date.now() - lastRefresh < REFRESH_THRESHOLD_MS) return;
      }

      inFlightRefresh = (async (): Promise<void> => {
        try {
          await this.refresh();
          consecutiveFailures = 0;
        } catch (e) {
          consecutiveFailures++;
          if (consecutiveFailures >= MAX_REFRESH_ATTEMPTS) {
            consecutiveFailures = 0;
            this.forceReauthentication();
          }
          throw e;
        } finally {
          inFlightRefresh = null;
        }
      })();

      return inFlightRefresh;
    },

    /** Give up on the session: wipe the credentials and send the user back to login. */
    forceReauthentication(): void {
      clearAuthData();
      const currentPath = window.location.pathname;
      if (currentPath !== "/login/") {
        window.location.href = `/login/?ref=${encodeURIComponent(currentPath)}`;
      }
    },

    async generateStorage(referer?: string): Promise<void> {
      const code = await pkceChallenge();
      this.storage = {
        codeChallenge: code.code_challenge,
        codeVerifier: code.code_verifier,
        referer: referer ? referer : "",
        refreshToken: "",
      };
    },

    async getMe() {
      if (!this.me) {
        try {
          const { data } = await instance().get<User>("me");
          this.me = data;
        } catch {
          // silent fail; user info not critical here
        }
      }
    },

    logout() {
      useConfig().close();
      usePlayer().pause();
      clearAuthData();
      this.stopAutoRefresh();
      this.$reset();

      router.push(RouteName.Login);
    },

    async refresh() {
      // If we don't have a refresh token, bail early instead of sending an invalid request
      if (!this.storage?.refreshToken) {
        throw new Error("No refresh token available");
      }

      try {
        const data = await http
          .post("https://accounts.spotify.com/api/token", {
            body: formUrlEncoded({
              client_id: api.clientId,
              grant_type: "refresh_token",
              refresh_token: this.storage.refreshToken,
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          })
          .json<AuthAPIResponse>();

        this.accessToken = data.access_token;
        await this.getMe();

        // Only update stored refresh token if the provider returned one.
        // Spotify may not return a refresh_token on refresh requests.
        // Avoid overwriting the existing token with undefined.
        const currentRefresh = this.storage?.refreshToken || "";
        const newRefresh = data.refresh_token ?? currentRefresh;

        this.storage = {
          codeChallenge: "",
          codeVerifier: "",
          referer: "",
          refreshToken: newRefresh,
        };

        // Store timestamp of last successful refresh
        localStorage.setItem("spotify_token_last_refresh", Date.now().toString());

        return true;
      } catch {
        throw new Error("Token refresh failed");
      }
    },

    startAutoRefresh() {
      // Clear any existing interval
      this.stopAutoRefresh();

      // Refresh token every 20 minutes (1200000ms) for safety margin
      // Spotify access tokens expire after 1 hour, so 20 min refresh keeps us safe
      refreshIntervalId = window.setInterval(
        async () => {
          // Scheduled renewal, so force it; ensureFreshToken owns what happens
          // once the failures add up.
          await this.ensureFreshToken(true).catch(() => {});
        },
        20 * 60 * 1000,
      );
    },

    stopAutoRefresh() {
      if (refreshIntervalId !== null) {
        clearInterval(refreshIntervalId);
        refreshIntervalId = null;
      }
    },
  },

  persist: {
    key: "beardify-auth",
  },

  state: (): Auth => ({
    accessToken: "",
    code: "",
    me: null,
    storage: null,
  }),
});
