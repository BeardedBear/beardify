import { defineStore } from "pinia";

import { defaultPlaylist } from "@/@types/Defaults";
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "@/@types/Playlist";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { useSidebar } from "@/components/sidebar/SidebarStore";
import { buildCollectionDescription, parseTopTiers, stripCollectionTags } from "@/helpers/collectionOptions";
import { isInLibrary, saveToLibrary } from "@/helpers/library";
import { notification } from "@/helpers/notifications";
import { cleanUrl } from "@/helpers/urls";
import router from "@/router";

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
        await saveToLibrary("playlist", playlistId);
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
        this.followed = await isInLibrary("playlist", this.playlist.id);
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
        this.tracks = this.tracks.concat(e.data.items.filter((item: PlaylistTrack) => item.item));
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

    async migrateLegacyCollectionTag() {
      const cleanName = stripCollectionTags(this.playlist.name);
      const rawDescription = stripCollectionTags(this.playlist.description);
      const cleanDescription = rawDescription === "No description" ? "" : rawDescription;
      const topTiers = parseTopTiers(this.playlist.description);
      const newDescription = buildCollectionDescription(cleanDescription, true, topTiers);

      try {
        await instance().put(`playlists/${this.playlist.id}`, { description: newDescription, name: cleanName });
        this.playlist.name = cleanName;
        this.playlist.description = newDescription;
        useSidebar().refreshPlaylists();
        notification({ msg: "Collection converted to the new format", type: NotificationType.Success });
        router.push(`/collection/${this.playlist.id}`);
      } catch {
        notification({ msg: "Unable to convert this collection. Please try again.", type: NotificationType.Error });
      }
    },

    removeSong(songUri: string) {
      this.tracks = this.tracks.filter((t) => t.item.uri !== songUri);
    },

    removeTracks(tracks: TrackToRemove[]) {
      // Use Set for O(1) lookup instead of array.includes() which is O(n)
      const urisToRemove = new Set(tracks.map((track) => track.uri));
      this.tracks = this.tracks.filter((track) => !urisToRemove.has(track.item.uri));
    },

    async resetTracks() {
      this.tracksVersion++;
      this.filter = "";
      this.tracks = [];
    },

    async updateCollectionPosition(oldIndex: number, newIndex: number) {
      try {
        await instance().put(`playlists/${this.playlist.id}/items`, {
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
