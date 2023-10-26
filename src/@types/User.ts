import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { SimplifiedPlaylist } from "./Playlist";

export type Product = "free" | "open" | "premium";
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
  collections: SimplifiedPlaylist[];
  playlists: SimplifiedPlaylist[];
  user: null | User;
}
