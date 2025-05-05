import { defineStore } from "pinia";

import { defaultPlaylist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "../../@types/Playlist";
import { TrackToRemove } from "../../@types/Track";
import { instance } from "../../api";
import { useSidebar } from "../../components/sidebar/SidebarStore";
import { cleanUrl } from "../../helpers/urls";
import { useAuth } from "../auth/AuthStore";

export const usePlaylist = defineStore("playlist", {
  actions: {
    async clean() {
      this.playlist = defaultPlaylist;
      this.tracks = [];
    },

    followPlaylist(playlistId: string) {
      instance()
        .put(`playlists/${playlistId}/followers`)
        .then(() => {
          this.followed = true;
          useSidebar().refreshPlaylists();
        });
    },

    async getPlaylist(url: string) {
      const cleanedUrl = cleanUrl(url);
      this.playlist = (await instance().get<Playlist>(cleanedUrl)).data;
      this.followed = (
        await instance().get<boolean[]>(`playlists/${this.playlist.id}/followers/contains?ids=${useAuth().me?.id}`)
      ).data.shift();
    },

    getTracks(url: string) {
      const cleanedUrl = cleanUrl(url);
      instance()
        .get<Paging<PlaylistTrack>>(cleanedUrl)
        .then((e) => {
          this.tracks = this.tracks.concat(e.data.items.filter((item: PlaylistTrack) => item.track));
          // Only continue if there's a next page
          if (e.data.next) {
            // Make sure to clean the next URL to avoid duplication
            this.getTracks(e.data.next);
          }
        })
        .catch((error) => {
          console.error("Error fetching playlist tracks:", error);
          // If there's a URL error, it might be due to duplicate prefixes
          if (
            error.message &&
            error.message.includes("404") &&
            url.includes("https://api.spotify.com/v1/https://api.spotify.com/v1/")
          ) {
            // Try to fix the malformed URL by removing the duplicate prefix
            const fixedUrl = url.replace(
              "https://api.spotify.com/v1/https://api.spotify.com/v1/",
              "https://api.spotify.com/v1/",
            );
            this.getTracks(fixedUrl);
          }
        });
    },

    removeSong(songUri: string) {
      this.tracks = this.tracks.filter((t) => t.track.uri !== songUri);
    },

    removeTracks(tracks: TrackToRemove[]) {
      this.tracks = this.tracks.filter((e) => !tracks.map((e) => e.uri).includes(e.track.uri));
    },

    updateCollectionPosition(oldIndex: number, newIndex: number) {
      instance().put(`playlists/${this.playlist.id}/tracks`, {
        insert_before: oldIndex < newIndex ? newIndex + 1 : newIndex,
        range_start: oldIndex,
      });
    },
  },

  state: (): PlaylistPage => ({
    filter: "",
    followed: false,
    playlist: defaultPlaylist,
    tracks: [],
  }),
});
