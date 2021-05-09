import { ActionTree, MutationTree } from "vuex";
import { defaultPlaylist, defaultPlaylistTrack, defaultTrack } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "../../@types/Playlist";
import { RootState } from "../../@types/RootState";
import { Track } from "../../@types/Track";
import { instance } from "../../api";

const state: PlaylistPage = {
  playlist: defaultPlaylist,
  tracks: [defaultPlaylistTrack]
};

// MUTATIONS

export enum Mutations {
  SET_PLAYLIST = "SET_PLAYLIST",
  SET_TRACKS = "SET_TRACKS",
  CLEAN_TRACKS = "CLEAN_TRACKS"
}

const mutations: MutationTree<PlaylistPage> = {
  [Mutations.SET_PLAYLIST](state, p: Playlist): void {
    state.playlist.name = p.name;
  },

  [Mutations.SET_TRACKS](state, tracks: PlaylistTrack[]): void {
    state.tracks = state.tracks.concat(tracks);
  },

  [Mutations.CLEAN_TRACKS](state): void {
    state.tracks = [];
  }
};

// ACTIONS

export enum PlaylistActions {
  getPlaylist = "getPlaylist",
  getTracks = "getTracks"
}

const actions: ActionTree<PlaylistPage, RootState> = {
  [PlaylistActions.getPlaylist](store, url: string) {
    instance.get<Playlist>(url).then(e => {
      store.commit(Mutations.SET_PLAYLIST, e.data);
    });
  },

  [PlaylistActions.getTracks](store, url: string) {
    instance.get<Paging<PlaylistTrack>>(url).then(e => {
      store.commit(Mutations.SET_TRACKS, e.data.items);
      if (e.data.next !== "") store.dispatch(PlaylistActions.getTracks, e.data.next);
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};