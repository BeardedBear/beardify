import { defineStore } from "pinia";

import { Album, AlbumPage } from "@/@types/Album";
import { defaultAlbum } from "@/@types/Defaults";
import { instance } from "@/api";

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
        // silent fail
      }
    },
  },

  state: (): AlbumPage => ({
    album: defaultAlbum,
  }),
});
