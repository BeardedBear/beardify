import { AxiosResponse } from "axios";
import { log } from "console";
import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { defaultSimplifiedPlaylist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { RootState } from "../../@types/RootState";
import { Search, SearchFromAPI } from "../../@types/Search";
import { Sidebar } from "../../@types/Sidebar";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Sidebar = {
  collections: [defaultSimplifiedPlaylist],
  playlists: [defaultSimplifiedPlaylist]
};

// MUTATIONS

export enum Mutations {
  SET_RESULTS = "SET_RESULTS"
}

const mutations: MutationTree<Sidebar> = {
  [Mutations.SET_RESULTS](state, data: SimplifiedPlaylist[]): void {
    state.playlists = state.playlists.concat(data);
    console.log("coucou");
  }
};

// ACTIONS

export enum SidebarActions {
  getPlaylists = "getPlaylists"
}

const actions: ActionTree<Sidebar, RootState> = {
  [SidebarActions.getPlaylists](store, url: string) {
    instance.get<Paging<SimplifiedPlaylist>>(url).then(e => {
      store.commit(Mutations.SET_RESULTS, e.data.items);
      if (e.data.next !== "") store.dispatch(SidebarActions.getPlaylists, e.data.next);
    });
  }
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
