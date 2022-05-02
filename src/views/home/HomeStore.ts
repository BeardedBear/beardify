import { defineStore } from "pinia";
import { Artist } from "../../@types/Artist";
import { HomePage } from "../../@types/Home";
import { Paging } from "../../@types/Paging";
import { Track } from "../../@types/Track";
import { instance } from "../../api";
import { getRandomInt } from "../../helpers/random";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { isAlbum } from "../../helpers/useCleanAlbums";

export const useHome = defineStore("home", {
  state: (): HomePage => ({
    recommendedAlbums: [],
  }),

  actions: {
    async clean() {
      this.recommendedAlbums = [];
    },

    async getRecommendedAlbums() {
      interface Top {
        seed: unknown;
        tracks: Track[];
      }

      const { data } = await instance().get<Paging<Artist>>("me/top/artists");

      if (data.items.length) {
        const artistsSeed = `${data.items[getRandomInt(0, 10)]?.id},${data.items[getRandomInt(0, 10)]?.id},${
          data.items[getRandomInt(0, 10)]?.id
        },${data.items[getRandomInt(0, 10)]?.id},${data.items[getRandomInt(0, 10)]?.id}`;
        instance()
          .get<Top>(`recommendations?market=FR&seed_artists=${artistsSeed}&limit=50`)
          .then((f) => {
            const cleanedList = removeDuplicatesAlbums(f.data.tracks.map((g) => g.album).filter((h) => isAlbum(h)));
            this.recommendedAlbums = cleanedList;
          });
      } else if (!this.recommendedAlbums.length) this.getRecommendedAlbums();
    },
  },
});
