import { defineStore } from "pinia";

import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";
import { isPlaylistOwner } from "../../helpers/playlist";
import router from "../../router";
import { useAuth } from "../../views/auth/AuthStore";
import { usePlaylist } from "../../views/playlist/PlaylistStore";

function isACollection(playlistName: SimplifiedPlaylist): boolean {
  return playlistName.name.toLowerCase().includes("#collection");
}

export const useSidebar = defineStore("sidebar", {
  actions: {
    async addCollection(name: string) {
      const authStore = useAuth();
      instance()
        .post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, {
          name: `#Collection ${name}`,
        })
        .then(({ data }) => {
          this.collections = [data as SimplifiedPlaylist, ...this.collections];
        });
    },

    async addPlaylist(name: string) {
      const authStore = useAuth();
      instance()
        .post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, { name })
        .then(({ data }) => {
          this.playlists = [data as SimplifiedPlaylist, ...this.playlists];
        });
    },

    async getPlaylists(url: string) {
      if (url && router.currentRoute.value.name !== "Login") {
        const { data } = await instance().get<Paging<SimplifiedPlaylist>>(url);

        this.playlists = this.playlists.concat(data.items).filter((p) => !isACollection(p));
        this.collections = this.collections.concat(data.items).filter((p) => isACollection(p));

        if (data.next) this.getPlaylists(data.next);
      }
    },

    refreshPlaylists() {
      this.playlists = [];
      this.collections = [];
      this.getPlaylists("me/playlists?limit=50");
    },

    async removePlaylist(playlistId: string) {
      const playlistStore = usePlaylist();
      instance()
        .delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`)
        .then(() => {
          this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
          this.collections = this.collections.filter((collection) => collection.id !== playlistId);
          playlistStore.followed = false;
          if (isPlaylistOwner(playlistStore.playlist.owner)) {
            router.push("/");
          }
        });
    },
  },

  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),
});
