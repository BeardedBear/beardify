import axios, { AxiosResponse } from "axios";
import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import { create } from "pkce";
import { Auth, AuthAPIResponse } from "../../@types/Auth";
import { api, instance } from "../../api";
import { useConfig } from "../../components/config/ConfigStore";
import { usePlayer } from "../../components/player/PlayerStore";
import router, { RouteName } from "../../router";

export const useAuth = defineStore("auth", {
  state: (): Auth => ({
    accessToken: "",
    code: "",
    me: null,
    storage: null,
  }),

  actions: {
    async generateStorage(referer?: string): Promise<void> {
      const code: {
        codeVerifier: string;
        codeChallenge: string;
      } = create();

      this.storage = {
        codeChallenge: code.codeChallenge,
        codeVerifier: code.codeVerifier,
        refreshToken: "",
        referer: referer ? referer : "",
      };
    },

    logout() {
      useConfig().close();
      usePlayer().pause();
      router.push(RouteName.Login);
      localStorage.removeItem("Beardify");
    },

    getMe() {
      if (!this.me) {
        instance()
          .get("me")
          .then(({ data }) => (this.me = data));
      }
    },

    async refresh() {
      return axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "refresh_token",
            refresh_token: this.storage?.refreshToken,
            client_id: api.clientId,
          }),
        )
        .then((res) => {
          this.accessToken = res.data.access_token;
          this.getMe();
          this.storage = { codeChallenge: "", codeVerifier: "", refreshToken: res.data.refresh_token, referer: "" };
          return true;
        })
        .catch((err) => {
          throw new Error(err);
        });
    },

    async authentification(query: string) {
      if (this.storage)
        axios
          .post<string, AxiosResponse<AuthAPIResponse>>(
            "https://accounts.spotify.com/api/token",
            formUrlEncoded({
              grant_type: "authorization_code",
              code: query,
              redirect_uri: api.redirectUri,
              client_id: api.clientId,
              code_verifier: this.storage.codeVerifier,
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
                refreshToken: data.refresh_token,
                referer: this.storage.referer,
              };
          })
          .catch((err) => {
            router.push(RouteName.Home);
            throw new Error(err);
          });
    },
  },

  persist: {
    key: "beardify-auth",
  },
});
