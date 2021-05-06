import { ActionContext, ActionTree, MutationTree } from "vuex";
import { api, instance } from "../../api";
import formurlencoded from "form-urlencoded";
import axios from "axios";
import type { RootState } from "../../@types/rootStore";
import type { Auth, AuthData } from "../../@types/Auth";
import { AlbumSimplified, Artist, ArtistPage, ArtistSimplified, ArtistTopTracks, defaultArtist, RelatedArtists, Track } from "../../@types/Artist";
import { defaultPaging, Paging } from "../../@types/Paging";

const state: ArtistPage = {
  artist: defaultArtist,
  topTracks: {
    tracks: []
  },
  albums: [],
  relatedArtists : {
    artists : []
  }
};

// MUTATIONS

export enum Mutations {
  SET_ARTIST = "SET_ARTIST",
  SET_TRACKS = "SET_TRACKS",
  SET_ALBUMS = "SET_ALBUMS",
  SET_RELATED_ARTISTS = "SET_RELATED_ARTISTS",
}

const mutations: MutationTree<ArtistPage> = {
  [Mutations.SET_ARTIST](state, data: Artist): void {
    state.artist = data
  },

  [Mutations.SET_TRACKS](state, data: ArtistTopTracks): void {
    state.topTracks = data
  },

  [Mutations.SET_ALBUMS](state, data: AlbumSimplified[]): void {
    state.albums = data
  },

  [Mutations.SET_RELATED_ARTISTS](state, data: Artist[]): void {
    state.relatedArtists.artists = data
  }
};

// ACTIONS

export enum ArtistActions {
  getArtist = "getArtist",
  getTopTracks = "getTopTracks",
  getAlbums = "getAlbums",
  getRelatedArtists = "getRelatedArtists"
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
    instance.get<Paging<ArtistSimplified>>(`https://api.spotify.com/v1/artists/${artistId}/albums?market=FR&include_groups=album`).then((e) => {
      const removedDuplicateAlbums = e.data.items.reduce((acc: ArtistSimplified[], value) => acc.some(i => i.name === value.name) ? acc : acc.concat(value), []);

      store.commit(Mutations.SET_ALBUMS, removedDuplicateAlbums)
    })
  },

  [ArtistActions.getRelatedArtists](store, artistId: string): void {
    instance.get<RelatedArtists>(`https://api.spotify.com/v1/artists/${artistId}/related-artists`).then((e) => {
      store.commit(Mutations.SET_RELATED_ARTISTS, e.data.artists)
    })
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
