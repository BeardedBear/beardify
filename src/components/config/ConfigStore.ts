// document.documentElement.style.setProperty('--primary-color', '#FF0000');

import { ActionTree, MutationTree } from "vuex";
import { Album } from "../../@types/Album";
import { Artist } from "../../@types/Artist";
import { Config } from "../../@types/Config";
import { defaultAlbum, defaultArtist, defaultTrackSimplified } from "../../@types/Defaults";
import { Dialog, DialogType } from "../../@types/Dialog";
import { RootState } from "../../@types/RootState";
import { Search, SearchFromAPI } from "../../@types/Search";
import { TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";

const state: Config = {
  theme: "dark"
};

// MUTATIONS

export enum Mutations {
  SWITCH_THEME = "SWITCH_THEME"
}

const mutations: MutationTree<Config> = {
  [Mutations.SWITCH_THEME](state): void {
    state.theme === "dark" ? "light" : "dark";
  }
};

// ACTIONS

export enum ConfigActions {
  open = "open"
}

const actions: ActionTree<Dialog, RootState> = {
  [ConfigActions.open](store) {}
};

export default {
  actions,
  mutations,
  namespaced: true,
  state
};
