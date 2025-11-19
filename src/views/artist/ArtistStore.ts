import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "@/@types/Artist";
import { defaultArtist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { instance } from "@/api";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { cleanUrl } from "@/helpers/urls";
import { isEP, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";

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

    async getAlbums(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const e = await instance().get<Paging<AlbumSimplified>>(cleanedUrl);
        const cleanFromOtherMarkets = e.data.items.filter((album: AlbumSimplified) =>
          album.available_markets.includes("FR"),
        );
        const lives = cleanFromOtherMarkets.filter((album: AlbumSimplified) => useCheckLiveAlbum(album.name));
        const albums = cleanFromOtherMarkets.filter((album: AlbumSimplified) => !useCheckLiveAlbum(album.name));

        this.albums = removeDuplicatesAlbums(this.albums.concat(albums));
        this.albumsLive = removeDuplicatesAlbums(this.albumsLive.concat(lives));
        if (e.data.next) await this.getAlbums(e.data.next);
      } catch {
        // silent fail
      }
    },
    async getArtist(artistId: string) {
      try {
        const e = await instance().get<Artist>(`artists/${artistId}`);
        this.artist = e.data;
      } catch {
        // silent fail
      }
    },

    async getFollowStatus(artistId: string) {
      try {
        const e = await instance().get<boolean[]>(`me/following/contains?type=artist&ids=${artistId}`);
        this.followStatus = e.data.pop();
      } catch {
        // silent fail
      }
    },

    async getRelatedArtists(artistId: string) {
      try {
        const e = await instance().get<RelatedArtists>(`artists/${artistId}/related-artists`);
        this.relatedArtists.artists = e.data.artists.slice(0, 15);
      } catch {
        // silent fail
      }
    },

    async getSingles(artistId: string) {
      try {
        const e = await instance().get<Paging<AlbumSimplified>>(
          `artists/${artistId}/albums?market=FR&include_groups=single&limit=50`,
        );
        const onlySingles = e.data.items.filter((item: AlbumSimplified) => !isEP(item));
        const onlyEps = e.data.items.filter((item: AlbumSimplified) => isEP(item));
        this.singles = removeDuplicatesAlbums(onlySingles);
        this.eps = removeDuplicatesAlbums(onlyEps);
      } catch {
        // silent fail
      }
    },

    async getTopTracks(artistId: string) {
      try {
        const e = await instance().get<ArtistTopTracks>(`artists/${artistId}/top-tracks?market=FR`);
        this.topTracks = e.data;
      } catch {
        // silent fail
      }
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
