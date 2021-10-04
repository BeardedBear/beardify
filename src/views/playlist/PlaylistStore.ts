import { defineStore } from "pinia";
import { defaultPlaylist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { Playlist, PlaylistPage, PlaylistTrack } from "../../@types/Playlist";
import { TrackToRemove } from "../../@types/Track";
import { instance } from "../../api";

export const usePlaylist = defineStore("playlist", {
  state: (): PlaylistPage => ({
    playlist: defaultPlaylist,
    tracks: [],
  }),

  actions: {
    getPlaylist(url: string) {
      instance()
        .get<Playlist>(url)
        .then((e) => (this.playlist = e.data));
    },

    getTracks(url: string) {
      this.tracks = [];
      if (url) {
        instance()
          .get<Paging<PlaylistTrack>>(url)
          .then((e) => {
            this.tracks = this.tracks.concat(e.data.items.filter((e) => e.track));
            if (e.data.next !== "") this.getTracks, e.data.next;
          });
      }
    },

    removeTracks(tracks: TrackToRemove[]) {
      this.tracks = this.tracks.filter((e) => !tracks.map((e) => e.uri).includes(e.track.uri));
    },
  },
});
