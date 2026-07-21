import { Playlist, SimplifiedPlaylist } from "@/@types/Playlist";
import { isDescriptionCollection } from "@/helpers/collectionOptions";

/**
 * Returns true if the playlist is a Collection (i.e. its description contains "#collection").
 * Collections are the core Beardify feature that transforms playlists into album collections.
 * @param playlist - Spotify (simplified or full) playlist object
 */
export function isACollection(playlist: Playlist | SimplifiedPlaylist): boolean {
  return isDescriptionCollection(playlist.description);
}

/**
 * Returns true if the playlist still uses the old naming convention
 * (tag in the name) and hasn't been converted to the new description-based
 * tag yet.
 * @param playlist - Spotify (simplified or full) playlist object
 */
export function isLegacyCollectionName(playlist: Playlist | SimplifiedPlaylist): boolean {
  return isDescriptionCollection(playlist.name) && !isACollection(playlist);
}
