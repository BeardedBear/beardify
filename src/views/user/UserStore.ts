import { defineStore } from "pinia";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Me, UserStore } from "../../@types/User";
import { instance } from "../../api";

function isACollection(playlistName: SimplifiedPlaylist): boolean {
  return playlistName.name.toLowerCase().includes("#collection");
}

export const useUserStore = defineStore("user", {
  state: (): UserStore => ({
    user: null,
    collections: [],
    playlists: [],
  }),

  actions: {
    async clean() {
      this.user = null;
      this.collections = [];
      this.playlists = [];
    },

    async getUser(userId: string) {
      this.user = (await instance().get<Me>(`users/${userId}`)).data;
    },

    async getUserPlaylists(url: string) {
      const { data } = await instance().get<Paging<SimplifiedPlaylist>>(url);

      this.playlists = this.playlists
        .concat(data.items)
        .filter((p) => !isACollection(p) && p.public && p.owner.id === this.user?.id);
      this.collections = this.collections
        .concat(data.items)
        .filter((p) => isACollection(p) && p.public && p.owner.id === this.user?.id);

      if (data.next) this.getUserPlaylists(data.next);
    },
  },
});
