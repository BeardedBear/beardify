import { ActionTree, MutationTree } from "vuex";
import {
  Config,
  schemeDefault,
  ThemeColor,
  themeDark,
  themeLight,
  schemeBlue,
  schemeCrimson,
  schemeApple,
} from "../../@types/Config";
import { Dialog } from "../../@types/Dialog";
import { RootState } from "../../@types/RootState";

const state: Config = {
  show: false,
  theme: themeDark,
  themeLabel: "dark",
  scheme: schemeDefault,
  schemeLabel: "default",
};

// MUTATIONS

export enum Mutations {
  SWITCH_THEME_LIGHT = "SWITCH_THEME_LIGHT",
  SWITCH_THEME_DARK = "SWITCH_THEME_DARK",
  SCHEME_DEFAULT = "SCHEME_DEFAULT",
  SCHEME_BLUE = "SCHEME_BLUE",
  SCHEME_CRIMSON = "SCHEME_CRIMSON",
  SCHEME_APPLE = "SCHEME_APPLE",
  OPEN = "OPEN",
  CLOSE = "CLOSE",
}

const mutations: MutationTree<Config> = {
  [Mutations.SWITCH_THEME_LIGHT](state): void {
    state.theme = themeLight;
    state.themeLabel = "light";
    state.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SWITCH_THEME_DARK](state): void {
    state.theme = themeDark;
    state.themeLabel = "dark";
    state.theme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SCHEME_DEFAULT](state): void {
    state.scheme = schemeDefault;
    state.schemeLabel = "default";
    state.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SCHEME_BLUE](state): void {
    state.scheme = schemeBlue;
    state.schemeLabel = "blue";
    state.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SCHEME_CRIMSON](state): void {
    state.scheme = schemeCrimson;
    state.schemeLabel = "crimson";
    state.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.SCHEME_APPLE](state): void {
    state.scheme = schemeApple;
    state.schemeLabel = "apple";
    state.scheme.forEach((c: ThemeColor) => document.documentElement.style.setProperty(c.var, c.color));
  },

  [Mutations.OPEN](state): void {
    state.show = true;
  },

  [Mutations.CLOSE](state): void {
    state.show = false;
  },
};

// ACTIONS

export enum ConfigActions {}

const actions: ActionTree<Dialog, RootState> = {};

export default {
  actions,
  mutations,
  namespaced: true,
  state,
};
