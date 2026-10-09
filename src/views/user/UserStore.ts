import { defineStore } from "pinia";

import { Paging } from "@/@types/Paging";
import { SimplifiedPlaylist } from "@/@types/Playlist";
import { User, UserStore } from "@/@types/User";
import { instance } from "@/api";
import { isACollection } from "@/helpers/isCollection";

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

      const owned = data.items.filter((p) => p.public && p.owner.id === this.user?.id);
      this.playlists = this.playlists.concat(owned.filter((p) => !isACollection(p)));
      this.collections = this.collections.concat(owned.filter((p) => isACollection(p)));

      if (data.next) await this.getUserPlaylists(data.next);
    },
  },

  state: (): UserStore => ({
    collections: [],
    playlists: [],
    user: null,
  }),
});
