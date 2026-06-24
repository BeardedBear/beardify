import { defineStore } from "pinia";

import { defaultPlaylist } from "@/@types/Defaults";
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "@/@types/Playlist";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { notification } from "@/helpers/notifications";
import { cleanUrl } from "@/helpers/urls";
import { useAuth } from "@/views/auth/AuthStore";

export const usePlaylist = defineStore("playlist", {
  actions: {
    async clean() {
      this.tracksVersion++;
      this.filter = "";
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
      try {
        const cleanedUrl = cleanUrl(url);
        this.playlist = (await instance().get<Playlist>(cleanedUrl)).data;
        this.followed = (
          await instance().get<boolean[]>(`playlists/${this.playlist.id}/followers/contains?ids=${useAuth().me?.id}`)
        ).data.shift();
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching playlist:", error);
        this.playlist = defaultPlaylist;
        this.followed = false;
        notification({ msg: "Unable to load this playlist.", type: NotificationType.Error });
      }
    },

    async getTracks(url: string, version?: number) {
      const v = version ?? this.tracksVersion;
      try {
        const cleanedUrl = cleanUrl(url);
        const e = await instance().get<Paging<PlaylistTrack>>(cleanedUrl);
        // If tracks were reset by a newer navigation, abandon this pagination chain
        if (this.tracksVersion !== v) return;
        this.tracks = this.tracks.concat(e.data.items.filter((item: PlaylistTrack) => item.track));
        if (e.data.next) await this.getTracks(e.data.next, v);
      } catch (error: unknown) {
        if (import.meta.env.DEV) console.error("Error fetching playlist tracks:", error);
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

    async resetTracks() {
      this.tracksVersion++;
      this.filter = "";
      this.tracks = [];
    },

    async updateCollectionPosition(oldIndex: number, newIndex: number) {
      try {
        await instance().put(`playlists/${this.playlist.id}/tracks`, {
          insert_before: oldIndex < newIndex ? newIndex + 1 : newIndex,
          range_start: oldIndex,
        });
      } catch {
        notification({
          msg: "Unable to reorder the playlist. Please try again.",
          type: NotificationType.Error,
        });
      }
    },
  },

  state: (): PlaylistPage => ({
    filter: "",
    followed: false,
    playlist: defaultPlaylist,
    tracks: [],
    tracksVersion: 0,
  }),
});
