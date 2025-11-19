import { defineStore } from "pinia";

import { defaultPlaylist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "@/@types/Playlist";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { cleanUrl } from "@/helpers/urls";
import { useAuth } from "@/views/auth/AuthStore";

export const usePlaylist = defineStore("playlist", {
  actions: {
    async clean() {
      this.playlist = defaultPlaylist;
      this.tracks = [];
    },

    async followPlaylist(playlistId: string) {
      try {
        await instance().put(`playlists/${playlistId}/followers`);
        this.followed = true;
        useSidebar().refreshPlaylists();
      } catch {
        // silent fail (could add notification later)
      }
    },

    async getPlaylist(url: string) {
      const cleanedUrl = cleanUrl(url);
      this.playlist = (await instance().get<Playlist>(cleanedUrl)).data;
      this.followed = (
        await instance().get<boolean[]>(`playlists/${this.playlist.id}/followers/contains?ids=${useAuth().me?.id}`)
      ).data.shift();
    },

    async getTracks(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const e = await instance().get<Paging<PlaylistTrack>>(cleanedUrl);
        this.tracks = this.tracks.concat(e.data.items.filter((item: PlaylistTrack) => item.track));
        if (e.data.next) await this.getTracks(e.data.next);
      } catch (error: unknown) {
        // eslint-disable-next-line no-console
        console.error("Error fetching playlist tracks:", error);
        if (typeof error === "object" && error && "message" in error) {
          const msg = (error as { message?: string }).message; // retain minimal structural narrowing
          if (msg && msg.includes("404") && url.includes("https://api.spotify.com/v1/https://api.spotify.com/v1/")) {
            const fixedUrl = url.replace(
              "https://api.spotify.com/v1/https://api.spotify.com/v1/",
              "https://api.spotify.com/v1/",
            );
            await this.getTracks(fixedUrl);
          }
        }
      }
    },

    removeSong(songUri: string) {
      this.tracks = this.tracks.filter((t) => t.track.uri !== songUri);
    },

    removeTracks(tracks: TrackToRemove[]) {
      // Use Set for O(1) lookup instead of array.includes() which is O(n)
      const urisToRemove = new Set(tracks.map((track) => track.uri));
      this.tracks = this.tracks.filter((track) => !urisToRemove.has(track.track.uri));
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
