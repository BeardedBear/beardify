import { defineStore } from "pinia";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";
import router from "../../router";
import { useAuth } from "../../views/auth/AuthStore";

export const useSidebar = defineStore("sidebar", {
  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),

  actions: {
    reset() {
      this.playlists = [];
    },

    getPlaylists(url: string) {
      if (url && router.currentRoute.value.name !== "Login") {
        instance()
          .get<Paging<SimplifiedPlaylist>>(url)
          .then((e) => {
            this.playlists = this.playlists.concat(e.data.items);
            if (e.data.next) this.getPlaylists(e.data.next);
          });
      }
    },

    async addPlaylist(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: name })
        .then(() => {
          this.reset();
          this.getPlaylists(`me/playlists?limit=50`);
        });
    },

    async addCollection(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: "#Collection " + name })
        .then(() => {
          this.reset();
          this.getPlaylists(`me/playlists?limit=50`);
        });
    },

    async removePlaylist(playlistId: string) {
      instance()
        .delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`)
        .then(() => {
          this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
          this.collections = this.collections.filter((collection) => collection.id !== playlistId);
          if (location.pathname.includes(playlistId)) router.push("/");
        });
    },
  },
});
