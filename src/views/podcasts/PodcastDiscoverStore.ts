import { defineStore } from "pinia";

import { Podcast } from "@/@types/Podcast";
import { SearchFromAPI } from "@/@types/Search";
import { instance } from "@/api";
import { PODCAST_CATEGORIES } from "@/components/podcast/podcastCategories";

export interface PodcastDiscoverState {
  categoryId: string;
  error: boolean;
  loading: boolean;
  shows: Podcast[];
}

export const usePodcastDiscover = defineStore("podcastDiscover", {
  actions: {
    async getCategoryShows(categoryId: string) {
      const category = PODCAST_CATEGORIES.find((c) => c.id === categoryId);
      this.categoryId = categoryId;
      this.shows = [];
      this.error = false;
      this.loading = true;
      try {
        if (!category) throw new Error(`Unknown podcast category: ${categoryId}`);
        // market=from_token: same reason SearchStore scopes every query to it —
        // an unscoped search happily returns shows this account cannot play.
        const { data } = await instance().get<SearchFromAPI>(
          `search?q=${encodeURIComponent(category.query)}&type=show&limit=50&market=from_token`,
        );
        this.shows = data.shows?.items.filter((show) => show !== null) ?? [];
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast category:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },
  },

  state: (): PodcastDiscoverState => ({
    categoryId: "",
    error: false,
    loading: false,
    shows: [],
  }),
});
