import { Paging } from "../@types/Paging";
import { PlaylistTrack } from "../@types/Playlist";
import { PublicUser } from "../@types/PublicUser";
import { instance } from "../api";
import { cleanUrl } from "../helpers/urls";
import { useAuth } from "../views/auth/AuthStore";

export function isPlaylistOwner(owner: PublicUser): boolean {
  return owner.id === useAuth().me?.id;
}

let tempAlbums: PlaylistTrack[] = [];
export async function albumAllreadyExist(
  url: string,
  albumId: string,
  isFirstCall = true,
): Promise<boolean | undefined> {
  // Reset the tempAlbums array at the first call
  if (isFirstCall) {
    tempAlbums = [];
  }

  // Clean the URL first to avoid duplicate prefixes
  const cleanedUrl = cleanUrl(url);

  return instance()
    .get<Paging<PlaylistTrack>>(cleanedUrl)
    .then(({ data }) => {
      tempAlbums = tempAlbums.concat(data.items);
      // Also clean the next URL if it exists and pass false to indicate non-first call
      return data.next
        ? albumAllreadyExist(cleanUrl(data.next), albumId, false)
        : tempAlbums.some((e) => e.track.album.id === albumId);
    });
}

let tempTracks: PlaylistTrack[] = [];
export async function trackAllreadyExist(
  url: string,
  trackId: string,
  isFirstCall = true,
): Promise<boolean | undefined> {
  // Reset the tempTracks array at the first call
  if (isFirstCall) {
    tempTracks = [];
  }

  // Clean the URL first to avoid duplicate prefixes
  const cleanedUrl = cleanUrl(url);

  return instance()
    .get<Paging<PlaylistTrack>>(cleanedUrl)
    .then(({ data }) => {
      tempTracks = tempTracks.concat(data.items);
      // Also clean the next URL if it exists
      return data.next
        ? trackAllreadyExist(cleanUrl(data.next), trackId, false)
        : tempTracks.some((e) => e.track.uri === trackId);
    });
}
