import { defineStore } from "pinia";

import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { SimplifiedPlaylist } from "@/@types/Playlist";
import { Sidebar } from "@/@types/Sidebar";
import { instance } from "@/api";
import { isACollection } from "@/helpers/isCollection";
import { notification } from "@/helpers/notifications";
import { sleep } from "@/helpers/sleep";
import { cleanUrl } from "@/helpers/urls";
import router from "@/router";
import { useAuth } from "@/views/auth/AuthStore";
import { usePlaylist } from "@/views/playlist/PlaylistStore";

export const useSidebar = defineStore("sidebar", {
  actions: {
    async addCollection(name: string) {
      try {
        const authStore = useAuth();
        const { data } = await instance().post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, {
          name: `#Collection ${name}`,
        });
        this.collections = [data satisfies SimplifiedPlaylist, ...this.collections];
      } catch {
        notification({ msg: "Unable to add collection", type: NotificationType.Error });
      }
    },

    async addPlaylist(name: string) {
      try {
        const authStore = useAuth();
        const { data } = await instance().post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, { name });
        // data already typed as SimplifiedPlaylist from generic
        this.playlists = [data, ...this.playlists];
      } catch {
        notification({ msg: "Unable to add playlist", type: NotificationType.Error });
      }
    },

    close() {
      this.isOpen = false;
    },

    async getPlaylists(initialUrl: string) {
      if (!initialUrl || router.currentRoute.value.name === "Login") {
        return;
      }

      this.loadFailed = false;
      const MAX_RETRIES = 3;

      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        if (attempt > 0) await sleep(1000 * attempt);

        let url = initialUrl;
        const allPlaylistIds = new Set<string>();
        const allCollectionIds = new Set<string>();
        const tempPlaylists: SimplifiedPlaylist[] = [];
        const tempCollections: SimplifiedPlaylist[] = [];

        this.playlists.forEach((p) => allPlaylistIds.add(p.id));
        this.collections.forEach((c) => allCollectionIds.add(c.id));

        try {
          while (url) {
            const cleanedUrl = cleanUrl(url);
            const { data } = await instance().get<Paging<SimplifiedPlaylist>>(cleanedUrl);

            data.items.forEach((item) => {
              if (isACollection(item)) {
                if (!allCollectionIds.has(item.id)) {
                  allCollectionIds.add(item.id);
                  tempCollections.push(item);
                }
              } else {
                if (!allPlaylistIds.has(item.id)) {
                  allPlaylistIds.add(item.id);
                  tempPlaylists.push(item);
                }
              }
            });

            url = data.next || "";
          }

          this.playlists = [...this.playlists, ...tempPlaylists];
          this.collections = [...this.collections, ...tempCollections];
          return;
        } catch (error) {
          if (attempt === MAX_RETRIES - 1) {
            this.loadFailed = true;
            notification({ msg: "Error while fetching playlists", type: NotificationType.Error });
            if (import.meta.env.DEV) console.error("Failed to fetch playlists:", error);
          }
        }
      }
    },

    open() {
      this.isOpen = true;
    },

    refreshPlaylists() {
      this.playlists = [];
      this.collections = [];
      this.getPlaylists("me/playlists?limit=50");
    },

    async removePlaylist(playlistId: string): Promise<void> {
      const playlistStore = usePlaylist();
      const authStore = useAuth();

      // Check if the user is the owner of the playlist
      try {
        await instance().delete(`playlists/${playlistId}/followers`);
        this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
        this.collections = this.collections.filter((collection) => collection.id !== playlistId);
        playlistStore.followed = false;
        if (
          router.currentRoute.value.params.id === playlistId
          || playlistStore.playlist.owner.id === authStore.me?.id
        ) {
          router.push("/");
        }
        notification({
          msg:
            playlistStore.playlist.owner.id === authStore.me?.id
              ? "Playlist successfully deleted"
              : "Unfollowed playlist",
          type: NotificationType.Success,
        });
      } catch (error) {
        if (import.meta.env.DEV) console.error("Error while deleting/unfollowing playlist:", error);
        notification({
          msg:
            playlistStore.playlist.owner.id === authStore.me?.id
              ? "Unable to delete playlist"
              : "Unable to unfollow playlist",
          type: NotificationType.Error,
        });
        throw error;
      }
    },

    toggle() {
      this.isOpen = !this.isOpen;
    },
  },

  state: (): Sidebar => ({
    collections: [],
    isOpen: false,
    loadFailed: false,
    playlists: [],
  }),
});
