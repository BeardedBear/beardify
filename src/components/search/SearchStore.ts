import { defineStore } from "pinia";
import { Search, SearchFromAPI } from "../../@types/Search";
import { instance } from "../../api";

export const useSearch = defineStore("search", {
  state: (): Search => ({
    query: "",
    artists: [],
    albums: [],
    tracks: [],
  }),

  actions: {
    updateQuery(query: string) {
      this.query = query;
      this.search();
    },

    reset() {
      this.query = "";
      this.search();
    },

    search() {
      instance()
        .get<SearchFromAPI>(`search?q=${this.query}&type=artist%2Calbum%2Ctrack`)
        .then((e) => {
          this.artists = e.data.artists.items.slice(0, 7);
          this.albums = e.data.albums.items.slice(0, 6);
          this.tracks = e.data.tracks.items.slice(0, 6);
        });
    },
  },
});
