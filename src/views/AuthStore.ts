import { ActionContext } from "vuex";
import { api } from "../api";
import formurlencoded from "form-urlencoded";
import axios from "axios";
import type { RootState } from "../@types/rootStore";
import type { Auth, AuthData } from "../@types/Auth";
import router from "../router";
import { log } from "console";

const state: Auth = {
  auth: {
    accessToken: "",
    refreshToken: "",
    code: "",
  },
  me: {
    displayName: "",
  },
};

// MUTATIONS

export enum Mutations {
  AUTH = "AUTH",
  GET_ME = "GET_ME",
}

const mutations = {
  [Mutations.AUTH](state: Auth, data: AuthData): void {
    state.auth.accessToken = data.accessToken;
    state.auth.refreshToken = data.refreshToken;
    state.auth.code = data.code;
  },

  [Mutations.GET_ME](state: Auth, data: string): void {
    state.me.displayName = data;
  },
};

// ACTIONS

export enum AuthActions {
  auth = "auth",
  refresh = "refresh",
}

const actions = {
  async [AuthActions.refresh](store: ActionContext<Auth, RootState>): Promise<void> {

    const request = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formurlencoded({
        grant_type: "refresh_token",
        refresh_token: store.state.auth.refreshToken,
        client_id: api.clientId,
      }),
    });

    if (request.ok) {
      const json = await request.json();

      store.commit(Mutations.AUTH, {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
      });
    } else {
      alert("HTTP-Error: " + request.status);
    }
  },

  async [AuthActions.auth](store: ActionContext<Auth, RootState>, query: string): Promise<void> {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formurlencoded({
        grant_type: "authorization_code",
        code: query,
        redirect_uri: api.redirectUri,
        client_id: api.clientId,
        code_verifier: api.codeVerifier,
      }),
    });

    if (response.ok) {
      const json = await response.json();

      axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${json.access_token}`,
            "Content-Type": "application/json",
          },
        })
        .then((p) => store.commit("GET_ME", p.data.display_name))
        .then(() => router.push("/"));

      store.commit(Mutations.AUTH, {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        code: query,
      });
    } else {
      console.error(response.status)
    }
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
