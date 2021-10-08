import { defineStore } from "pinia";
import { AlbumPage } from "../../@types/Album";
import { defaultAlbum } from "../../@types/Defaults";
import { instance } from "../../api";

export const useAlbum = defineStore("album", {
  state: (): AlbumPage => ({
    album: defaultAlbum,
  }),

  actions: {
    async clean() {
      this.album = defaultAlbum;
    },

    getAlbum(albumId: string) {
      instance()
        .get(`albums/${albumId}`)
        .then((e) => (this.album = e.data));
    },
  },
});
