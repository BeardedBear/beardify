import { ExternalUrls } from "./Misc";
import { Image } from "./Image";

export type Product = "premium" | "free" | "open";
export interface Me {
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
