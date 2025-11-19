import { defineStore } from "pinia";

import { Paging } from "@/@types/Paging";
import { SimplifiedPlaylist } from "@/@types/Playlist";
import { User, UserStore } from "@/@types/User";
import { instance } from "@/api";

function isACollection(playlistName: SimplifiedPlaylist): boolean {
  return playlistName.name.toLowerCase().includes("#collection");
}

export const useUserStore = defineStore("user", {
  actions: {
    async clean() {
      this.user = null;
      this.collections = [];
      this.playlists = [];
    },

    async getUser(userId: string) {
      this.user = (await instance().get<User>(`users/${userId}`)).data;
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

  state: (): UserStore => ({
    collections: [],
    playlists: [],
    user: null,
  }),
});
