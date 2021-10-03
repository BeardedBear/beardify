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
    search(query: string) {
      instance()
        .get<SearchFromAPI>(`search?q=${query}&type=artist%2Calbum%2Ctrack`)
        .then((e) => {
          const [artists] = e.data.artists.items.slice(0, 12);
          const [albums] = e.data.albums.items.slice(0, 6);
          const [tracks] = e.data.tracks.items.slice(0, 6);

          this.artists = artists;
          this.albums = albums;
          this.tracks = tracks;
        });
    },
  },
});
