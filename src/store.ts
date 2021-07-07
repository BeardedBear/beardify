import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";
import { RootState } from "./@types/RootState";
import config from "./components/config/ConfigStore";
import dialog from "./components/dialog/DialogStore";
import player from "./components/player/PlayerStore";
import search from "./components/search/SearchStore";
import sidebar from "./components/sidebar/SidebarStore";
import album from "./views/album/AlbumStore";
import artist from "./views/artist/ArtistStore";
import auth from "./views/auth/AuthStore";
import home from "./views/home/HomeStore";
import playlist from "./views/playlist/PlaylistStore";

const persisted = createPersistedState({
  key: "beardify",
  paths: ["auth", "config"],
});

export default createStore<RootState>({
  modules: { player, auth, artist, album, sidebar, playlist, dialog, config, home, search },
  plugins: [persisted],
});
