import { defineStore } from "pinia";
import { AlbumSimplified } from "../../@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "../../@types/Artist";
import { defaultArtist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { instance } from "../../api";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";

export const useArtist = defineStore("artist", {
  state: (): ArtistPage => ({
    artist: defaultArtist,
    topTracks: { tracks: [] },
    albums: [],
    eps: [],
    singles: [],
    relatedArtists: { artists: [] },
    followStatus: false,
    headerHeight: 0,
  }),

  actions: {
    async clean() {
      this.artist = defaultArtist;
      this.topTracks = { tracks: [] };
      this.albums = [];
      this.eps = [];
      this.singles = [];
      this.relatedArtists = { artists: [] };
      this.followStatus = false;
    },

    getArtist(artistId: string) {
      instance()
        .get<Artist>(`artists/${artistId}`)
        .then((e) => (this.artist = e.data));
    },

    getTopTracks(artistId: string) {
      instance()
        .get<ArtistTopTracks>(`artists/${artistId}/top-tracks?market=FR`)
        .then((e) => (this.topTracks = e.data));
    },

    getAlbums(artistId: string) {
      instance()
        .get<Paging<AlbumSimplified>>(`artists/${artistId}/albums?market=FR&include_groups=album&limit=50`)
        .then((e) => {
          this.albums = removeDuplicatesAlbums(e.data.items);
          if (e.data.next) {
            instance()
              .get<Paging<AlbumSimplified>>(e.data.next)
              .then((e) => (this.albums = removeDuplicatesAlbums(this.albums.concat(e.data.items))));
          }
        });
    },

    getSingles(artistId: string) {
      instance()
        .get<Paging<AlbumSimplified>>(`artists/${artistId}/albums?market=FR&include_groups=single&limit=50`)
        .then((e) => {
          const minimumNumberOfTracks = 3;
          const onlySingles = e.data.items.filter((e) => e.total_tracks < minimumNumberOfTracks);
          const onlyEps = e.data.items.filter((e) => e.total_tracks >= minimumNumberOfTracks);
          this.singles = removeDuplicatesAlbums(onlySingles);
          this.eps = removeDuplicatesAlbums(onlyEps);
        });
    },

    getRelatedArtists(artistId: string) {
      instance()
        .get<RelatedArtists>(`artists/${artistId}/related-artists`)
        .then((e) => (this.relatedArtists.artists = e.data.artists.slice(0, 15)));
    },

    getFollowStatus(artistId: string) {
      instance()
        .get<boolean[]>(`me/following/contains?type=artist&ids=${artistId}`)
        .then((e) => (this.followStatus = e.data.pop()));
    },

    switchFollow(artistId: string) {
      if (this.followStatus) {
        instance().delete(`me/following?type=artist&ids=${artistId}`);
        this.followStatus = false;
      } else {
        instance().put(`me/following?type=artist&ids=${artistId}`);
        this.followStatus = true;
      }
    },

    updateHeaderHeight(height: number) {
      this.headerHeight = height - 5;
    },
  },
});
