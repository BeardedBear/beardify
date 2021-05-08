import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { defaultAlbum, defaultArtist, defaultTrackSimplified } from "../../@types/Defaults";
import { RootState } from "../../@types/rootStore";
import { Search, SearchFromAPI } from "../../@types/Search";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Search = {
  query: "coucou",
  artists: [defaultArtist],
  albums: [defaultAlbum],
  tracks: [defaultTrackSimplified]
};

// MUTATIONS

export enum Mutations {
  SET_RESULTS = "SET_RESULTS"
}

const mutations: MutationTree<Search> = {
  [Mutations.SET_RESULTS](state, data: { artists: Artist[]; albums: Album[]; tracks: TrackSimplified[] }): void {
    state.artists = data.artists;
    state.albums = data.albums;
    state.tracks = data.tracks;
  }
};

// ACTIONS

export enum SearchActions {
  search = "search"
}

const actions: ActionTree<Search, RootState> = {
  [SearchActions.search](store, query: string) {
    instance.get<SearchFromAPI>(`https://api.spotify.com/v1/search?q=${query}&type=artist%2Calbum%2Ctrack`).then(e => {
      const artists = e.data.artists.items;
      const albums = e.data.albums.items;
      const tracks = e.data.tracks.items;
      store.commit(Mutations.SET_RESULTS, { artists, albums, tracks });
      // On set le dernier device actif par defaut
      console.log(e.data);
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
