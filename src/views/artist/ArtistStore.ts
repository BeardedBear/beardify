import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "@/@types/Artist";
import { defaultArtist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { instance } from "@/api";
import { getDiscogsArtist } from "@/helpers/discogs";
import { getDiscogsIdByArtistName } from "@/helpers/musicbrainz";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { cleanUrl } from "@/helpers/urls";
import { isEP, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { getWikidataArtistByName, getWikidataIdBySpotifyId, getWikipediaExtract } from "@/helpers/wikidata";

export const useArtist = defineStore("artist", {
  actions: {
    async clean() {
      this.activeTab = "discography";
      this.artist = defaultArtist;
      this.discogsArtist = null;
      this.discogsId = null;
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

        // Fetch Discogs ID from MusicBrainz
        this.getDiscogsId(e.data.name);

        // Fetch Wikidata artist data
        this.getWikidataArtist(artistId, e.data.name);
      } catch {
        // silent fail
      }
    },

    async getDiscogsArtist(discogsId: string) {
      try {
        const artist = await getDiscogsArtist(discogsId);
        this.discogsArtist = artist;
      } catch {
        this.discogsArtist = null;
      }
    },

    async getDiscogsId(artistName: string) {
      try {
        const discogsId = await getDiscogsIdByArtistName(artistName);
        this.discogsId = discogsId;

        // Fetch artist data from Discogs if ID was found
        if (discogsId) {
          this.getDiscogsArtist(discogsId);
        }
      } catch {
        this.discogsId = null;
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

    async getWikidataArtist(spotifyId: string, artistName: string) {
      try {
        // First try to find by Spotify ID (more accurate)
        const wikidataId = await getWikidataIdBySpotifyId(spotifyId);

        if (wikidataId) {
          const { getWikidataArtist } = await import("@/helpers/wikidata");
          this.wikidataArtist = await getWikidataArtist(wikidataId);
        } else {
          // Fallback to name search
          this.wikidataArtist = await getWikidataArtistByName(artistName);
        }

        // Fetch Wikipedia extract if we have available languages
        const languages = this.wikidataArtist?.wikipediaLanguages || [];
        if (languages.length > 0) {
          // Get browser/system language (e.g., "fr-FR" -> "fr")
          const browserLang = navigator.language.split("-")[0];

          // Priority: browser language > English > first available
          const selectedLang =
            languages.find((l) => l.code === browserLang) || languages.find((l) => l.code === "en") || languages[0];

          if (selectedLang) {
            this.wikipediaLanguage = selectedLang.code;
            this.wikipediaExtract = await getWikipediaExtract(selectedLang.url);
          }
        }
        // If no Wikipedia, Discogs fallback is handled in ArtistInfo.vue
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
    eps: [],
    followStatus: false,
    headerHeight: 0,
    relatedArtists: { artists: [] },
    singles: [],
    topTracks: { tracks: [] },
    wikidataArtist: null,
    wikipediaExtract: null,
    wikipediaLanguage: "en",
  }),
});
