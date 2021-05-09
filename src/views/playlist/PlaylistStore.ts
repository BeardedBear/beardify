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
    // state.playlists = state.playlists.concat(data);
    state.playlist.name = p.name;
  },

  [Mutations.SET_TRACKS](state, tracks: PlaylistTrack[]): void {
    state.tracks = state.tracks.concat(tracks);
    // state.playlists = state.playlists.concat(data);
  },

  [Mutations.CLEAN_TRACKS](state): void {
    state.tracks = [];
    // state.playlists = state.playlists.concat(data);
  }
};

// ACTIONS

export enum PlaylistActions {
  getPlaylist = "getPlaylist",
  getPlaylistTracks = "getPlaylistTracks"
}

const actions: ActionTree<PlaylistPage, RootState> = {
  [PlaylistActions.getPlaylist](store, url: string) {
    instance.get<Playlist>(url).then(e => {
      // console.log(e.data);
      store.commit(Mutations.SET_PLAYLIST, e.data);

      // if (e.data.tracks.next !== "") store.dispatch(PlaylistActions.getPlaylist, e.data.tracks.next);
    });
  },

  [PlaylistActions.getPlaylistTracks](store, url: string) {
    instance.get<Paging<PlaylistTrack>>(url).then(e => {
      console.log(e.data);
      store.commit(Mutations.SET_TRACKS, e.data.items);
      // https://api.spotify.com/v1/playlists/1tvj7Il9ZnzPLGnRzGqQbn/tracks?offset=100&limit=100
      // store.commit(Mutations.SET_PLAYLIST, e.data);
      // store.commit(Mutations.SET_TRACKS, e.data.tracks.items);
      if (e.data.next !== "") store.dispatch(PlaylistActions.getPlaylistTracks, e.data.next);
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
