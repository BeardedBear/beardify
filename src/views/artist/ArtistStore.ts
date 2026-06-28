import { defineStore } from "pinia";

import { AlbumSimplified } from "@/@types/Album";
import {
  Artist,
  ArtistPage,
  ArtistTopTracks,
  RelatedArtists,
} from "@/@types/Artist";
import { defaultArtist } from "@/@types/Defaults";
import { NotificationType } from "@/@types/Notification";
import { Paging } from "@/@types/Paging";
import { instance } from "@/api";
import {
  getDiscogsArtist,
  getDiscogsArtistReleases,
  processDiscogsReleases,
} from "@/helpers/discogs";
import { normalizeString } from "@/helpers/helper";
import {
  buildReleaseTypeMap,
  extractBandMembers,
  extractExternalIds,
  getIdsFromMusicBrainz,
  getMusicBrainzReleaseGroups,
  searchMusicBrainzArtistId,
  searchMusicBrainzBySpotifyId,
} from "@/helpers/musicbrainz";
import { notification } from "@/helpers/notifications";
import { removeDuplicatesAlbums } from "@/helpers/removeDuplicate";
import { cleanUrl } from "@/helpers/urls";
import { isEP, useCheckLiveAlbum } from "@/helpers/useCleanAlbums";
import { getWikipediaExtract } from "@/helpers/wikidata";

export const useArtist = defineStore("artist", {
  actions: {
    async clean() {
      this.activeTab = "discography";
      this.artist = defaultArtist;
      this.bandMembers = [];
      this.discogsArtist = null;
      this.discogsId = null;
      this.releaseTypes = new Map();
      this.scrolledDown = false;
      this.timelineLoading = true;
      this.wikidataArtist = null;
      this.wikipediaExtract = null;
      this.wikipediaLanguage = "en";
      this.wikiTimeline = null;
      this.topTracks = { tracks: [] };
      this.albums = [];
      this.albumsLive = [];
      this.albumsCompilation = [];
      this.eps = [];
      this.singles = [];
      this.relatedArtists = { artists: [] };
      this.followStatus = false;
    },

    async getAlbums(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const { data }
          = await instance().get<Paging<AlbumSimplified>>(cleanedUrl);

        const frenchMarketAlbums = data.items.filter((album) =>
          album.available_markets.includes("FR"),
        );

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
        this.albumsLive = removeDuplicatesAlbums([
          ...this.albumsLive,
          ...lives,
        ]);

        if (data.next) await this.getAlbums(data.next);

        // Spotify mis-files EPs and live records under the "album" group.
        // Reclassify with external data (no-op until release types arrive).
        this.reclassifyReleases();
      } catch {
        // silent fail
      }
    },

    async getArtist(artistId: string) {
      try {
        const { data } = await instance().get<Artist>(`artists/${artistId}`);
        this.artist = data;

        // Fetch external IDs and data (Spotify ID used for exact MusicBrainz match)
        await this.getIds(data.name, data.id);

        if (this.wikidataId) {
          this.getWikidataArtist(this.wikidataId);
        }
      } catch {
        this.artist = defaultArtist;
        notification({ msg: "Unable to load this artist.", type: NotificationType.Error });
      }
    },

    async getCompilations(url: string) {
      try {
        const cleanedUrl = cleanUrl(url);
        const { data }
          = await instance().get<Paging<AlbumSimplified>>(cleanedUrl);

        const frenchMarketAlbums = data.items.filter((album) =>
          album.available_markets.includes("FR"),
        );

        this.albumsCompilation = removeDuplicatesAlbums([
          ...this.albumsCompilation,
          ...frenchMarketAlbums,
        ]);

        if (data.next) await this.getCompilations(data.next);

        this.reclassifyReleases();
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
          // MusicBrainz is the primary source and must win, so Discogs only fills
          // in keys MusicBrainz didn't provide (existing entries take precedence).
          this.releaseTypes = new Map([
            ...processDiscogsReleases(releasesData.releases),
            ...this.releaseTypes,
          ]);
          // Data may land after albums/EPs were classified — re-run.
          this.reclassifyReleases();
        }
      } catch {
        // silent fail
      }
    },

    async getFollowStatus(artistId: string) {
      try {
        const { data } = await instance().get<boolean[]>(
          `me/following/contains?type=artist&ids=${artistId}`,
        );
        this.followStatus = data[0] ?? false;
      } catch {
        // silent fail
      }
    },

    async getIds(artistName: string, spotifyId?: string) {
      this.musicbrainzArtist = null;
      this.bandMembers = [];
      this.discogsId = null;
      this.wikidataId = null;
      this.wikidataArtist = null;
      this.wikipediaExtract = null;
      try {
        // Search by name first; if multiple homonyms found and Spotify ID available,
        // use Spotify URL lookup for exact match
        const nameResults = await searchMusicBrainzArtistId(artistName);
        const artist
          = nameResults.length === 1
            ? nameResults[0]
            : nameResults.length > 1 && spotifyId
              ? ((await searchMusicBrainzBySpotifyId(spotifyId)) ?? nameResults[0])
              : nameResults[0] ?? null;

        if (!artist?.id) return;

        const artistFull = await getIdsFromMusicBrainz(artist.id);
        if (!artistFull) return;

        this.musicbrainzArtist = { ...artist, ...artistFull };
        this.bandMembers = extractBandMembers(artistFull);

        // Primary source for Live/Compilation/EP classification.
        this.getReleaseGroups(artist.id);

        const { discogsId, wikidataId } = extractExternalIds(artistFull);

        // Update discogs fields: set or clear and fetch when present
        if (discogsId) {
          this.discogsId = discogsId;
          this.getDiscogsArtist(discogsId);
        } else {
          this.discogsId = null;
          this.discogsArtist = null;
        }

        // Update wikidata fields: set or clear; clear related data when absent
        if (wikidataId) {
          this.wikidataId = wikidataId;
        } else {
          this.wikidataId = null;
          this.wikidataArtist = null;
          this.wikipediaExtract = null;
          this.timelineLoading = false;
        }
      } catch {
        this.discogsId = null;
        this.wikidataId = null;
        this.timelineLoading = false;
      }
    },

    async getRelatedArtists(artistId: string) {
      try {
        const { data } = await instance().get<RelatedArtists>(
          `artists/${artistId}/related-artists`,
        );
        this.relatedArtists.artists = data.artists.slice(0, 15);
      } catch {
        // silent fail
      }
    },

    async getReleaseGroups(musicbrainzId: string) {
      try {
        const groups = await getMusicBrainzReleaseGroups(musicbrainzId);
        if (!groups.length) return;

        // MusicBrainz wins over any Discogs data already present.
        this.releaseTypes = new Map([
          ...this.releaseTypes,
          ...buildReleaseTypeMap(groups),
        ]);
        this.reclassifyReleases();
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
          const externalType = this.releaseTypes.get(normalizedName);

          if (externalType === "EP") {
            onlyEps.push(item);
          } else if (externalType === "Album") {
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
          this.albums = removeDuplicatesAlbums([
            ...this.albums,
            ...albumsToMove,
          ]);
        }

        this.reclassifyReleases();
      } catch {
        // silent fail
      }
    },

    async getTopTracks(artistId: string) {
      try {
        const { data } = await instance().get<ArtistTopTracks>(
          `artists/${artistId}/top-tracks?market=FR`,
        );
        this.topTracks = data;
      } catch {
        // silent fail
      }
    },

    async getWikidataArtist(wikidataArtistId: string): Promise<void> {
      if (!wikidataArtistId) return;
      try {
        const { getWikidataArtist, getWikidataBandMembers } = await import("@/helpers/wikidata");
        const { mergeBandMembers } = await import("@/helpers/bandMembers");

        // Artist info and member list are independent — fetch in parallel
        const [wikidataArtist, wikidataMembers] = await Promise.all([
          getWikidataArtist(wikidataArtistId),
          getWikidataBandMembers(wikidataArtistId),
        ]);
        this.wikidataArtist = wikidataArtist;
        this.bandMembers = mergeBandMembers(wikidataMembers, this.bandMembers);

        const wikipediaUrl = this.wikidataArtist?.wikipediaUrl;
        const languages = this.wikidataArtist?.wikipediaLanguages ?? [];
        const browserLang = navigator.language.split("-")[0];
        const selectedLang
          = languages.find((l) => l.code === browserLang)
            || languages.find((l) => l.code === "en")
            || languages[0];

        // Timeline and extract both depend on wikidataArtist but are independent of each other
        const timelinePromise = wikipediaUrl
          ? import("@/helpers/wikipediaTimeline").then(({ getWikipediaTimeline }) =>
              getWikipediaTimeline(wikipediaUrl),
            )
          : Promise.resolve(null);
        const extractPromise = selectedLang ? getWikipediaExtract(selectedLang.url) : Promise.resolve(null);

        const [newTimeline, extract] = await Promise.all([timelinePromise, extractPromise]);
        this.wikiTimeline = newTimeline;
        if (selectedLang) {
          this.wikipediaLanguage = selectedLang.code;
          this.wikipediaExtract = extract;
        }
      } catch {
        this.wikidataArtist = null;
      } finally {
        this.timelineLoading = false;
      }
    },

    /**
     * Reconcile Spotify's grouping with external data (MusicBrainz release-groups
     * first, Discogs as fallback — see {@link releaseTypes}).
     *
     * Spotify is unreliable: it routinely files real EPs and live records under
     * the plain "album" group (where heuristics can't catch them since
     * `album_type` is "album") and, more rarely, the reverse. When the external
     * sources have an explicit type for a release we trust it and move the
     * release to the right bucket: EP, Live, Compilation or Album.
     *
     * Lives already detected by the name heuristic (`useCheckLiveAlbum`) are
     * never demoted back to albums — external data only adds coverage, it does
     * not override a positive name match.
     *
     * Idempotent and a no-op until `releaseTypes` is populated, so it is safe to
     * call from every loader regardless of which finishes first (the data is
     * fetched concurrently and order is not guaranteed).
     */
    reclassifyReleases(): void {
      if (this.releaseTypes.size === 0) return;

      const externalType = (album: AlbumSimplified): string | undefined =>
        this.releaseTypes.get(normalizeString(album.name));

      const keptAlbums: AlbumSimplified[] = [];
      const promotedToEps: AlbumSimplified[] = [];
      const promotedToLive: AlbumSimplified[] = [];
      const promotedToCompilation: AlbumSimplified[] = [];
      this.albums.forEach((album) => {
        switch (externalType(album)) {
          case "Compilation":
            promotedToCompilation.push(album);
            break;
          case "EP":
            promotedToEps.push(album);
            break;
          case "Live":
            promotedToLive.push(album);
            break;
          default:
            keptAlbums.push(album);
        }
      });

      const keptEps: AlbumSimplified[] = [];
      const promotedToAlbums: AlbumSimplified[] = [];
      this.eps.forEach((ep) => {
        if (externalType(ep) === "Album") promotedToAlbums.push(ep);
        else keptEps.push(ep);
      });

      this.albums = removeDuplicatesAlbums([...keptAlbums, ...promotedToAlbums]);
      this.eps = removeDuplicatesAlbums([...keptEps, ...promotedToEps]);
      this.albumsLive = removeDuplicatesAlbums([...this.albumsLive, ...promotedToLive]);
      this.albumsCompilation = removeDuplicatesAlbums([
        ...this.albumsCompilation,
        ...promotedToCompilation,
      ]);
    },

    async switchFollow(artistId: string) {
      // Optimistic update, reverted if the API call fails
      const previousStatus = this.followStatus;
      this.followStatus = !previousStatus;
      try {
        if (previousStatus) {
          await instance().delete(`me/following?type=artist&ids=${artistId}`);
        } else {
          await instance().put(`me/following?type=artist&ids=${artistId}`);
        }
      } catch {
        this.followStatus = previousStatus;
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
    albumsCompilation: [],
    albumsLive: [],
    artist: defaultArtist,
    bandMembers: [],
    discogsArtist: null,
    discogsId: null,
    eps: [],
    followStatus: false,
    headerHeight: 0,
    musicbrainzArtist: null,
    relatedArtists: { artists: [] },
    releaseTypes: new Map(),
    scrolledDown: false,
    singles: [],
    timelineLoading: false,
    topTracks: { tracks: [] },
    wikidataArtist: null,
    wikidataId: null,
    wikipediaExtract: null,
    wikipediaLanguage: "en",
    wikiTimeline: null,
  }),
});
