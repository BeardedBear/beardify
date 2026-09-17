import { defineStore } from "pinia";

import type { Paging } from "@/@types/Paging";
import type { Episode, Podcast, PodcastSaved, PodcastsPage } from "@/@types/Podcast";

import { NotificationType } from "@/@types/Notification";
import { instance } from "@/api";
import { isInLibrary, removeFromLibrary, saveToLibrary } from "@/helpers/library";
import { notification } from "@/helpers/notifications";
import { cleanUrl } from "@/helpers/urls";

export const usePodcasts = defineStore("podcasts", {
  actions: {
    async clean() {
      this.podcast = null;
      this.myPodcasts = [];
      this.episodes = [];
      this.isFollowing = false;
      this.error = false;
      this.loading = true;
      this.episodesLoading = true;
    },

    async getFollowStatus(podcastId: string) {
      try {
        this.isFollowing = await isInLibrary("show", podcastId);
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast follow status:", error);
        this.isFollowing = false;
      }
    },

    /*
     * Both listings page to the end in a loop rather than by recursion: the
     * recursive version had no single place to put the spinner down, so the
     * view gated it on an unrelated request instead.
     */
    async getMyPodcasts() {
      this.loading = true;
      this.error = false;
      try {
        let url = "me/shows?limit=50";
        while (url) {
          const { data } = await instance().get<Paging<PodcastSaved>>(cleanUrl(url));
          this.myPodcasts = this.myPodcasts.concat(data.items.filter((podcast) => podcast !== null));
          url = data.next;
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcasts:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    async getPodcast(podcastId: string) {
      this.loading = true;
      this.error = false;
      try {
        const { data } = await instance().get<Podcast>(`shows/${podcastId}`);
        this.podcast = data;
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast:", error);
        this.error = true;
      } finally {
        this.loading = false;
      }
    },

    /*
     * Tracked apart from `loading`: the show itself answers in one request
     * while its back catalogue pages, so a shared flag would let the "No
     * episode" state flash before the first page of episodes lands.
     */
    async getPodcastEpisodes(podcastId: string) {
      this.episodesLoading = true;
      try {
        let url = `shows/${podcastId}/episodes?limit=50`;
        while (url) {
          const { data } = await instance().get<Paging<Episode>>(cleanUrl(url));
          this.episodes = this.episodes.concat(data.items.filter((episode) => episode !== null));
          url = data.next;
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error fetching podcast episodes:", error);
        this.error = true;
      } finally {
        this.episodesLoading = false;
      }
    },

    /*
     * Same shape as ArtistStore.switchFollow: one guarded action, optimistic
     * flip, rollback on failure. Two separate follow/unfollow actions is how
     * the follow side ended up awaiting the API before showing anything, and
     * how it ended up refetching every followed show to add one row.
     */
    async switchFollow(podcastId: string) {
      if (this.followBusy) return;
      this.followBusy = true;
      const wasFollowing = this.isFollowing;
      this.isFollowing = !wasFollowing;
      try {
        if (wasFollowing) {
          await removeFromLibrary("show", podcastId);
          this.myPodcasts = this.myPodcasts.filter((podcast) => podcast.show.id !== podcastId);
        } else {
          await saveToLibrary("show", podcastId);
          if (this.podcast) this.myPodcasts = this.myPodcasts.concat({ added_at: "", show: this.podcast });
        }
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error toggling podcast follow status:", error);
        this.isFollowing = wasFollowing;
        notification({ msg: "Unable to update follow status", type: NotificationType.Error });
      } finally {
        this.followBusy = false;
      }
    },
  },

  getters: {
    listenedCount(): number {
      return this.episodes.filter((episode) => episode.resume_point?.fully_played).length;
    },
  },

  state: (): PodcastsPage => ({
    episodes: [],
    episodesLoading: true,
    error: false,
    followBusy: false,
    isFollowing: false,
    loading: true,
    myPodcasts: [],
    podcast: null,
  }),
});
