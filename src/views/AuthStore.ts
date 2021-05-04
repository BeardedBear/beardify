import { ActionContext } from "vuex";
import { instance, api } from "@/api";
import formurlencoded from "form-urlencoded";
import axios, { AxiosResponse } from "axios";
import cryptoRandomString from "crypto-random-string";
import base64url from "base64url";
import { sha256 } from "js-sha256";

const cv = cryptoRandomString({ length: 128 });
const cvHashed = sha256(cv);
const cvHasedBase64url = base64url(cvHashed);

const state: Auth = {
  auth: {
    accessToken: "",
    refreshToken: "",
    code: "",
    codeVerifier: "",
    codeChallenge: ""
  },
  me: {
    displayName: ""
  }
};

// MUTATIONS

export enum Mutations {
  AUTH = "AUTH",
  GET_ME = "GET_ME"
}

const mutations = {
  [Mutations.AUTH](state: Auth, data: AuthData): void {
    state.auth.accessToken = data.accessToken;
    state.auth.refreshToken = data.refreshToken;
    state.auth.code = data.code;
  },

  [Mutations.GET_ME](state: Auth, data: string): void {
    state.me.displayName = data;
  }
};

// ACTIONS

export enum AuthActions {
  getUser = "getUser",
  auth = "auth",
  refresh = "refresh"
}

const actions = {
  [AuthActions.getUser](store: ActionContext<Auth, RootState>) {
    console.log("accesstoken", store.state.auth.code);

    instance.get("me").then((e: AxiosResponse) => store.commit("GET_ME", e.data.display_name));
  },

  /* eslint-disable @typescript-eslint/camelcase */
  async [AuthActions.refresh](store: ActionContext<Auth, RootState>) {
    // const request = await instanceAuth.post("api/token", {
    //   grant_type: "refresh_token",
    //   refresh_token: store.state.auth.refreshToken,
    //   client_id: api.clientId,
    //   client_secret: api.clientSecret
    // });

    // console.log(request);

    const request = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formurlencoded({
        grant_type: "refresh_token",
        refresh_token: store.state.auth.refreshToken,
        client_id: api.clientId,
        client_secret: api.clientSecret
      })
    });

    if (request.ok) {
      const json = await request.json();
      console.log(json);

      store.commit(Mutations.AUTH, {
        accessToken: json.access_token,
        refreshToken: json.refresh_token
      });
    } else {
      alert("HTTP-Error: " + request.status);
    }

    // if (request.ok) {
    //   const json = await request.json();
    // instance.get("/authorize", {
    //   response_type: "code"
    // });
    // axios.get("https://accounts.spotify.com/authorize", {
    //   response_type: "code"
    // });
    // fetch(
    //   `https://accounts.spotify.com/authorize?response_type=code&client_id=${api.clientId}&redirect_uri=${api.redirectUri}&scope=${api.scopes}`,
    //   {
    //     headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //     method: "GET"
    //   }
    // );
    // fetch("https://accounts.spotify.com/api/token", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //   body: formurlencoded({
    //     grant_type: "authorization_code",
    //     code: store.state.auth.code,
    //     redirect_uri: api.redirectUri,
    //     client_id: api.clientId,
    //     client_secret: api.clientSecret,
    //     scope: "user-read-playback-state"
    //   })
    // });
    //   store.commit("AUTH", {
    //     accessToken: json.access_token,
    //     refreshToken: json.refresh_token
    //   });
    // } else {
    //   alert("HTTP-Error: " + request.status);
    // }
  },

  async [AuthActions.auth](store: ActionContext<Auth, RootState>, query: string) {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formurlencoded({
        grant_type: "authorization_code",
        code: query,
        redirect_uri: api.redirectUri,
        client_id: api.clientId,
        code_verifier: api.codeVerifier
      })
    });

    if (response.ok) {
      const json = await response.json();
      console.log(json);

      axios
        .get("https://api.spotify.com/v1/me", {
          headers: {
            Authorization: `Bearer ${json.access_token}`,
            "Content-Type": "application/json"
          }
        })
        .then(p => store.commit("GET_ME", p.data.display_name));

      // fetch("https://api.spotify.com/v1/me", {
      //   headers: {
      //     Authorization: `Bearer ${json.access_token}`,
      //     "Content-Type": "application/json"
      //   }
      // })
      //   .then(i => {
      //     console.log(i.blob());
      //   })
      //   .then(o => {
      //     console.log(o);
      //   });

      store.commit(Mutations.AUTH, {
        accessToken: json.access_token,
        refreshToken: json.refresh_token,
        code: query
      });
    } else {
      alert("HTTP-Error: " + response.status);
    }
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
