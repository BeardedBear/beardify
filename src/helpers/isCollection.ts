import { SimplifiedPlaylist } from "@/@types/Playlist";

/**
 * Returns true if the playlist is a Collection (i.e. its name contains "#collection").
 * Collections are the core Beardify feature that transforms playlists into album collections.
 * @param playlist - Spotify simplified playlist object
 */
export function isACollection(playlist: SimplifiedPlaylist): boolean {
  return playlist.name.toLowerCase().includes("#collection");
}
