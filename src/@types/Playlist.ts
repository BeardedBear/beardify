import { Image } from "./Image";
import { ExternalUrls } from "./Misc";
import { Paging } from "./Paging";
import { PublicUser, SimplifiedPublicUser } from "./PublicUser";
import { Track } from "./Track";
import { Followers } from "./User";

export interface SimplifiedPlaylist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: SimplifiedPublicUser;
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

export interface PlaylistTrack {
  added_at: number;
  added_by: PublicUser;
  is_local: boolean;
  track: Track;
}
export interface Playlist {
  collaborative: boolean;
  description: string;
  external_urls: ExternalUrls;
  followers: Followers;
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: PublicUser;
  public: boolean;
  snapshot_id: string;
  tracks: Paging<PlaylistTrack>;
  type: string;
  uri: string;
}

export interface PlaylistPage {
  playlist: Playlist;
  tracks: PlaylistTrack[];
  followed: boolean | undefined;
}
