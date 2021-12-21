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
    albumsLive: [],
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
      this.albumsLive = [];
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
    getAlbums(url: string) {
      instance()
        .get<Paging<AlbumSimplified>>(url)
        .then((e) => {
          function isLive(albumName: string): boolean {
            const cleanedName = albumName.toLowerCase().trim();
            const matches = [
              "live in",
              "live on",
              "live at",
              "live from",
              "live over",
              "in live",
              "on live",
              "\\(live",
              "\\[live",
              "official live",
              "live olympia",
              "live series",
              "live session",
              "live performance",
              "live anthology",
              "live bootleg",
              "\\- live",
              "live\\!",
              "\\…live",
              "live \\'",
              "live 1",
              "live\\, 1",
              "live 2",
              "live\\, 2",
              "\\.\\.\\.live",
              "live\\;",
              "\\: live",
              "world tour",
              "in concert",
              "concert",
              "royal albert hall",
              "wacken",
              "mtv unplugged",
              "live & unplugged",
              "live and unplugged",
            ];
            return new RegExp(`(${matches.join("|")})`).test(cleanedName) || cleanedName.split(" ").pop() === "live)";
          }
          const cleanFromOtherMarkets = e.data.items.filter((album) => album.available_markets.includes("FR"));
          const lives = cleanFromOtherMarkets.filter((album) => isLive(album.name));
          const albums = cleanFromOtherMarkets.filter((album) => !isLive(album.name));

          this.albums = removeDuplicatesAlbums(this.albums.concat(albums));
          this.albumsLive = removeDuplicatesAlbums(this.albumsLive.concat(lives));
          if (e.data.next) this.getAlbums(e.data.next);
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
