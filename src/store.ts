import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import player from "./components/PlayerStore";
import auth from "./views/AuthStore";
import { RootState } from "./@types/rootStore";

const persisted = createPersistedState({
  key: "beardify",
  paths: ["auth", "player"],
});

export default createStore<RootState>({
  modules: { player, auth },
  plugins: [persisted],
});
