import { defineStore } from "pinia";

import { NotificationType } from "../../@types/Notification";
import { Paging } from "../../@types/Paging";
import { SimplifiedPlaylist } from "../../@types/Playlist";
import { Sidebar } from "../../@types/Sidebar";
import { instance } from "../../api";
import { notification } from "../../helpers/notifications";
import { isPlaylistOwner } from "../../helpers/playlist";
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

      // Collecter toutes les playlists existantes dans les ensembles pour vérifier les doublons
      this.playlists.forEach((p) => allPlaylistIds.add(p.id));
      this.collections.forEach((c) => allCollectionIds.add(c.id));

      try {
        // Boucler jusqu'à ce qu'il n'y ait plus de pages suivantes
        while (url) {
          const cleanedUrl = cleanUrl(url);
          const { data } = await instance().get<Paging<SimplifiedPlaylist>>(cleanedUrl);

          // Traiter chaque playlist
          data.items.forEach((item) => {
            if (isACollection(item)) {
              // Ajouter uniquement si pas déjà présent
              if (!allCollectionIds.has(item.id)) {
                allCollectionIds.add(item.id);
                tempCollections.push(item);
              }
            } else {
              // Ajouter uniquement si pas déjà présent
              if (!allPlaylistIds.has(item.id)) {
                allPlaylistIds.add(item.id);
                tempPlaylists.push(item);
              }
            }
          });

          // Passer à la page suivante ou terminer
          url = data.next || "";
        }

        // Mettre à jour les listes une fois que toutes les pages sont chargées
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

    async removePlaylist(playlistId: string) {
      const playlistStore = usePlaylist();
      instance()
        .delete(`https://api.spotify.com/v1/playlists/${playlistId}/followers`)
        .then(() => {
          this.playlists = this.playlists.filter((playlist) => playlist.id !== playlistId);
          this.collections = this.collections.filter((collection) => collection.id !== playlistId);
          playlistStore.followed = false;
          if (isPlaylistOwner(playlistStore.playlist.owner)) {
            router.push("/");
          }
        });
    },
  },

  state: (): Sidebar => ({
    collections: [],
    playlists: [],
  }),
});
