import { AlbumSimplified } from "./Album";
import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { Track } from "./Track";

export interface ArtistPage {
  artist: Artist;
  topTracks: ArtistTopTracks;
  albums: AlbumSimplified[];
  albumsLive: AlbumSimplified[];
  eps: AlbumSimplified[];
  singles: AlbumSimplified[];
  relatedArtists: RelatedArtists;
  followStatus: boolean | undefined;
  headerHeight: number;
}

export interface ArtistTopTracks {
  tracks: Track[];
}

export interface RelatedArtists {
  artists: Artist[];
}

export interface ArtistSimplified {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}
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
