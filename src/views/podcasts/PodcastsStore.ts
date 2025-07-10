import { defineStore } from "pinia";

import type { Paging } from "../../@types/Paging";
import type { Episode, Podcast, PodcastItem, PodcastSaved, PodcastsPage } from "../../@types/Podcast";

import { NotificationType } from "../../@types/Notification";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { cleanUrl } from "../../helpers/urls";

export const usePodcasts = defineStore("podcasts", {
  actions: {
    async clean() {
      this.podcast = null;
      this.list = null;
      this.myPodcasts = [];
      this.episodes = [];
      this.isFollowing = false;
    },

    async followPodcast(podcastId: string) {
      try {
        await instance().put(`me/shows?ids=${podcastId}`);
        this.isFollowing = true;
        // Refresh my podcasts list to include the newly followed podcast
        this.myPodcasts = [];
        this.getMyPodcasts("me/shows?limit=50");
        notification({
          msg: "Podcast added to your follows",
          type: NotificationType.Success,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error following podcast:", error);
        notification({
          msg: "Error adding podcast",
          type: NotificationType.Error,
        });
      }
    },

    async getFollowStatus(podcastId: string) {
      try {
        const response = await instance().get<boolean[]>(`me/shows/contains?ids=${podcastId}`);
        this.isFollowing = response.data[0] || false;
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error fetching podcast follow status:", error);
        this.isFollowing = false;
      }
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
        // Le Bruit
      ];

      instance()
        .get<PodcastItem>(`shows?ids=${podcasts.join()}`)
        .then(({ data }) => (this.list = data))
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error("Error fetching podcast list:", error);
        });
    },

    async unfollowPodcast(podcastId: string) {
      try {
        await instance().delete(`me/shows?ids=${podcastId}`);
        this.isFollowing = false;
        // Remove from my podcasts list
        this.myPodcasts = this.myPodcasts.filter((podcast) => podcast.show.id !== podcastId);
        notification({
          msg: "Podcast removed from your follows",
          type: NotificationType.Success,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error unfollowing podcast:", error);
        notification({
          msg: "Error removing podcast",
          type: NotificationType.Error,
        });
      }
    },
  },

  state: (): PodcastsPage => ({
    episodes: [],
    isFollowing: false,
    list: null,
    myPodcasts: [],
    podcast: null,
  }),
});
