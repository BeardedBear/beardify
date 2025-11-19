import formUrlEncoded from "form-urlencoded";
import ky from "ky";
import { defineStore } from "pinia";
import pkceChallenge from "pkce-challenge";

import type { Auth, AuthAPIResponse } from "@/@types/Auth";
import type { User } from "@/@types/User";

import { api, instance } from "@/api";
import { useConfig } from "@/components/config/ConfigStore";
import { usePlayer } from "@/components/player/PlayerStore";
import { clearAuthData } from "@/helpers/authUtils";
import router, { RouteName } from "@/router";

// Store the refresh interval ID outside of the store state to prevent persistence issues
let refreshIntervalId: null | number = null;

export const useAuth = defineStore("auth", {
  actions: {
    async authentification(query: string) {
      if (!this.storage) {
        console.error("Authentication failed: no storage found");
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
        const data = await ky
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

        // Redirect to the original page or home
        router.push(referer || RouteName.Home);
      } catch (error) {
        console.error("Authentication failed:", error);
        router.push(RouteName.Login);
        throw new Error("Authentication failed");
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
      try {
        const data = await ky
          .post("https://accounts.spotify.com/api/token", {
            body: formUrlEncoded({
              client_id: api.clientId,
              grant_type: "refresh_token",
              refresh_token: this.storage?.refreshToken,
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          })
          .json<AuthAPIResponse>();

        this.accessToken = data.access_token;
        await this.getMe();
        this.storage = {
          codeChallenge: "",
          codeVerifier: "",
          referer: "",
          refreshToken: data.refresh_token,
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
          try {
            await this.refresh();
            console.log("Token auto-refreshed successfully");
          } catch (error) {
            console.error("Auto-refresh failed:", error);
            // Don't logout immediately on auto-refresh failure
            // The API layer will handle auth errors on the next request
          }
        },
        20 * 60 * 1000,
      ); // 20 minutes
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
