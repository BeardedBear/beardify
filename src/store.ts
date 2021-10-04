import { createStore } from "vuex";
import { RootState } from "./@types/RootState";
import player from "./components/player/PlayerStore";

export default createStore<RootState>({
  modules: { player },
});
