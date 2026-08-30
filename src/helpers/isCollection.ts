import { Playlist, SimplifiedPlaylist } from "@/@types/Playlist";
import { isDescriptionCollection } from "@/helpers/collectionOptions";

/**
 * Strips the legacy "#Collection" name tag so a collection can be displayed.
 * Six call sites hand-rolled this replace and two of them handled the lowercase
 * variant while the others didn't, so the strip lives here instead.
 * @param name - Raw playlist name
 */
export function collectionDisplayName(name: string): string {
  return name.replace(/#collection\s*/i, "");
}

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
