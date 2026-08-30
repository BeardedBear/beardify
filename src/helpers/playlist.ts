import { Paging } from "@/@types/Paging";
import { PlaylistTrack } from "@/@types/Playlist";
import { PublicUser } from "@/@types/PublicUser";
import { TrackToRemove } from "@/@types/Track";
import { instance } from "@/api";
import { cleanUrl } from "@/helpers/urls";
import { useAuth } from "@/views/auth/AuthStore";

/**
 * Insert items into a playlist, optionally at a given index.
 *
 * Exists for undo: restoring a deleted album has to put it back where it was,
 * not at the end of the collection. Spotify appends when `position` is omitted,
 * which is the right default for an ordinary add.
 * @param playlistId - The Spotify playlist ID
 * @param uris - Track/episode URIs to insert, in order
 * @param position - Zero-based index to insert at; appends when omitted
 */
export async function addPlaylistItems(playlistId: string, uris: string[], position?: number): Promise<void> {
  await instance().post(`playlists/${playlistId}/items`, position === undefined ? { uris } : { position, uris });
}

/**
 * Check whether an album is already present in a playlist.
 * @param url - Spotify API URL for the playlist's tracks (relative or absolute)
 * @param albumId - Spotify album ID to search for
 */
export async function albumAllreadyExist(url: string, albumId: string): Promise<boolean> {
  return playlistHas(url, (e) => e.item.album.id === albumId);
}

/**
 * Returns true if the current authenticated user owns the given playlist.
 * Takes just the id: a simplified playlist's owner carries fewer fields than a
 * full `PublicUser`, and only the id is ever compared.
 * @param owner - The playlist's owner field
 */
export function isPlaylistOwner(owner: Pick<PublicUser, "id">): boolean {
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

/**
 * Check whether a track URI is already present in a playlist.
 * @param url - Spotify API URL for the playlist's tracks (relative or absolute)
 * @param trackId - Spotify track URI to search for
 */
export async function trackAllreadyExist(url: string, trackId: string): Promise<boolean> {
  return playlistHas(url, (e) => e.item.uri === trackId);
}

/**
 * Walks a playlist page by page and stops at the first item that matches.
 *
 * The two callers used to buffer every page before testing, so adding to a
 * 3000-track collection paged through the whole thing even when the match sat
 * on page 1. Testing per page short-circuits instead.
 * @param url - Spotify API URL for the playlist's tracks (relative or absolute)
 * @param match - Predicate run on each track
 */
async function playlistHas(url: string, match: (track: PlaylistTrack) => boolean): Promise<boolean> {
  let next: null | string = cleanUrl(url);

  while (next) {
    const { data }: { data: Paging<PlaylistTrack> } = await instance().get<Paging<PlaylistTrack>>(next);
    if (data.items.some(match)) return true;
    next = data.next ? cleanUrl(data.next) : null;
  }

  return false;
}
