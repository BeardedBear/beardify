import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "@/@types/Artist";
import { defaultArtist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { instance } from "@/api";
import { getDiscogsArtist, getDiscogsArtistReleases, processDiscogsReleases } from "@/helpers/discogs";
import { normalizeString } from "@/helpers/helper";
import { extractExternalIds, getIdsFromMusicBrainz, searchMusicBrainzArtistId } from "@/helpers/musicbrainz";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { cleanUrl } from "@/helpers/urls";
import { isEP, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { getWikipediaExtract } from "@/helpers/wikidata";

export const useArtist = defineStore("artist", {
  actions: {
    async clean() {
      this.activeTab = "discography";
      this.artist = defaultArtist;
      this.discogsArtist = null;
      this.discogsId = null;
      this.discogsReleases = new Map();
      this.wikidataArtist = null;
      this.wikipediaExtract = null;
      this.wikipediaLanguage = "en";
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
        const { data } = await instance().get<Paging<AlbumSimplified>>(cleanedUrl);

        const frenchMarketAlbums = data.items.filter((album) => album.available_markets.includes("FR"));

        const lives: AlbumSimplified[] = [];
        const albums: AlbumSimplified[] = [];

        frenchMarketAlbums.forEach((album) => {
          if (useCheckLiveAlbum(album.name)) {
            lives.push(album);
          } else {
            albums.push(album);
          }
        });

        this.albums = removeDuplicatesAlbums([...this.albums, ...albums]);
        this.albumsLive = removeDuplicatesAlbums([...this.albumsLive, ...lives]);

        if (data.next) await this.getAlbums(data.next);
      } catch {
        // silent fail
      }
    },

    async getArtist(artistId: string) {
      try {
        const { data } = await instance().get<Artist>(`artists/${artistId}`);
        this.artist = data;

        // Fetch external IDs and data
        await this.getIds(data.name);

        if (this.wikidataId) {
          this.getWikidataArtist(this.wikidataId);
        }
      } catch {
        // silent fail
      }
    },

    async getDiscogsArtist(discogsId: string) {
      try {
        const artist = await getDiscogsArtist(discogsId);
        this.discogsArtist = artist;

        if (artist) {
          this.getDiscogsReleases(discogsId);
        }
      } catch {
        this.discogsArtist = null;
      }
    },

    async getDiscogsReleases(discogsId: string) {
      try {
        const releasesData = await getDiscogsArtistReleases(discogsId);

        if (releasesData) {
          this.discogsReleases = processDiscogsReleases(releasesData.releases);
        }
      } catch {
        // silent fail
      }
    },

    async getFollowStatus(artistId: string) {
      try {
        const { data } = await instance().get<boolean[]>(`me/following/contains?type=artist&ids=${artistId}`);
        this.followStatus = data[0] ?? false;
      } catch {
        // silent fail
      }
    },

    async getIds(artistName: string) {
      this.musicbrainzArtist = null;
      try {
        const artist = await searchMusicBrainzArtistId(artistName);

        if (!artist?.id) return;

        const artistFull = await getIdsFromMusicBrainz(artist.id);
        if (!artistFull) return;

        this.musicbrainzArtist = { ...artist, ...artistFull };

        const { discogsId, wikidataId } = extractExternalIds(artistFull);

        if (discogsId) this.discogsId = discogsId;
        if (wikidataId) this.wikidataId = wikidataId;

        if (this.discogsId) {
          this.getDiscogsArtist(this.discogsId);
        }
      } catch {
        this.discogsId = null;
        this.wikidataId = null;
      }
    },

    async getRelatedArtists(artistId: string) {
      try {
        const { data } = await instance().get<RelatedArtists>(`artists/${artistId}/related-artists`);
        this.relatedArtists.artists = data.artists.slice(0, 15);
      } catch {
        // silent fail
      }
    },

    async getSingles(artistId: string) {
      try {
        const { data } = await instance().get<Paging<AlbumSimplified>>(
          `artists/${artistId}/albums?market=FR&include_groups=single&limit=50`,
        );

        const onlySingles: AlbumSimplified[] = [];
        const onlyEps: AlbumSimplified[] = [];
        const albumsToMove: AlbumSimplified[] = [];

        data.items.forEach((item) => {
          const normalizedName = normalizeString(item.name);
          const discogsType = this.discogsReleases.get(normalizedName);

          if (discogsType === "EP") {
            onlyEps.push(item);
          } else if (discogsType === "Album") {
            albumsToMove.push(item);
          } else if (isEP(item)) {
            onlyEps.push(item);
          } else {
            onlySingles.push(item);
          }
        });

        this.singles = removeDuplicatesAlbums(onlySingles);
        this.eps = removeDuplicatesAlbums(onlyEps);
        if (albumsToMove.length > 0) {
          this.albums = removeDuplicatesAlbums([...this.albums, ...albumsToMove]);
        }
      } catch {
        // silent fail
      }
    },

    async getTopTracks(artistId: string) {
      try {
        const { data } = await instance().get<ArtistTopTracks>(`artists/${artistId}/top-tracks?market=FR`);
        this.topTracks = data;
      } catch {
        // silent fail
      }
    },

    async getWikidataArtist(wikidataArtistId: string): Promise<void> {
      if (!wikidataArtistId) return;
      try {
        const { getWikidataArtist } = await import("@/helpers/wikidata");
        this.wikidataArtist = await getWikidataArtist(wikidataArtistId);

        const languages = this.wikidataArtist?.wikipediaLanguages || [];
        if (languages.length > 0) {
          const browserLang = navigator.language.split("-")[0];
          const selectedLang =
            languages.find((l) => l.code === browserLang) || languages.find((l) => l.code === "en") || languages[0];

          if (selectedLang) {
            this.wikipediaLanguage = selectedLang.code;
            this.wikipediaExtract = await getWikipediaExtract(selectedLang.url);
          }
        }
      } catch {
        this.wikidataArtist = null;
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

    async switchWikipediaLanguage(url: string, languageCode: string) {
      this.wikipediaLanguage = languageCode;
      this.wikipediaExtract = await getWikipediaExtract(url);
    },

    updateHeaderHeight(height: number) {
      this.headerHeight = height;
    },
  },

  state: (): ArtistPage => ({
    activeTab: "discography",
    albums: [],
    albumsLive: [],
    artist: defaultArtist,
    discogsArtist: null,
    discogsId: null,
    discogsReleases: new Map(),
    eps: [],
    followStatus: false,
    headerHeight: 0,
    musicbrainzArtist: null,
    relatedArtists: { artists: [] },
    singles: [],
    topTracks: { tracks: [] },
    wikidataArtist: null,
    wikidataId: null,
    wikipediaExtract: null,
    wikipediaLanguage: "en",
  }),
});
