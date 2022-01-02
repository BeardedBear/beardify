import { Image } from "./Image";
import { Followers } from "./User";
import { ExternalUrls } from "./Misc";

export interface PublicUser {
  display_name: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  type: string;
  uri: string;
}
export interface SimplifiedPublicUser {
  display_name: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
}
