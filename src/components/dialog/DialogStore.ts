import { defineStore } from "pinia";
import { Dialog, DialogType, UpdatePlaylistValues } from "../../@types/Dialog";
import { instance } from "../../api";
import router from "../../router";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import { useSidebar } from "../sidebar/SidebarStore";

export const useDialog = defineStore("dialog", {
  state: (): Dialog => ({
    show: false,
    type: null,
    isClosing: false,
  }),

  actions: {
    open(data: { type: DialogType; albumId?: string; playlistId?: string; songUri?: string }) {
      this.show = true;
      this.type = data.type;
      if (data.albumId) this.albumId = data.albumId;
      if (data.songUri) this.songUri = data.songUri;
      if (data.playlistId) this.playlistId = data.playlistId;
    },

    updatePlaylistCurrentPage(value: UpdatePlaylistValues, playlistId: string | undefined) {
      const playlistStore = usePlaylist();
      if (router.currentRoute.value.params.id === playlistId) {
        playlistStore.playlist.description = value.description;
        playlistStore.playlist.name = value.name;
        playlistStore.playlist.public = value.public;
        playlistStore.playlist.collaborative = value.collaborative;
      }
    },

    async updatePlaylist(value: UpdatePlaylistValues, playlistId: string | undefined, isCollection: boolean) {
      const data = {
        name: isCollection ? `#Collection ${value.name}` : value.name,
        public: value.public,
        collaborative: value.collaborative,
        description: value.description === "" ? "No description" : value.description,
      };

      instance()
        .put(`playlists/${playlistId}`, data)
        .then(() => {
          const sidebarStore = useSidebar();
          const updatedPlaylist = isCollection
            ? sidebarStore.collections.find((collection) => collection.id === playlistId)
            : sidebarStore.playlists.find((playlist) => playlist.id === playlistId);

          this.updatePlaylistCurrentPage(data, playlistId);

          if (updatedPlaylist) {
            updatedPlaylist.description = data.description;
            updatedPlaylist.name = data.name;
            updatedPlaylist.public = data.public;
            updatedPlaylist.collaborative = data.collaborative;
          }

          this.close();
        });
    },

    close() {
      this.isClosing = true;
      setTimeout(() => {
        this.show = false;
        this.isClosing = false;
      }, 200);
    },
  },
});
