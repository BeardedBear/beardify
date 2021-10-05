import { useStorage } from "@vueuse/core";
import axios, { AxiosResponse } from "axios";
import formUrlEncoded from "form-urlencoded";
import { defineStore } from "pinia";
import { create } from "pkce";
import { Auth, AuthAPIResponse } from "../../@types/Auth";
import { defaultMe } from "../../@types/Defaults";
import { Me } from "../../@types/Me";
import { Storage } from "../../@types/Storage";
import { api } from "../../api";
import router from "../../router";

export const useAuth = defineStore("auth", {
  state: (): Auth => ({
    accessToken: "",
    refreshToken: "",
    code: "",
    codeVerifier: "",
    codeChallenge: "",
    me: defaultMe,
  }),

  actions: {
    async generateCodeChallenge(): Promise<void> {
      const code: {
        codeVerifier: string;
        codeChallenge: string;
      } = create();

      useStorage("beardifyPinia", { auth: this.$state });
      this.codeChallenge = code.codeChallenge;
      this.codeVerifier = code.codeVerifier;
    },

    resetLogin() {
      this.me = defaultMe;
    },

    async refresh() {
      const storage: Storage = JSON.parse(localStorage.getItem("beardifyPinia") || "");

      axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "refresh_token",
            refresh_token: storage.auth.refreshToken,
            client_id: api.clientId,
          }),
        )
        .then((res) => {
          this.accessToken = res.data.access_token;
          this.refreshToken = res.data.refresh_token;
          this.getMe(res.data.access_token);
        })
        .catch((err) => console.error("From refresh token", err));
    },

    getMe(token: string) {
      axios.get<Me>(`${api.url}me`, { headers: { Authorization: `Bearer ${token}` } }).then((p) => {
        this.me = p.data;
        router.go(1);
      });
    },

    async authentification(query: string) {
      const storage: Storage = JSON.parse(localStorage.getItem("beardifyPinia") || "");

      axios
        .post<string, AxiosResponse<AuthAPIResponse>>(
          "https://accounts.spotify.com/api/token",
          formUrlEncoded({
            grant_type: "authorization_code",
            code: query,
            redirect_uri: api.redirectUri,
            client_id: api.clientId,
            code_verifier: storage.auth.codeVerifier,
          }),
        )
        .then(({ data }) => {
          this.getMe(data.access_token);
          this.accessToken = data.access_token;
          this.refreshToken = data.refresh_token;
          this.code = query;
        })
        .catch((err) => console.error("From auth", err));
    },
  },
});
