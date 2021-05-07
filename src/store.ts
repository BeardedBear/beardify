import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import player from "./components/PlayerStore";
import auth from "./views/AuthStore";
import artist from "./views/artist/ArtistStore";
import album from "./views/album/AlbumStore";
import { RootState } from "./@types/rootStore";

const persisted = createPersistedState({
  key: "beardify",
  paths: ["auth", "player"]
});

export default createStore<RootState>({
  modules: { player, auth, artist, album },
  plugins: [persisted]
});
