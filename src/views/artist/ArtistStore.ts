import { ActionContext, ActionTree, MutationTree } from "vuex";
import { api, instance } from "../../api";
import formurlencoded from "form-urlencoded";
import axios from "axios";
import type { RootState } from "../../@types/rootStore";
import type { Auth, AuthData } from "../../@types/Auth";
import { AlbumSimplified, Artist, ArtistPage, ArtistSimplified, ArtistTopTracks, defaultArtist, Track } from "../../@types/Artist";
import { defaultPaging, Paging } from "../../@types/Paging";

const state: ArtistPage = {
  artist: defaultArtist,
  topTracks: {
    tracks: []
  },
  albums: defaultPaging,
};

// MUTATIONS

export enum Mutations {
  SET_ARTIST = "SET_ARTIST",
  SET_TRACKS = "SET_TRACKS",
  SET_ALBUMS = "SET_ALBUMS",
}

const mutations: MutationTree<ArtistPage> = {
  [Mutations.SET_ARTIST](state, data: Artist): void {
    state.artist = data
  },

  [Mutations.SET_TRACKS](state, data: ArtistTopTracks): void {
    state.topTracks = data
  },

  [Mutations.SET_ALBUMS](state, data: Paging<AlbumSimplified>): void {
    state.albums = data
  }
};

// ACTIONS

export enum ArtistActions {
  getArtist = "getArtist",
  getTopTracks = "getTopTracks",
  getAlbums = "getAlbums"
}

const actions: ActionTree<ArtistPage, RootState> = {
  [ArtistActions.getArtist](store, artistId: string): void {
    instance.get<Artist>(`https://api.spotify.com/v1/artists/${artistId}`).then((e) => {
      store.commit(Mutations.SET_ARTIST, e.data)
    })
  },

  [ArtistActions.getTopTracks](store, artistId: string): void {
    instance.get<ArtistTopTracks>(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=FR`).then((e) => {
      store.commit(Mutations.SET_TRACKS, e.data)
    })
  },

  [ArtistActions.getAlbums](store, artistId: string): void {
    instance.get<Paging<ArtistSimplified>>(`https://api.spotify.com/v1/artists/${artistId}/albums?market=FR`).then((e) => {
      console.log(e.data);

      store.commit(Mutations.SET_ALBUMS, e.data)
    })
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
