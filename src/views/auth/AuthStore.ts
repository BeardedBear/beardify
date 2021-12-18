import axios, { AxiosResponse } from "axios";
import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import { create } from "pkce";
import { Auth, AuthAPIResponse } from "../../@types/Auth";
import { api, instance } from "../../api";
import { useConfig } from "../../components/config/ConfigStore";
import { usePlayer } from "../../components/player/PlayerStore";
import router, { RouteName } from "../../router";

interface StorageAuth {
  codeChallenge: string;
  codeVerifier: string;
  refreshToken: string;
  referer: string;
}

export const useAuth = defineStore("auth", {
  state: (): Auth => ({
    accessToken: "",
    code: "",
    me: null,
  }),

  actions: {
    syncStore(data: StorageAuth) {
      localStorage.setItem(
        "Beardify",
        JSON.stringify({
          codeChallenge: data.codeChallenge,
          codeVerifier: data.codeVerifier,
          refreshToken: data.refreshToken,
          referer: data.referer,
        } as StorageAuth),
      );
    },

    async generateStorage(referer?: string): Promise<void> {
      const code: {
        codeVerifier: string;
        codeChallenge: string;
      } = create();

      this.syncStore({
        codeChallenge: code.codeChallenge,
        codeVerifier: code.codeVerifier,
        refreshToken: "",
        referer: referer ? referer : "",
      });
    },

    logout() {
      useConfig().close();
      usePlayer().pause();
      router.push(RouteName.Login);
      localStorage.removeItem("Beardify");
    },

    async refresh() {
      const storage: StorageAuth = JSON.parse(localStorage.getItem("Beardify") || "");

      return axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "refresh_token",
            refresh_token: storage.refreshToken,
            client_id: api.clientId,
          }),
        )
        .then((res) => {
          this.accessToken = res.data.access_token;
          if (!this.me) {
            instance()
              .get("me")
              .then(({ data }) => (this.me = data));
          }
          this.syncStore({ codeChallenge: "", codeVerifier: "", refreshToken: res.data.refresh_token, referer: "" });
          return true;
        })
        .catch((err) => {
          throw new Error(err);
        });
    },

    async authentification(query: string) {
      const storage: StorageAuth = JSON.parse(localStorage.getItem("Beardify") || "");

      axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "authorization_code",
            code: query,
            redirect_uri: api.redirectUri,
            client_id: api.clientId,
            code_verifier: storage.codeVerifier,
          }),
        )
        .then(({ data }) => {
          router.push(storage.referer);
          this.accessToken = data.access_token;
          this.code = query;
          this.syncStore({
            codeChallenge: "",
            codeVerifier: "",
            refreshToken: data.refresh_token,
            referer: storage.referer,
          });
        })
        .catch((err) => {
          router.push(RouteName.Home);
          throw new Error(err);
        });
    },
  },
});
