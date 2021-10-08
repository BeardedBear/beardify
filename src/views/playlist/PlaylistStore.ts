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

    async clean() {
      this.playlist = defaultPlaylist;
      this.tracks = [];
    },

    getTracks(url: string) {
      instance()
        .get<Paging<PlaylistTrack>>(url)
        .then((e) => {
          this.tracks = e.data.items.filter((e) => e.track);
          if (e.data.next !== "") {
            instance()
              .get<Paging<PlaylistTrack>>(e.data.next)
              .then((f) => {
                this.tracks = this.tracks.concat(f.data.items.filter((g) => g.track));
              });
          }
        });
    },

    removeTracks(tracks: TrackToRemove[]) {
      this.tracks = this.tracks.filter((e) => !tracks.map((e) => e.uri).includes(e.track.uri));
    },
  },
});
