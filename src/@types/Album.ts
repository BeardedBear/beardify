import { Artist, Image, ExternalUrls } from "./Artist";
import { Track } from "./Track";

export interface AlbumPage {
  album: Album;
}

export interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  genres: string[];
  href: string;
  id: string;
  images: Image[];
  label: string;
  name: string;
  popularity: number;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  tracks: Track;
  type: string;
  uri: string;
}

export interface AlbumSimplified {
  album_type: string;
  artists: Artist[];
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}
