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
  albums: AlbumSimplified[];
  albumsLive: AlbumSimplified[];
  artist: Artist;
  discogsArtist: DiscogsArtist | null;
  discogsId: null | string;
  eps: AlbumSimplified[];
  followStatus: boolean | undefined;
  headerHeight: number;
  relatedArtists: RelatedArtists;
  singles: AlbumSimplified[];
  topTracks: ArtistTopTracks;
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

export interface RelatedArtists {
  artists: Artist[];
}
