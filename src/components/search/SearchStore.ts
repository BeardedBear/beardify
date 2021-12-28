import { defineStore } from "pinia";
import { Search, SearchFromAPI } from "../../@types/Search";
import { instance } from "../../api";
import { useDialog } from "../dialog/DialogStore";

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
      this.query.length && this.search();
    },

    clear() {
      this.query = "";
      this.artists = [];
      this.albums = [];
      this.tracks = [];
    },

    reset() {
      this.search();
      useDialog().close();
    },

    search() {
      instance()
        .get<SearchFromAPI>(`search?q=${this.query}&type=artist%2Calbum%2Ctrack`)
        .then((e) => {
          this.artists = e.data.artists.items.slice(0, 7);
          this.albums = e.data.albums.items.filter((album) => album.album_type === "album").slice(0, 6);
          this.tracks = e.data.tracks.items.slice(0, 6);
        });
    },
  },
});
