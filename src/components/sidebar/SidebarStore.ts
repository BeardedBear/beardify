import { defineStore } from "pinia";

import { NotificationType } from "../../@types/Notification";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { cleanUrl } from "../../helpers/urls";
import router from "../../router";
import { useAuth } from "../../views/auth/AuthStore";
import { usePlaylist } from "../../views/playlist/PlaylistStore";

function isACollection(playlistName: SimplifiedPlaylist): boolean {
  return playlistName.name.toLowerCase().includes("#collection");
}

export const useSidebar = defineStore("sidebar", {
  actions: {
    async addCollection(name: string) {
      const authStore = useAuth();
      instance()
        .post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, {
          name: `#Collection ${name}`,
        })
        .then(({ data }) => {
          this.collections = [data as SimplifiedPlaylist, ...this.collections];
        });
    },

    async addPlaylist(name: string) {
      const authStore = useAuth();
      instance()
        .post<SimplifiedPlaylist>(`users/${authStore.me?.id}/playlists`, { name })
        .then(({ data }) => {
          this.playlists = [data as SimplifiedPlaylist, ...this.playlists];
        });
    },

    async getPlaylists(initialUrl: string) {
      if (!initialUrl || router.currentRoute.value.name === "Login") {
        return;
      }

      let url = initialUrl;
      let allPlaylistIds = new Set<string>();
      let allCollectionIds = new Set<string>();
      let tempPlaylists: SimplifiedPlaylist[] = [];
      let tempCollections: SimplifiedPlaylist[] = [];

      // Collect all existing playlists in sets to check for duplicates
      this.playlists.forEach((p) => allPlaylistIds.add(p.id));
      this.collections.forEach((c) => allCollectionIds.add(c.id));

      try {
        // Loop until there are no more next pages
        while (url) {
          const cleanedUrl = cleanUrl(url);
          const { data } = await instance().get<Paging<SimplifiedPlaylist>>(cleanedUrl);

          // Process each playlist
          data.items.forEach((item) => {
            if (isACollection(item)) {
              // Add only if not already present
              if (!allCollectionIds.has(item.id)) {
                allCollectionIds.add(item.id);
                tempCollections.push(item);
              }
            } else {
              // Add only if not already present
              if (!allPlaylistIds.has(item.id)) {
                allPlaylistIds.add(item.id);
                tempPlaylists.push(item);
              }
            }
          });

          // Move to next page or finish
          url = data.next || "";
        }

        // Update lists once all pages are loaded
        this.playlists = [...this.playlists, ...tempPlaylists];
        this.collections = [...this.collections, ...tempCollections];
      } catch (error) {
        notification({
          msg: "Error while fetching playlists",
          type: NotificationType.Error,
        });
        // eslint-disable-next-line no-console
        console.error("Failed to fetch playlists:", error);
      }
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
      if (playlistStore.playlist.owner.id === authStore.me?.id) {
        // If owner, delete the playlist (functionality not supported by Spotify API)
        // So we use the "unfollow" approach even for our own playlists
        return new Promise<void>((resolve, reject) => {
          instance()
            .delete(`playlists/${playlistId}/followers`)
            .then(() => {
              this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
              this.collections = this.collections.filter((collection) => collection.id !== playlistId);
              playlistStore.followed = false;
              router.push("/");
              notification({
                msg: "Playlist successfully deleted",
                type: NotificationType.Success,
              });
              resolve();
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error("Error while deleting playlist:", error);
              notification({
                msg: "Unable to delete playlist",
                type: NotificationType.Error,
              });
              reject(error);
            });
        });
      } else {
        // If not owner, unfollow the playlist
        return new Promise<void>((resolve, reject) => {
          instance()
            .delete(`playlists/${playlistId}/followers`)
            .then(() => {
              this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
              this.collections = this.collections.filter((collection) => collection.id !== playlistId);
              playlistStore.followed = false;
              if (router.currentRoute.value.params.id === playlistId) {
                router.push("/");
              }
              resolve();
            })
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error("Error while unfollowing playlist:", error);
              notification({
                msg: "Unable to unfollow playlist",
                type: NotificationType.Error,
              });
              reject(error);
            });
        });
      }
    },
  },

  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),
});
