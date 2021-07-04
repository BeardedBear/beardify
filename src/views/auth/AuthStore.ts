import axios from "axios";
import formurlencoded from "form-urlencoded";
import { ActionContext } from "vuex";
import type { Auth, AuthData } from "../../@types/Auth";
import { defaultAuth, defaultMe } from "../../@types/Defaults";
import { Me } from "../../@types/Me";
import type { RootState } from "../../@types/RootState";
import { api } from "../../api";
import router from "../../router";

const state: Auth = {
  auth: defaultAuth,
  me: defaultMe,
};

// MUTATIONS

export enum Mutations {
  AUTH = "AUTH",
  SET_ME = "SET_ME",
  GENERATE_CODE_CHALLENGE = "GENERATE_CODE_CHALLENGE",
  RESET_LOGIN = "RESET_LOGIN",
}

export const mutations = {
  [Mutations.AUTH](state: Auth, data: AuthData): void {
    state.auth.accessToken = data.accessToken;
    state.auth.refreshToken = data.refreshToken;
    state.auth.code = data.code;
  },

  [Mutations.SET_ME](state: Auth, data: Me): void {
    state.me = data;
  },

  [Mutations.GENERATE_CODE_CHALLENGE](state: Auth, data: { codeVerifier: string; codeChallenge: string }): void {
    state.auth.codeChallenge = data.codeChallenge;
    state.auth.codeVerifier = data.codeVerifier;
  },

  [Mutations.RESET_LOGIN](state: Auth): void {
    state.auth = defaultAuth;
    state.me = defaultMe;
  },
};

// ACTIONS

export enum AuthActions {
  auth = "auth",
  refresh = "refresh",
}

const actions = {
  async [AuthActions.refresh](store: ActionContext<Auth, RootState>): Promise<void> {
    axios
      .post(
        "https://accounts.spotify.com/api/token",
        formurlencoded({
          grant_type: "refresh_token",
          refresh_token: store.state.auth.refreshToken,
          client_id: api.clientId,
        }),
      )
      .then((res) => {
        store.commit(Mutations.AUTH, {
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
          code: store.state.auth.code,
        });
      })
      .catch((err) => console.error("From refresh token", err));
  },

  async [AuthActions.auth](store: ActionContext<Auth, RootState>, query: string): Promise<void> {
    axios
      .post(
        "https://accounts.spotify.com/api/token",
        formurlencoded({
          grant_type: "authorization_code",
          code: query,
          redirect_uri: api.redirectUri,
          client_id: api.clientId,
          code_verifier: store.state.auth.codeVerifier,
        }),
      )
      .then(({ data }) => {
        axios
          .get<Me>(`${api.url}me`, {
            headers: { Authorization: `Bearer ${data.access_token}` },
          })
          .then((p) => {
            store.commit(Mutations.SET_ME, p.data);
            router.push("/");
          });

        store.commit(Mutations.AUTH, {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          code: query,
        });
      })
      .catch((err) => console.error("From auth", err));
  },
};

export default {
  actions,
  mutations,
  state,
};
