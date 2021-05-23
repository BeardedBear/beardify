import { ActionTree, MutationTree } from "vuex";
import { Dialog, DialogType } from "../../@types/Dialog";
import { RootState } from "../../@types/RootState";

const state: Dialog = {
  show: false,
  type: "none",
};

// MUTATIONS

export enum Mutations {
  OPEN_DIALOG = "OPEN_DIALOG",
  CLOSE_DIALOG = "CLOSE_DIALOG",
}

const mutations: MutationTree<Dialog> = {
  [Mutations.OPEN_DIALOG](state, data: { type: DialogType; albumId?: string; playlistId?: string }): void {
    state.show = true;
    state.type = data.type;
    if (data.albumId) state.albumId = data.albumId;
    if (data.playlistId) state.playlistId = data.playlistId;
  },

  [Mutations.CLOSE_DIALOG](state): void {
    state.show = false;
    state.type = "none";
  },
};

// ACTIONS

export enum DialogActions {}

const actions: ActionTree<Dialog, RootState> = {};

export default {
  actions,
  mutations,
  state,
};
