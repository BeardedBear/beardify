import { useDebounceFn } from "@vueuse/core";
import { defineStore } from "pinia";

import { Album } from "@/@types/Album";
import { Search, SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { useDialog } from "@/components/dialog/DialogStore";
import { isSingle } from "@/helpers/useCleanAlbums";

// Créer la fonction debounce en dehors du store
let debouncedSearchFn: null | ReturnType<typeof useDebounceFn> = null;

export const useSearch = defineStore("search", {
  actions: {
    clear() {
      this.query = "";
      this.artists = [];
      this.albums = [];
      this.tracks = [];
      this.podcasts = [];
    },

    reset() {
      this.search();
      useDialog().close();
    },

    async search() {
      try {
        const searchResults = await instance().get<SearchFromAPI>(
          `search?q=${this.query}&type=artist%2Calbum%2Ctrack%2Cshow`,
        );
        this.artists = searchResults.data.artists.items.slice(0, 7);
        this.albums = searchResults.data.albums.items.filter((album: Album) => !isSingle(album)).slice(0, 6);
        this.tracks = searchResults.data.tracks.items.slice(0, 6);
        this.podcasts = searchResults.data.shows?.items.slice(0, 5) || [];
      } catch {
        // silent
      }
    },

    updateQuery(query: string) {
      this.query = query;
      if (this.query.length) {
        if (!debouncedSearchFn) {
          debouncedSearchFn = useDebounceFn(() => this.search(), 500);
        }
        debouncedSearchFn();
      }
    },
  },

  state: (): Search => ({
    albums: [],
    artists: [],
    podcasts: [],
    query: "",
    tracks: [],
  }),
});
