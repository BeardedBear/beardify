import { defineStore } from "pinia";

import type { Paging } from "../../@types/Paging";
import type { Episode, Podcast, PodcastItem, PodcastSaved, PodcastsPage } from "../../@types/Podcast";

import { instance } from "../../api";

export const usePodcasts = defineStore("podcasts", {
  actions: {
    async clean() {
      this.podcast = null;
      this.list = null;
      this.myPodcasts = [];
      this.episodes = [];
    },

    getMyPodcasts(url: string) {
      instance()
        .get<Paging<PodcastSaved>>(url)
        .then((e) => {
          this.myPodcasts = this.myPodcasts.concat(e.data.items);
          if (e.data.next) this.getMyPodcasts(e.data.next);
        });
    },

    getPodcast(podcastId: string) {
      instance()
        .get<Podcast>(`/shows/${podcastId}`)
        .then(({ data }) => (this.podcast = data));
    },

    getPodcastEpisodes(url: string) {
      instance()
        .get<Paging<Episode>>(url)
        .then((e) => {
          this.episodes = this.episodes.concat(e.data.items);
          if (e.data.next) this.getPodcastEpisodes(e.data.next);
        });
    },

    getPodcasts() {
      const podcasts = [
        "5JxGy243aIXNWg6HSeV627", // La Pifotheque
        "31ZkKfw71Dp6uGhxmB7joR", // Le Bruit
      ];

      instance()
        .get<PodcastItem>(`/shows?ids=${podcasts.join()}`)
        .then(({ data }) => (this.list = data));
    },
  },

  state: (): PodcastsPage => ({
    episodes: [],
    list: null,
    myPodcasts: [],
    podcast: null,
  }),
});
