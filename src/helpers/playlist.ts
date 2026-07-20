import { Paging } from "@/@types/Paging";
import { PlaylistTrack } from "@/@types/Playlist";
import { PublicUser } from "@/@types/PublicUser";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { cleanUrl } from "@/helpers/urls";
import { useAuth } from "@/views/auth/AuthStore";

/**
 * Returns true if the current authenticated user owns the given playlist.
 * @param owner - The public user object from the playlist's owner field
 */
export function isPlaylistOwner(owner: PublicUser): boolean {
  return owner.id === useAuth().me?.id;
}

/**
 * Remove one or more items from a playlist.
 * @param playlistId - The Spotify playlist ID
 * @param items - Track/episode URIs to remove
 * @param snapshotId - The playlist's current snapshot ID
 */
export async function removePlaylistItems(
  playlistId: string,
  items: TrackToRemove[],
  snapshotId: string,
): Promise<void> {
  await instance().delete(`playlists/${playlistId}/items`, {
    data: { items, snapshot_id: snapshotId },
  });
}

let tempAlbums: PlaylistTrack[] = [];
/**
 * Check whether an album is already present in a playlist by paginating through all its tracks.
 * Accumulates tracks across pages via recursion; resets the internal buffer on the first call.
 * @param url - Spotify API URL for the playlist's tracks (relative or absolute)
 * @param albumId - Spotify album ID to search for
 * @param isFirstCall - Internal flag; leave as true on initial call
 * @returns true if the album exists in the playlist, false otherwise
 */
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

  const { data } = await instance().get<Paging<PlaylistTrack>>(cleanedUrl);
  tempAlbums = tempAlbums.concat(data.items);
  return data.next
    ? albumAllreadyExist(cleanUrl(data.next), albumId, false)
    : tempAlbums.some((e) => e.item.album.id === albumId);
}

let tempTracks: PlaylistTrack[] = [];
/**
 * Check whether a track URI is already present in a playlist by paginating through all its tracks.
 * Accumulates tracks across pages via recursion; resets the internal buffer on the first call.
 * @param url - Spotify API URL for the playlist's tracks (relative or absolute)
 * @param trackId - Spotify track URI to search for
 * @param isFirstCall - Internal flag; leave as true on initial call
 * @returns true if the track exists in the playlist, false otherwise
 */
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

  const { data } = await instance().get<Paging<PlaylistTrack>>(cleanedUrl);
  tempTracks = tempTracks.concat(data.items);
  return data.next
    ? trackAllreadyExist(cleanUrl(data.next), trackId, false)
    : tempTracks.some((e) => e.item.uri === trackId);
}
