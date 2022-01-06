import { Paging } from "../@types/Paging";
import { PlaylistTrack } from "../@types/Playlist";
import { PublicUser } from "../@types/PublicUser";
import { instance } from "../api";
import { useAuth } from "../views/auth/AuthStore";

export function isPlaylistOwner(owner: PublicUser): boolean {
  return owner.id === useAuth().me?.id;
}

let tempTracks: PlaylistTrack[] = [];
export async function albumAllreadyExist(url: string, albumId: string): Promise<boolean | undefined> {
  return instance()
    .get<Paging<PlaylistTrack>>(url)
    .then(({ data }) => {
      tempTracks = tempTracks.concat(data.items);
      return data.next ? albumAllreadyExist(data.next, albumId) : tempTracks.some((e) => e.track.album.id === albumId);
    });
}
