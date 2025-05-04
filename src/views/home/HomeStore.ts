import { defineStore } from "pinia";

import type { AlbumSimplified } from "../../@types/Album";
import type { Artist } from "../../@types/Artist";
import type { HomePage } from "../../@types/Home";
import type { Paging } from "../../@types/Paging";
import type { Track } from "../../@types/Track";

import { instance } from "../../api";
import { getRandomInt } from "../../helpers/random";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { isAlbum } from "../../helpers/useCleanAlbums";

export const useHome = defineStore("home", {
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
        const id1 = data.items[getRandomInt(0, 10)]?.id;
        const id2 = data.items[getRandomInt(0, 10)]?.id;
        const id3 = data.items[getRandomInt(0, 10)]?.id;
        const id4 = data.items[getRandomInt(0, 10)]?.id;
        const id5 = data.items[getRandomInt(0, 10)]?.id;
        const artistsSeed = `${id1},${id2},${id3},${id4},${id5}`;

        instance()
          .get<Top>(`recommendations?market=FR&seed_artists=${artistsSeed}&limit=50`)
          .then((f) => {
            const cleanedList = removeDuplicatesAlbums(
              f.data.tracks.map((g: Track) => g.album).filter((h: AlbumSimplified) => isAlbum(h)),
            );
            this.recommendedAlbums = cleanedList;
          });
      } else if (!this.recommendedAlbums.length) this.getRecommendedAlbums();
    },
  },

  state: (): HomePage => ({
    recommendedAlbums: [],
  }),
});
