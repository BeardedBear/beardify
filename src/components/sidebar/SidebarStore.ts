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
      try {
        await instance().delete(`playlists/${playlistId}/followers`);
        this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
        this.collections = this.collections.filter((collection) => collection.id !== playlistId);
        playlistStore.followed = false;
        if (
          router.currentRoute.value.params.id === playlistId ||
          playlistStore.playlist.owner.id === authStore.me?.id
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
        // eslint-disable-next-line no-console
        console.error("Error while deleting/unfollowing playlist:", error);
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
  },

  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),
});
