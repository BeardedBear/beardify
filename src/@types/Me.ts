import { ExternalUrls } from "./Artist";
import { Image } from "./Image";

export interface Me {
  country: string;
  display_name: string;
  email: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface Followers {
  href: null;
  total: number;
}
