import { defineStore } from "pinia";
import { Artist } from "../../@types/Artist";
import { HomePage } from "../../@types/Home";
import { Paging } from "../../@types/Paging";
import { Track } from "../../@types/Track";
import { api, instance } from "../../api";
import { getRandomInt } from "../../helpers/random";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";

export const useHome = defineStore("home", {
  state: (): HomePage => ({
    recommendedAlbums: [],
  }),

  actions: {
    async clean() {
      this.recommendedAlbums = [];
    },

    getRecommendedAlbums() {
      interface Top {
        seed: unknown;
        tracks: Track[];
      }

      instance()
        .get<Paging<Artist>>(`${api.url}me/top/artists?time_range=long_term`)
        .then((e) => {
          const artistsSeed = `${e.data.items[getRandomInt(0, 10)]?.id},${e.data.items[getRandomInt(0, 10)]?.id},${
            e.data.items[getRandomInt(0, 10)]?.id
          },${e.data.items[getRandomInt(0, 10)]?.id},${e.data.items[getRandomInt(0, 10)]?.id}`;

          instance()
            .get<Top>(`${api.url}recommendations?market=FR&seed_artists=${artistsSeed}&limit=50`)
            .then((f) => {
              this.recommendedAlbums = removeDuplicatesAlbums(
                f.data.tracks.map((g) => g.album).filter((h) => h.album_type === "ALBUM"),
              );
            });
        });
    },
  },
});
