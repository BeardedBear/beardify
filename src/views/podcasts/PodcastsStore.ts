import { defineStore } from "pinia";
import { Podcast, PodcastsPage } from "../../@types/Podcast";
import { instance } from "../../api";

export const usePodcasts = defineStore("podcasts", {
  state: (): PodcastsPage => ({
    podcast: null,
    list: [],
  }),

  actions: {
    async clean() {
      this.podcast = null;
      this.list = [];
    },

    getPodcasts() {
      const podcasts = [
        "5JxGy243aIXNWg6HSeV627", // La Pifotheque
        "31ZkKfw71Dp6uGhxmB7joR", // Le Bruit
      ];

      instance()
        .get<{ shows: Podcast[] }>(`/shows?ids=${podcasts.join()}`)
        .then(({ data }) => {
          this.list = data.shows;
        });
    },

    getPodcast(podcastId: string) {
      instance()
        .get<Podcast>(`/shows/${podcastId}`)
        .then(({ data }) => {
          this.podcast = data;
          console.log(data);

          // this.list = data.shows;
        });
    },
  },
});
