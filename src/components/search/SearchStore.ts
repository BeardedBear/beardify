import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { RootState } from "../../@types/RootState";
import { Search, SearchFromAPI } from "../../@types/Search";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Search = {
  query: "",
  artists: [],
  albums: [],
  tracks: [],
};

// MUTATIONS

export enum Mutations {
  SEARCH_RESULTS = "SEARCH_RESULTS",
}

const mutations: MutationTree<Search> = {
  // [Mutations.SEARCH_RESULTS](state, data: { artists: Artist[]; albums: Album[]; tracks: TrackSimplified[] }): void {
  //   state.artists = data.artists;
  //   state.albums = data.albums;
  //   state.tracks = data.tracks;
  // },
};

// ACTIONS

export enum SearchActions {
  search = "search",
}

const actions: ActionTree<Search, RootState> = {
  [SearchActions.search](_store, query: string) {
    instance().get<SearchFromAPI>(`search?q=s${query}&type=artist%2Calbum%2Ctrack`);
  },
};

export default {
  actions,
  mutations,
  state,
};
