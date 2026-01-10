import { defineStore } from "pinia";

import type { Paging } from "@/@types/Paging";
import type { Episode, Podcast, PodcastItem, PodcastSaved, PodcastsPage } from "@/@types/Podcast";

import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import { notification } from "@/helpers/notifications";
import { cleanUrl } from "@/helpers/urls";

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
        if (import.meta.env.DEV) console.error("Error following podcast:", error);
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
        if (import.meta.env.DEV) console.error("Error fetching podcast follow status:", error);
        this.isFollowing = false;
      }
    },

    async getMyPodcasts(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const e = await instance().get<Paging<PodcastSaved>>(cleanedUrl);
        const validPodcasts = e.data.items.filter((podcast): podcast is PodcastSaved => podcast !== null);
        this.myPodcasts = this.myPodcasts.concat(validPodcasts);
        if (e.data.next) await this.getMyPodcasts(e.data.next);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcasts:", error);
      }
    },

    async getPodcast(podcastId: string) {
      try {
        const { data } = await instance().get<Podcast>(`shows/${podcastId}`);
        this.podcast = data;
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast:", error);
      }
    },

    async getPodcastEpisodes(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const e = await instance().get<Paging<Episode>>(cleanedUrl);
        const validEpisodes = e.data.items.filter((episode): episode is Episode => episode !== null);
        this.episodes = this.episodes.concat(validEpisodes);
        if (e.data.next) await this.getPodcastEpisodes(e.data.next);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast episodes:", error);
      }
    },

    async getPodcasts() {
      const podcasts = [
        "5JxGy243aIXNWg6HSeV627", // La Pifotheque
        // Le Bruit
      ];
      try {
        const { data } = await instance().get<PodcastItem>(`shows?ids=${podcasts.join()}`);
        this.list = data;
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast list:", error);
      }
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
        if (import.meta.env.DEV) console.error("Error unfollowing podcast:", error);
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
