import { createStore } from "vuex";
import { RootState } from "./@types/RootState";
import notification from "./components/notification/NotificationStore";
import player from "./components/player/PlayerStore";
import search from "./components/search/SearchStore";
import album from "./views/album/AlbumStore";
import artist from "./views/artist/ArtistStore";
import home from "./views/home/HomeStore";
import playlist from "./views/playlist/PlaylistStore";

export default createStore<RootState>({
  modules: { player, artist, album, search, playlist, home, notification },
});
