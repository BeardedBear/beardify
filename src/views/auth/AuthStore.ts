import axios, { AxiosResponse } from "axios";
import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import pkceChallenge from "pkce-challenge";

import { Auth, AuthAPIResponse } from "../../@types/Auth";
import { api, instance } from "../../api";
import { useConfig } from "../../components/config/ConfigStore";
import { usePlayer } from "../../components/player/PlayerStore";
import router, { RouteName } from "../../router";

export const useAuth = defineStore("auth", {
  actions: {
    async authentification(query: string) {
      if (this.storage)
        axios
          .post<string, AxiosResponse<AuthAPIResponse>>(
            "https://accounts.spotify.com/api/token",
            formUrlEncoded({
              client_id: api.clientId,
              code: query,
              code_verifier: this.storage.codeVerifier,
              grant_type: "authorization_code",
              redirect_uri: api.redirectUri,
            }),
          )
          .then(({ data }) => {
            if (this.storage) router.push(this.storage.referer);
            this.accessToken = data.access_token;
            this.code = query;
            this.getMe();
            if (this.storage)
              this.storage = {
                codeChallenge: "",
                codeVerifier: "",
                referer: this.storage.referer,
                refreshToken: data.refresh_token,
              };
          })
          .catch((err) => {
            router.push(RouteName.Home);
            throw new Error(err);
          });
    },

    async generateStorage(referer?: string): Promise<void> {
      const code = pkceChallenge();

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
          .get("me")
          .then(({ data }) => (this.me = data));
      }
    },

    logout() {
      useConfig().close();
      usePlayer().pause();
      router.push(RouteName.Login);
      localStorage.removeItem("Beardify");
    },

    async refresh() {
      return axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            client_id: api.clientId,
            grant_type: "refresh_token",
            refresh_token: this.storage?.refreshToken,
          }),
        )
        .then((res) => {
          this.accessToken = res.data.access_token;
          this.getMe();
          this.storage = {
            codeChallenge: "",
            codeVerifier: "",
            referer: "",
            refreshToken: res.data.refresh_token,
          };
          return true;
        })
        .catch((err) => {
          throw new Error(err);
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
