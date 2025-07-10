import { defineStore } from "pinia";

import { Album } from "../../@types/Album";
import { Search, SearchFromAPI } from "../../@types/Search";
import { instance } from "../../api";
import { isSingle } from "../../helpers/useCleanAlbums";
import { useDialog } from "../dialog/DialogStore";

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

    search() {
      instance()
        .get<SearchFromAPI>(`search?q=${this.query}&type=artist%2Calbum%2Ctrack%2Cshow`)
        .then((e) => {
          this.artists = e.data.artists.items.slice(0, 7);
          this.albums = e.data.albums.items.filter((album: Album) => !isSingle(album)).slice(0, 6);
          this.tracks = e.data.tracks.items.slice(0, 6);
          this.podcasts = e.data.shows?.items.slice(0, 6) || [];
        });
    },

    updateQuery(query: string) {
      this.query = query;
      this.query.length && this.search();
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
