import type { MusicBrainzArtist } from "@/helpers/musicbrainz";

import { AlbumSimplified } from "./Album";
import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { Track } from "./Track";

export interface Artist {
  external_urls: {
    spotify: string;
  };
  followers: {
    href: null;
    total: number;
  };
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  name: string;
  popularity: number;
  type: string;
  uri: string;
}

export interface ArtistPage {
  activeTab: string;
  albums: AlbumSimplified[];
  albumsLive: AlbumSimplified[];
  artist: Artist;
  discogsArtist: DiscogsArtist | null;
  discogsId: null | string;
  discogsReleases: Map<string, string>;
  eps: AlbumSimplified[];
  followStatus: boolean | undefined;
  headerHeight: number;
  musicbrainzArtist: MusicBrainzArtist | null;
  relatedArtists: RelatedArtists;
  singles: AlbumSimplified[];
  topTracks: ArtistTopTracks;
  wikidataArtist: null | WikidataArtist;
  wikidataId: null | string;
  wikipediaExtract: null | string;
  wikipediaLanguage: string;
}

export interface ArtistSimplified {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

export interface ArtistTopTracks {
  tracks: Track[];
}
export interface DiscogsArtist {
  data_quality: string;
  id: number;
  images: DiscogsImage[];
  members: DiscogsMember[];
  name: string;
  profile: string;
  releases_url: string;
  resource_url: string;
  uri: string;
  urls: string[];
}

// Discogs API types
export interface DiscogsArtistReleasesResponse {
  pagination: {
    items: number;
    page: number;
    pages: number;
    per_page: number;
    urls: {
      last?: string;
      next?: string;
    };
  };
  releases: DiscogsRelease[];
}

export interface DiscogsImage {
  height: number;
  resource_url: string;
  type: "primary" | "secondary";
  uri: string;
  uri150: string;
  width: number;
}

export interface DiscogsMember {
  active: boolean;
  id: number;
  name: string;
  resource_url: string;
  thumbnail_url: string;
}

export interface DiscogsRelease {
  artist: string;
  format: string;
  id: number;
  label: string;
  main_release: number;
  resource_url: string;
  role: string;
  thumb: string;
  title: string;
  type: "master" | "release";
  year: number;
}

export interface RelatedArtists {
  artists: Artist[];
}

/**
 * Wikidata artist data with all external identifiers
 */
export interface WikidataArtist {
  description: null | string;
  id: string;
  identifiers: WikidataArtistIdentifiers;
  imageUrl: null | string;
  label: null | string;
  wikipediaLanguages: WikipediaLanguage[];
  wikipediaUrl: null | string;
}

/**
 * External identifiers available from Wikidata
 */
export interface WikidataArtistIdentifiers {
  albumOfTheYearId: null | string;
  allMusicId: null | string;
  appleMusicId: null | string;
  bandcampId: null | string;
  deezerId: null | string;
  discogsId: null | string;
  facebookId: null | string;
  geniusId: null | string;
  instagramUsername: null | string;
  musicbrainzId: null | string;
  officialWebsite: null | string;
  rateYourMusicId: null | string;
  setlistfmId: null | string;
  songkickId: null | string;
  soundcloudId: null | string;
  spotifyId: null | string;
  twitterUsername: null | string;
  youtubeChannelId: null | string;
}

/**
 * Available Wikipedia language
 */
export interface WikipediaLanguage {
  code: string;
  name: string;
  url: string;
}
