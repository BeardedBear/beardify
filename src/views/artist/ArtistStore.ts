import { ActionTree, MutationTree } from "vuex";
import { instance } from "../../api";
import { RootState } from "../../@types/rootStore";
import {
  AlbumSimplified,
  Artist,
  ArtistPage,
  ArtistSimplified,
  ArtistTopTracks,
  defaultArtist,
  RelatedArtists
} from "../../@types/Artist";
import { Paging } from "../../@types/Paging";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";

const state: ArtistPage = {
  artist: defaultArtist,
  topTracks: {
    tracks: []
  },
  albums: [],
  singles: [],
  relatedArtists: {
    artists: []
  }
};

// MUTATIONS

export enum Mutations {
  SET_ARTIST = "SET_ARTIST",
  SET_TRACKS = "SET_TRACKS",
  SET_ALBUMS = "SET_ALBUMS",
  SET_SINGLES = "SET_SINGLES",
  SET_RELATED_ARTISTS = "SET_RELATED_ARTISTS"
}

const mutations: MutationTree<ArtistPage> = {
  [Mutations.SET_ARTIST](state, data: Artist): void {
    state.artist = data;
  },

  [Mutations.SET_TRACKS](state, data: ArtistTopTracks): void {
    state.topTracks = data;
  },

  [Mutations.SET_ALBUMS](state, data: AlbumSimplified[]): void {
    state.albums = data;
  },

  [Mutations.SET_SINGLES](state, data: AlbumSimplified[]): void {
    state.singles = data;
  },

  [Mutations.SET_RELATED_ARTISTS](state, data: Artist[]): void {
    state.relatedArtists.artists = data;
  }
};

// ACTIONS

export enum ArtistActions {
  getArtist = "getArtist",
  getTopTracks = "getTopTracks",
  getAlbums = "getAlbums",
  getSingles = "getSingles",
  getRelatedArtists = "getRelatedArtists"
}

const actions: ActionTree<ArtistPage, RootState> = {
  [ArtistActions.getArtist](store, artistId: string): void {
    instance.get<Artist>(`https://api.spotify.com/v1/artists/${artistId}`).then(e => {
      store.commit(Mutations.SET_ARTIST, e.data);
    });
  },

  [ArtistActions.getTopTracks](store, artistId: string): void {
    instance.get<ArtistTopTracks>(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=FR`).then(e => {
      store.commit(Mutations.SET_TRACKS, e.data);
    });
  },

  [ArtistActions.getAlbums](store, artistId: string): void {
    instance
      .get<Paging<AlbumSimplified>>(
        `https://api.spotify.com/v1/artists/${artistId}/albums?market=FR&include_groups=album&limit=50`
      )
      .then(e => store.commit(Mutations.SET_ALBUMS, removeDuplicatesAlbums(e.data.items)));
  },

  [ArtistActions.getSingles](store, artistId: string): void {
    instance
      .get<Paging<AlbumSimplified>>(
        `https://api.spotify.com/v1/artists/${artistId}/albums?market=FR&include_groups=single&limit=50`
      )
      .then(e => store.commit(Mutations.SET_SINGLES, removeDuplicatesAlbums(e.data.items)));
  },

  [ArtistActions.getRelatedArtists](store, artistId: string): void {
    instance.get<RelatedArtists>(`https://api.spotify.com/v1/artists/${artistId}/related-artists`).then(e => {
      store.commit(Mutations.SET_RELATED_ARTISTS, e.data.artists);
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
