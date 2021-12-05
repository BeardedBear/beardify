import { defineStore } from "pinia";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { api, instance } from "../../api";
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
      if (url) {
        instance()
          .get<Paging<SimplifiedPlaylist>>(url)
          .then((e) => {
            this.playlists = this.playlists.concat(e.data.items);
            if (e.data.next) this.getPlaylists(e.data.next);
          })
          .then(() => {
            if (!this.playlists.length) this.getPlaylists(`${api.url}me/playlists?limit=50`);
          });
      }
    },

    async addPlaylist(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: name })
        .then(() => {
          this.reset();
          this.getPlaylists(`${api.url}me/playlists?limit=50`);
        });
    },

    async addCollection(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: "#Collection " + name })
        .then(() => {
          this.reset();
          this.getPlaylists(`${api.url}me/playlists?limit=50`);
        });
    },

    async removePlaylist(playlistId: string) {
      instance()
        .delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`)
        .then(() => {
          this.reset();
          this.getPlaylists(`${api.url}me/playlists?limit=50`);

          if (location.pathname.includes(playlistId)) router.push("/");
        });
    },
  },
});
