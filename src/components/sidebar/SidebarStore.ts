import { defineStore } from "pinia";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";
import router from "../../router";
import { useAuth } from "../../views/auth/AuthStore";

function isACollection(playlistName: SimplifiedPlaylist): boolean {
  return playlistName.name.toLowerCase().includes("#collection");
}

export const useSidebar = defineStore("sidebar", {
  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),

  actions: {
    async getPlaylists(url: string) {
      if (url && router.currentRoute.value.name !== "Login") {
        const { data } = await instance().get<Paging<SimplifiedPlaylist>>(url);

        this.playlists = this.playlists.concat(data.items).filter((p) => !isACollection(p));
        this.collections = this.collections.concat(data.items).filter((p) => isACollection(p));

        if (data.next) this.getPlaylists(data.next);
      }
    },

    async addPlaylist(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: name })
        .then(({ data }) => {
          this.playlists = [data, ...this.playlists];
        });
    },

    async addCollection(name: string) {
      const authStore = useAuth();
      instance()
        .post(`users/${authStore.me?.id}/playlists`, { name: "#Collection " + name })
        .then(({ data }) => {
          this.collections = [data, ...this.collections];
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

    refreshPlaylists() {
      this.playlists = [];
      this.collections = [];
      this.getPlaylists("me/playlists?limit=50");
    },
  },
});
