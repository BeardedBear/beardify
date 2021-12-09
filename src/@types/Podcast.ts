import { Copyrights } from "./Album";
import { ContextType } from "./CurrentlyPlaying";
import { Image } from "./Image";
import { ExternalUrls } from "./Misc";

export interface PodcastsPage {
  podcast: Podcast | null;
  list: Podcast[];
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
