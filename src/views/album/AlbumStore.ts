import { ActionTree, MutationTree } from "vuex";
import { instance } from "../../api";
import { RootState } from "../../@types/RootState";

import { Album, AlbumPage } from "../../@types/Album";
import { defaultAlbum } from "../../@types/Defaults";

const state: AlbumPage = {
  album: defaultAlbum,
};

// MUTATIONS

export enum Mutations {
  SET_ALBUM = "SET_ALBUM",
}

const mutations: MutationTree<AlbumPage> = {
  [Mutations.SET_ALBUM](state, data: Album): void {
    state.album = data;
  },
};

// ACTIONS

export enum AlbumActions {
  getAlbum = "getAlbum",
}

const actions: ActionTree<AlbumPage, RootState> = {
  [AlbumActions.getAlbum](store, albumId: string): void {
    instance.get(`https://api.spotify.com/v1/albums/${albumId}`).then((e) => {
      store.commit(Mutations.SET_ALBUM, e.data);
    });
  },
};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
