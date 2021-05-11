import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import player from "./components/player/PlayerStore";
import auth from "./views/auth/AuthStore";
import artist from "./views/artist/ArtistStore";
import album from "./views/album/AlbumStore";
import dialog from "./components/dialog/DialogStore";
import search from "./components/search/SearchStore";
import sidebar from "./components/sidebar/SidebarStore";
import playlist from "./views/playlist/PlaylistStore";
import config from "./components/config/ConfigStore";
import { RootState } from "./@types/RootState";

const persisted = createPersistedState({
  key: "beardify",
  paths: ["auth", "player", "config.theme"]
});

export default createStore<RootState>({
  modules: { player, auth, artist, album, search, sidebar, playlist, dialog, config },
  plugins: [persisted]
});
