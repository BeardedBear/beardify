import { ActionTree, MutationTree } from "vuex";
import { Config, ThemeColor, themeDark, themeLight } from "../../@types/Config";
import { Dialog } from "../../@types/Dialog";
import { RootState } from "../../@types/RootState";

const state: Config = {
  show: false,
  theme: themeDark
};

// MUTATIONS

export enum Mutations {
  SWITCH_THEME_LIGHT = "SWITCH_THEME_LIGHT",
  SWITCH_THEME_DARK = "SWITCH_THEME_DARK",
  OPEN = "OPEN",
  CLOSE = "CLOSE"
}

const mutations: MutationTree<Config> = {
  [Mutations.SWITCH_THEME_LIGHT](state): void {
    state.theme = themeLight;
    state.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SWITCH_THEME_DARK](state): void {
    state.theme = themeDark;
    state.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.OPEN](state): void {
    state.show = true;
  },

  [Mutations.CLOSE](state): void {
    state.show = false;
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
