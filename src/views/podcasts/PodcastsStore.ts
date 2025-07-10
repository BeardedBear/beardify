import { defineStore } from "pinia";

import type { Paging } from "../../@types/Paging";
import type { Episode, Podcast, PodcastItem, PodcastSaved, PodcastsPage } from "../../@types/Podcast";

import { instance } from "../../api";
import { cleanUrl } from "../../helpers/urls";

export const usePodcasts = defineStore("podcasts", {
  actions: {
    async clean() {
      this.podcast = null;
      this.list = null;
      this.myPodcasts = [];
      this.episodes = [];
    },

    getMyPodcasts(url: string) {
      const cleanedUrl = cleanUrl(url);
      instance()
        .get<Paging<PodcastSaved>>(cleanedUrl)
        .then((e) => {
          // Filter out null podcasts from the API response
          // Note: Spotify API can return null items despite the type definition
          const validPodcasts = (e.data.items as (null | PodcastSaved)[]).filter(
            (podcast): podcast is PodcastSaved => podcast !== null,
          );
          this.myPodcasts = this.myPodcasts.concat(validPodcasts);
          if (e.data.next) {
            this.getMyPodcasts(e.data.next);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching podcasts:", error);
        });
    },

    getPodcast(podcastId: string) {
      instance()
        .get<Podcast>(`shows/${podcastId}`)
        .then(({ data }) => (this.podcast = data))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching podcast:", error);
        });
    },

    getPodcastEpisodes(url: string) {
      const cleanedUrl = cleanUrl(url);
      instance()
        .get<Paging<Episode>>(cleanedUrl)
        .then((e) => {
          // Filter out null episodes from the API response
          // Note: Spotify API can return null items despite the type definition
          const validEpisodes = (e.data.items as (Episode | null)[]).filter(
            (episode): episode is Episode => episode !== null,
          );
          this.episodes = this.episodes.concat(validEpisodes);
          if (e.data.next) {
            this.getPodcastEpisodes(e.data.next);
          }
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching podcast episodes:", error);
        });
    },

    getPodcasts() {
      const podcasts = [
        "5JxGy243aIXNWg6HSeV627", // La Pifotheque
        "31ZkKfw71Dp6uGhxmB7joR", // Le Bruit
      ];

      instance()
        .get<PodcastItem>(`shows?ids=${podcasts.join()}`)
        .then(({ data }) => (this.list = data))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching podcast list:", error);
        });
    },
  },

  state: (): PodcastsPage => ({
    episodes: [],
    list: null,
    myPodcasts: [],
    podcast: null,
  }),
});
