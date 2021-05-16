import { ActionTree, MutationTree } from "vuex";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { RootState } from "../../@types/RootState";
import { Sidebar } from "../../@types/Sidebar";
import { api, instance } from "../../api";

const state: Sidebar = {
  collections: [],
  playlists: [],
};

// MUTATIONS

export enum Mutations {
  SET_RESULTS = "SET_RESULTS",
  RESET = "RESET",
}

const mutations: MutationTree<Sidebar> = {
  [Mutations.SET_RESULTS](state, data: SimplifiedPlaylist[]): void {
    state.playlists = state.playlists.concat(data);
  },

  [Mutations.RESET](state): void {
    state.playlists = [];
  },
};

// ACTIONS

export enum SidebarActions {
  getPlaylists = "getPlaylists",
  add = "add",
  addCollection = "addCollection",
  remove = "remove",
}

const actions: ActionTree<Sidebar, RootState> = {
  [SidebarActions.getPlaylists](store, url: string) {
    instance.get<Paging<SimplifiedPlaylist>>(url).then((e) => {
      store.commit(Mutations.SET_RESULTS, e.data.items);
      if (e.data.next !== "") store.dispatch(SidebarActions.getPlaylists, e.data.next);
    });
  },

  [SidebarActions.add](store, name: string) {
    instance.post(`users/${store.rootState.auth.me?.id}/playlists`, { name: name }).then(() => {
      store.commit(Mutations.RESET);
      store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
    });
  },

  [SidebarActions.addCollection](store, name: string) {
    instance.post(`users/${store.rootState.auth.me?.id}/playlists`, { name: "#Collection " + name }).then(() => {
      store.commit(Mutations.RESET);
      store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
    });
  },

  [SidebarActions.remove](store, playlistId: string) {
    console.log();

    instance.delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`).then(() => {
      store.commit(Mutations.RESET);
      store.dispatch(SidebarActions.getPlaylists, `${api.url}me/playlists?limit=50`);
    });
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
