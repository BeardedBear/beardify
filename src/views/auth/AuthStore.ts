import formUrlEncoded from "form-urlencoded";
import ky from "ky";
import { defineStore } from "pinia";
import pkceChallenge from "pkce-challenge";

import type { Auth, AuthAPIResponse } from "../../@types/Auth";
import type { User } from "../../@types/User";

import { api, instance } from "../../api";
import { useConfig } from "../../components/config/ConfigStore";
import { usePlayer } from "../../components/player/PlayerStore";
import { clearAuthData } from "../../helpers/authUtils";
import router, { RouteName } from "../../router";

export const useAuth = defineStore("auth", {
  actions: {
    async authentification(query: string) {
      if (this.storage) {
        const payload = {
          client_id: api.clientId,
          code: query,
          code_verifier: this.storage.codeVerifier,
          grant_type: "authorization_code",
          redirect_uri: api.redirectUri,
        };
        ky.post("https://accounts.spotify.com/api/token", {
          body: formUrlEncoded(payload),
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
          .json<AuthAPIResponse>()
          .then((data) => {
            this.accessToken = data.access_token;
            this.code = query;

            if (this.storage) {
              const referer = this.storage.referer;
              this.storage = {
                codeChallenge: "",
                codeVerifier: "",
                referer: referer,
                refreshToken: data.refresh_token,
              };

              // Get user info then redirect
              this.getMe();

              // Redirect to the original page or home
              router.push(referer || RouteName.Home);
            }
          })
          .catch((err) => {
            router.push(RouteName.Home);
            throw new Error(String(err));
          });
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

    getMe() {
      if (!this.me) {
        instance()
          .get<User>("me")
          .then(({ data }): User => (this.me = data));
      }
    },

    logout() {
      useConfig().close();
      usePlayer().pause();
      clearAuthData();
      this.$reset();

      router.push(RouteName.Login);
    },

    async refresh() {
      return ky
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
        .json<AuthAPIResponse>()
        .then((data) => {
          this.accessToken = data.access_token;
          this.getMe();
          this.storage = {
            codeChallenge: "",
            codeVerifier: "",
            referer: "",
            refreshToken: data.refresh_token,
          };
          return true;
        })
        .catch((err) => {
          throw new Error(String(err));
        });
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
