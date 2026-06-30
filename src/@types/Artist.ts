import type { MusicBrainzArtist } from "@/helpers/musicbrainz";
import type { WikiTimeline } from "@/helpers/wikipediaTimeline";

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
  albumsCompilation: AlbumSimplified[];
  albumsLive: AlbumSimplified[];
  artist: Artist;
  bandMembers: BandMember[];
  discographyLoading: boolean;
  discogsArtist: DiscogsArtist | null;
  discogsId: null | string;
  eps: AlbumSimplified[];
  followStatus: boolean | undefined;
  headerHeight: number;
  musicbrainzArtist: MusicBrainzArtist | null;
  relatedArtists: RelatedArtists;
  releaseBaseTitles: Map<string, string>;
  releaseTypes: Map<string, string>;
  scrolledDown: boolean;
  singles: AlbumSimplified[];
  timelineLoading: boolean;
  topTracks: ArtistTopTracks;
  wikidataArtist: null | WikidataArtist;
  wikidataId: null | string;
  wikipediaExtract: null | string;
  wikipediaLanguage: string;
  wikiTimeline: null | WikiTimeline;
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

/**
 * A band member with active period and instruments, sourced from
 * Wikidata (primary) or MusicBrainz (fallback).
 */
export interface BandMember {
  begin: null | string;
  end: null | string;
  ended: boolean;
  id: string;
  instruments: string[];
  name: string;
}
export interface DiscogsArtist {
  data_quality: string;
  groups?: DiscogsGroup[];
  id: number;
  images: DiscogsImage[];
  members: DiscogsMember[];
  name: string;
  profile: string;
  realname?: string;
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

export interface DiscogsGroup {
  active: boolean;
  id: number;
  name: string;
  resource_url: string;
  thumbnail_url?: string;
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
  format: null | string;
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

/**
 * Condensed member info shown in the reusable member popover.
 */
export interface MemberInfo {
  discogsId: null | number;
  groups: { active: boolean; name: string }[];
  image: null | string;
  profileUrl: null | string;
  realName: null | string;
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
