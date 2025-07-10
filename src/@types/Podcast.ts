import { Copyrights } from "./Album";
import { ContextType } from "./CurrentlyPlaying";
import { Image } from "./Image";
import { ExternalUrls } from "./Misc";

export interface Episode {
  audio_preview_url: string;
  description: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  html_description: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  is_playable: boolean;
  language: string;
  languages: string[];
  name: string;
  release_date: string;
  release_date_precision: string;
  resume_point: {
    fully_played: boolean;
    resume_position_ms: number;
  } | null;
  type: string;
  uri: string;
}

export interface Podcast {
  available_markets: string[];
  copyrights: Copyrights;
  description: string;
  explicit: boolean;
  external_urls: ExternalUrls;
  href: string;
  html_description: string;
  id: string;
  images: Image[];
  is_externally_hosted: boolean;
  languages: string[];
  media_type: string;
  name: string;
  publisher: string;
  total_episodes: number;
  type: ContextType;
  uri: string;
}
export interface PodcastItem {
  shows: Podcast[];
}
export interface PodcastSaved {
  added_at: string;
  show: Podcast;
}

export interface PodcastsPage {
  episodes: Episode[];
  list: null | PodcastItem;
  myPodcasts: PodcastSaved[];
  podcast: null | Podcast;
}
