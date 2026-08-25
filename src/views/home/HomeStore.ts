import { defineStore } from "pinia";

import type { AlbumSimplified } from "@/@types/Album";
import type { Artist } from "@/@types/Artist";
import type { HomePage } from "@/@types/Home";
import type { Paging } from "@/@types/Paging";
import type { Track } from "@/@types/Track";

import { instance } from "@/api";
import { getRandomInt } from "@/helpers/random";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { isAlbum } from "@/helpers/useCleanAlbums";

export const useHome = defineStore("home", {
  actions: {
    async clean() {
      this.error = false;
      this.loading = false;
      this.recommendedAlbums = [];
    },

    // Uses the deprecated /recommendations endpoint on purpose: Beardify's client ID
    // predates Spotify's Nov 27, 2024 cutoff and keeps extended quota access. Self-hosted
    // forks registering their own client ID after that date will get a 403 here.
    /*
     * Loading, empty and failed are three different things and the view has to
     * be able to tell them apart. It used to gate its spinner on
     * `!recommendedAlbums.length`, so a successful-but-empty response and a
     * network error both rendered as a spinner that never stopped — and the
     * error was swallowed here besides.
     *
     * This endpoint deserves the care: /recommendations is deprecated, and a
     * fork with its own post-2024 client ID gets a 403 from it every time.
     */
    async getRecommendedAlbums() {
      interface Top {
        seed: unknown;
        tracks: Track[];
      }

      this.error = false;
      this.loading = true;
      try {
        const { data } = await instance().get<Paging<Artist>>("me/top/artists");
        if (!data.items.length) {
          this.recommendedAlbums = [];
          return;
        }

        const seeds = Array.from({ length: 5 }, () => data.items[getRandomInt(0, 10)]?.id);
        const f = await instance().get<Top>(
          `recommendations?market=FR&seed_artists=${seeds.join(",")}&limit=50`,
        );
        const albums: AlbumSimplified[] = [];
        for (const track of f.data.tracks) {
          if (isAlbum(track.album)) albums.push(track.album);
        }
        this.recommendedAlbums = removeDuplicatesAlbums(albums);
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching recommendations:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
  },

  state: (): HomePage => ({
    error: false,
    loading: false,
    recommendedAlbums: [],
  }),
});
