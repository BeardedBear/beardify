import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import player from "./components/player/PlayerStore";
import auth from "./views/AuthStore";
import artist from "./views/artist/ArtistStore";
import album from "./views/album/AlbumStore";
import search from "./components/search/SearchStore";
import { RootState } from "./@types/RootState";

const persisted = createPersistedState({
  key: "beardify",
  paths: ["auth", "player"]
});

export default createStore<RootState>({
  modules: { player, auth, artist, album, search },
  plugins: [persisted]
});
