import { defineStore } from "pinia";

import { Album, AlbumPage } from "../../@types/Album";
import { defaultAlbum } from "../../@types/Defaults";
import { instance } from "../../api";

export const useAlbum = defineStore("album", {
  actions: {
    async clean() {
      this.album = defaultAlbum;
    },

    getAlbum(albumId: string) {
      instance()
        .get<Album>(`albums/${albumId}`)
        .then((e) => (this.album = e.data));
    },
  },

  state: (): AlbumPage => ({
    album: defaultAlbum,
  }),
});
