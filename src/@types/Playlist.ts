import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { PublicUser } from "./PublicUser";

export interface SimplifiedPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: PublicUser;
  public: boolean;
  snapshot_id: string;
  tracks: PlaylistTracksRef;
  type: string;
  uri: string;
}

export interface PlaylistTracksRef {
  href: string;
  total: number;
}
