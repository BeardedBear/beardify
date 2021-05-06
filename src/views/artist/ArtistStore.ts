import { ActionContext, ActionTree, MutationTree } from "vuex";
import { api, instance } from "../../api";
import formurlencoded from "form-urlencoded";
import axios from "axios";
import type { RootState } from "../../@types/rootStore";
import type { Auth, AuthData } from "../../@types/Auth";
import { Artist, ArtistPage, defaultArtist } from "../../@types/Artist";

const state: ArtistPage = {
  artist: defaultArtist
};

// MUTATIONS

export enum Mutations {
  SET_ARTIST = "SET_ARTIST",
}

const mutations: MutationTree<ArtistPage> = {
  [Mutations.SET_ARTIST](state, data: Artist): void {
    state.artist = data
  }
};

// ACTIONS

export enum ArtistActions {
  getArtist = "getArtist",
}

const actions: ActionTree<ArtistPage, RootState> = {
  async [ArtistActions.getArtist](store, artistId : string): Promise<void> {
    instance.get<Artist>(`https://api.spotify.com/v1/artists/${artistId}`).then((e) => {
      store.commit(Mutations.SET_ARTIST, e.data)
    })
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
