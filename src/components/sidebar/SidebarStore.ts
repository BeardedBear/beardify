import { ActionTree, MutationTree } from "vuex";
import { defaultSimplifiedPlaylist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { RootState } from "../../@types/RootState";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";

const state: Sidebar = {
  collections: [defaultSimplifiedPlaylist],
  playlists: [defaultSimplifiedPlaylist],
};

// MUTATIONS

export enum Mutations {
  SET_RESULTS = "SET_RESULTS",
}

const mutations: MutationTree<Sidebar> = {
  [Mutations.SET_RESULTS](state, data: SimplifiedPlaylist[]): void {
    state.playlists = state.playlists.concat(data);
  },
};

// ACTIONS

export enum SidebarActions {
  getPlaylists = "getPlaylists",
}

const actions: ActionTree<Sidebar, RootState> = {
  [SidebarActions.getPlaylists](store, url: string) {
    instance.get<Paging<SimplifiedPlaylist>>(url).then((e) => {
      store.commit(Mutations.SET_RESULTS, e.data.items);
      if (e.data.next !== "") store.dispatch(SidebarActions.getPlaylists, e.data.next);
    });
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
