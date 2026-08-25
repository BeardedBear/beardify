import { defineStore } from "pinia";

import { Album, AlbumPage } from "@/@types/Album";
import { defaultAlbum } from "@/@types/Defaults";
import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import { notification } from "@/helpers/notifications";

export const useAlbum = defineStore("album", {
  actions: {
    async clean() {
      this.album = defaultAlbum;
    },

    async getAlbum(albumId: string) {
      try {
        const e = await instance().get<Album>(`albums/${albumId}`);
        this.album = e.data;
      } catch {
        this.album = defaultAlbum;
        notification({ msg: "Unable to load this album.", type: NotificationType.Error });
      }
    },
  },

  state: (): AlbumPage => ({
    album: defaultAlbum,
  }),
});
