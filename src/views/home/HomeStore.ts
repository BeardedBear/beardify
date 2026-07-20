import { defineStore } from "pinia";

import type { AlbumSimplified } from "@/@types/Album";
import type { Artist } from "@/@types/Artist";
import type { HomePage } from "@/@types/Home";
import type { Paging } from "@/@types/Paging";

import { instance } from "@/api";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";

// "Get Recommendations" has no official replacement (deprecated, Spotify
// dropped the seed-based algorithm), so the home page instead surfaces
// recent albums from the user's top artists.
const TOP_ARTISTS_SAMPLE_SIZE = 5;

export const useHome = defineStore("home", {
  actions: {
    async clean() {
      this.recommendedAlbums = [];
    },

    async getRecommendedAlbums() {
      const { data } = await instance().get<Paging<Artist>>("me/top/artists?limit=10");

      if (!data.items.length) {
        this.recommendedAlbums = [];
        return;
      }

      const sampledArtists = data.items.slice(0, TOP_ARTISTS_SAMPLE_SIZE);

      try {
        const albumsByArtist = await Promise.all(
          sampledArtists.map(async (artist) => {
            const { data: albumsPage } = await instance().get<Paging<AlbumSimplified>>(
              `artists/${artist.id}/albums?include_groups=album,single&limit=10`,
            );
            return albumsPage.items;
          }),
        );

        const albums = albumsByArtist
          .flat()
          .sort((a, b) => (a.release_date < b.release_date ? 1 : -1));

        this.recommendedAlbums = removeDuplicatesAlbums(albums);
      } catch {
        // silent fail
      }
    },
  },

  state: (): HomePage => ({
    recommendedAlbums: [],
  }),
});
