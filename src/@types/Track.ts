import { AlbumSimplified } from "./Album";
import { ArtistSimplified } from "./Artist";
import { ExternalUrls } from "./Misc";

export interface Track {
  album: AlbumSimplified;
  artists: ArtistSimplified[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  href: string;
  id: string;
  is_local: boolean;
  is_playable: boolean;
  items: TrackSimplified[];
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface TrackSimplified {
  artists: ArtistSimplified[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

export interface TrackToRemove {
  uri: string;
}
