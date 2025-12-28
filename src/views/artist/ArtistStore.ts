import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import { Artist, ArtistPage, ArtistTopTracks, RelatedArtists } from "@/@types/Artist";
import { defaultArtist } from "@/@types/Defaults";
import { Paging } from "@/@types/Paging";
import { instance } from "@/api";
import { getDiscogsArtist, getDiscogsArtistReleases } from "@/helpers/discogs";
import { getIdsFromMusicBrainz, searchMusicBrainzArtistId } from "@/helpers/musicbrainz";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { cleanUrl } from "@/helpers/urls";
import { isEP, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { getWikidataArtistByName, getWikipediaExtract } from "@/helpers/wikidata";

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
        this.getIds(e.data.name);

        // Fetch Wikidata artist data
        this.getWikidataArtist(e.data.name);
      } catch {
        // silent fail
      }
    },

    async getDiscogsArtist(discogsId: string) {
      try {
        const artist = await getDiscogsArtist(discogsId);
        this.discogsArtist = artist;

        // Fetch releases after getting artist data
        if (artist) {
          this.getDiscogsReleases(discogsId);
        }
      } catch {
        this.discogsArtist = null;
      }
    },

    async getIds(artistName: string) {
      try {
        const artist = await searchMusicBrainzArtistId(artistName);

        this.musicbrainzArtist = artist;

        if (!artist?.id) {
          return;
        }

        const ids = await getIdsFromMusicBrainz(artist.id);
        this.discogsId = ids?.discogsId ?? null;
        this.wikidataId = ids?.wikidataId ?? null;

        // Fetch artist data from Discogs if ID was found
        if (this.discogsId) {
          this.getDiscogsArtist(this.discogsId);
        }
      } catch {
        this.discogsId = null;
        this.wikidataId = null;
      }
    },

    async getDiscogsReleases(discogsId: string) {
      try {
        const releasesData = await getDiscogsArtistReleases(discogsId);

        if (releasesData) {
          // Create a Map to store release type info by album title (normalized)
          const releaseMap = new Map<string, string>();

          releasesData.releases.forEach((release) => {
            // Normalize title for matching (remove special chars, lowercase, trim)
            const normalizedTitle = release.title
              .toLowerCase()
              .replace(/[^\w\s]/g, "")
              .trim();

            // Only store if it's a master release and contains format info
            if (release.type === "master" && release.format) {
              const format = release.format.toLowerCase();

              // Detect EP or Album based on format string
              if (format.includes("ep")) {
                releaseMap.set(normalizedTitle, "EP");
              } else if (
                format.includes("album") ||
                format.includes("lp") ||
                format.includes("vinyl") ||
                format.includes("cd")
              ) {
                releaseMap.set(normalizedTitle, "Album");
              }
            }
          });

          this.discogsReleases = releaseMap;
        }
      } catch (error) {
        console.error("Error fetching Discogs releases:", error);
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

        const onlySingles: AlbumSimplified[] = [];
        const onlyEps: AlbumSimplified[] = [];

        e.data.items.forEach((item: AlbumSimplified) => {
          // Normalize album name for Discogs matching
          const normalizedName = item.name
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .trim();

          // Check Discogs data first if available
          if (this.discogsReleases.size > 0) {
            const discogsType = this.discogsReleases.get(normalizedName);

            if (discogsType === "EP") {
              onlyEps.push(item);
            } else if (discogsType === "Album") {
              // Some albums might be wrongly categorized as singles in Spotify
              this.albums.push(item);
            } else {
              // Fallback to original logic if not found in Discogs
              if (isEP(item)) {
                onlyEps.push(item);
              } else {
                onlySingles.push(item);
              }
            }
          } else {
            // Fallback to original logic if Discogs data not available
            if (isEP(item)) {
              onlyEps.push(item);
            } else {
              onlySingles.push(item);
            }
          }
        });

        this.singles = removeDuplicatesAlbums(onlySingles);
        this.eps = removeDuplicatesAlbums(onlyEps);
        this.albums = removeDuplicatesAlbums(this.albums);
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

    async getWikidataArtist(artistName: string) {
      try {
        // First try to find by Spotify ID (more accurate)
        // const wikidataId = await getWikidataIdBySpotifyId(spotifyId);

        if (this.wikidataId) {
          const { getWikidataArtist } = await import("@/helpers/wikidata");
          this.wikidataArtist = await getWikidataArtist(this.wikidataId);
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
    discogsReleases: new Map(),
    eps: [],
    followStatus: false,
    headerHeight: 0,
    musicbrainzArtist: null,
    relatedArtists: { artists: [] },
    singles: [],
    topTracks: { tracks: [] },
    wikidataArtist: null,
    wikipediaExtract: null,
    wikipediaLanguage: "en",
    wikidataId: null,
  }),
});
