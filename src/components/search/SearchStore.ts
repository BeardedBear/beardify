import { useDebounceFn } from "@vueuse/core";
import { defineStore } from "pinia";

import { Album } from "@/@types/Album";
import { NotificationType } from "@/@types/Notification";
import { Search, SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { useDialog } from "@/components/dialog/DialogStore";
import { notification } from "@/helpers/notifications";
import { isSingle } from "@/helpers/useCleanAlbums";

// Built outside the store so the timer survives across calls.
let debouncedSearchFn: null | ReturnType<typeof useDebounceFn> = null;

/**
 * How many of each type Spotify is asked for. Requested rather than left to the
 * default of 20: the columns show a handful, and over-fetching four categories
 * on every keystroke-pause is bandwidth spent on rows nobody will see.
 */
const API_LIMIT = 20;

/** Rendered per column. Albums get the most — this app is navigated by album. */
const SHOWN = { albums: 10, artists: 6, podcasts: 4, tracks: 6 };

export const useSearch = defineStore("search", {
  actions: {
    clear() {
      this.query = "";
      this.artists = [];
      this.albums = [];
      this.tracks = [];
      this.podcasts = [];
      this.failed = false;
      this.loading = false;
    },

    /** Closes the modal. Nothing else — `clear()` is the one that resets. */
    close() {
      useDialog().close();
    },

    async search() {
      /*
       * The query as it stands when the request leaves. Responses are not
       * cancelled, so two debounced searches can land out of order and the
       * older one would otherwise win — leaving results for a prefix of what is
       * in the field.
       */
      const issuedFor = this.query;

      try {
        const searchResults = await instance().get<SearchFromAPI>(
          /*
           * `market=from_token` scopes results to what this account can
           * actually play. Without it Spotify happily returns tracks that are
           * unavailable here, which then fail at play time with nothing said.
           */
          `search?q=${encodeURIComponent(issuedFor)}&type=artist%2Calbum%2Ctrack%2Cshow`
          + `&limit=${API_LIMIT}&market=from_token`,
        );
        if (issuedFor !== this.query) return;

        this.artists = searchResults.data.artists.items.slice(0, SHOWN.artists);
        // Spotify floods an artist search with singles; a collection is albums.
        this.albums = searchResults.data.albums.items
          .filter((album: Album) => !isSingle(album))
          .slice(0, SHOWN.albums);
        this.tracks = searchResults.data.tracks.items.slice(0, SHOWN.tracks);
        this.podcasts = searchResults.data.shows?.items.slice(0, SHOWN.podcasts) || [];
        this.failed = false;
      } catch (error: unknown) {
        if (issuedFor !== this.query) return;
        if (import.meta.env.DEV) console.error("Search failed:", error);
        this.failed = true;
        notification({ msg: "Unable to search. Check your connection and try again.", type: NotificationType.Error });
      } finally {
        if (issuedFor === this.query) this.loading = false;
      }
    },

    updateQuery(query: string) {
      this.query = query;

      // Emptying the field must empty the results too, or the last search sits
      // there under a blank input looking current.
      if (!this.query.length) {
        this.artists = [];
        this.albums = [];
        this.tracks = [];
        this.podcasts = [];
        this.failed = false;
        this.loading = false;
        return;
      }

      this.loading = true;
      if (!debouncedSearchFn) debouncedSearchFn = useDebounceFn(() => this.search(), 500);
      debouncedSearchFn();
    },
  },

  state: (): Search => ({
    albums: [],
    artists: [],
    failed: false,
    loading: false,
    podcasts: [],
    query: "",
    tracks: [],
  }),
});
