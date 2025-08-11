import { defineStore } from "pinia";

import { Dialog, DialogType, UpdatePlaylistValues } from "../../@types/Dialog";
import { Track, TrackSimplified } from "../../@types/Track";
import { instance } from "../../api";
import router from "../../router";
import { usePlaylist } from "../../views/playlist/PlaylistStore";
import { useSidebar } from "../sidebar/SidebarStore";

export const useDialog = defineStore("dialog", {
  actions: {
    close() {
      this.isClosing = true;
      setTimeout(() => {
        this.show = false;
        this.isClosing = false;
      }, 200);
    },

    open(data: {
      albumId?: string;
      playlistId?: string;
      track?: Spotify.Track | Track | TrackSimplified;
      type: DialogType;
    }) {
      this.show = true;
      this.type = data.type;
      if (data.albumId) this.albumId = data.albumId;
      if (data.track?.uri) this.track = data.track;
      if (data.playlistId) this.playlistId = data.playlistId;
    },

    async updatePlaylist(value: UpdatePlaylistValues, playlistId: string | undefined, isCollection: boolean) {
      const data = {
        collaborative: value.collaborative,
        description: value.description === "" ? "No description" : value.description,
        name: isCollection ? `#Collection ${value.name}` : value.name,
        public: value.public,
      };

      try {
        await instance().put(`playlists/${playlistId}`, data);
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
      } catch {
        // silent fail
      }
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
  },

  state: (): Dialog => ({
    isClosing: false,
    show: false,
    type: null,
  }),
});
