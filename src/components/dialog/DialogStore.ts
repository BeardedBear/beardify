import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { defaultAlbum, defaultArtist, defaultTrackSimplified } from "../../@types/Defaults";
import { Dialog, DialogType } from "../../@types/Dialog";
import { RootState } from "../../@types/RootState";
import { Search, SearchFromAPI } from "../../@types/Search";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Dialog = {
  show: false,
  type: "none"
};

// MUTATIONS

export enum Mutations {
  OPEN = "OPEN",
  CLOSE = "CLOSE"
}

const mutations: MutationTree<Dialog> = {
  [Mutations.OPEN](state, data: { type: DialogType; albumId?: string }): void {
    state.show = true;
    state.type = data.type;
    if (data.albumId) state.albumId = data.albumId;
  },

  [Mutations.CLOSE](state): void {
    state.show = false;
    state.type = "none";
  }
};

// ACTIONS

export enum DialogActions {
  open = "open"
}

const actions: ActionTree<Dialog, RootState> = {
  [DialogActions.open](store, type: DialogType) {
    // instance.get<SearchFromAPI>(`https://api.spotify.com/v1/search?q=${query}&type=artist%2Calbum%2Ctrack`).then(e => {
    //   const artists = e.data.artists.items.slice(0, 12);
    //   const albums = e.data.albums.items.slice(0, 6);
    //   const tracks = e.data.tracks.items.slice(0, 6);
    //   store.commit(Mutations.SET_RESULTS, { artists, albums, tracks });
    // });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
