import { ExternalUrls } from "./Misc";
import { Image } from "./Image";
import { SimplifiedPlaylist } from "./Playlist";

export type Product = "premium" | "free" | "open";
export interface User {
  country: string;
  display_name: string;
  email: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  product: Product;
  type: string;
  uri: string;
}

export interface Followers {
  href: null;
  total: number;
}

export interface UserStore {
  user: User | null;
  collections: SimplifiedPlaylist[];
  playlists: SimplifiedPlaylist[];
}
