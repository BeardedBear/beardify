import { defineStore } from "pinia";

import { AlbumSimplified } from "../../@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "../../@types/Artist";
import { defaultArtist } from "../../@types/Defaults";
import { Paging } from "../../@types/Paging";
import { instance } from "../../api";
import { removeDuplicatesAlbums } from "../../helpers/removeDuplicate";
import { isEP, useCheckLiveAlbum } from "../../helpers/useCleanAlbums";

export const useArtist = defineStore("artist", {
  actions: {
    async clean() {
      this.artist = defaultArtist;
      this.topTracks = { tracks: [] };
      this.albums = [];
      this.albumsLive = [];
      this.eps = [];
      this.singles = [];
      this.relatedArtists = { artists: [] };
      this.followStatus = false;
    },

    getAlbums(url: string) {
      instance()
        .get<Paging<AlbumSimplified>>(url)
        .then((e) => {
          const cleanFromOtherMarkets = e.data.items.filter((album: AlbumSimplified) =>
            album.available_markets.includes("FR"),
          );
          const lives = cleanFromOtherMarkets.filter((album: AlbumSimplified) => useCheckLiveAlbum(album.name));
          const albums = cleanFromOtherMarkets.filter((album: AlbumSimplified) => !useCheckLiveAlbum(album.name));

          this.albums = removeDuplicatesAlbums(this.albums.concat(albums));
          this.albumsLive = removeDuplicatesAlbums(this.albumsLive.concat(lives));
          if (e.data.next) this.getAlbums(e.data.next);
        });
    },

    getArtist(artistId: string) {
      instance()
        .get<Artist>(`artists/${artistId}`)
        .then((e) => (this.artist = e.data));
    },

    getFollowStatus(artistId: string) {
      instance()
        .get<boolean[]>(`me/following/contains?type=artist&ids=${artistId}`)
        .then((e) => (this.followStatus = e.data.pop()));
    },

    getRelatedArtists(artistId: string) {
      instance()
        .get<RelatedArtists>(`artists/${artistId}/related-artists`)
        .then((e) => (this.relatedArtists.artists = e.data.artists.slice(0, 15)));
    },

    getSingles(artistId: string) {
      instance()
        .get<Paging<AlbumSimplified>>(`artists/${artistId}/albums?market=FR&include_groups=single&limit=50`)
        .then((e) => {
          const onlySingles = e.data.items.filter((item: AlbumSimplified) => !isEP(item));
          const onlyEps = e.data.items.filter((item: AlbumSimplified) => isEP(item));
          this.singles = removeDuplicatesAlbums(onlySingles);
          this.eps = removeDuplicatesAlbums(onlyEps);
        });
    },

    getTopTracks(artistId: string) {
      instance()
        .get<ArtistTopTracks>(`artists/${artistId}/top-tracks?market=FR`)
        .then((e) => (this.topTracks = e.data));
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

  state: (): ArtistPage => ({
    albums: [],
    albumsLive: [],
    artist: defaultArtist,
    eps: [],
    followStatus: false,
    headerHeight: 0,
    relatedArtists: { artists: [] },
    singles: [],
    topTracks: { tracks: [] },
  }),
});
