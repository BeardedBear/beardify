import { SimplifiedPlaylist } from "@/@types/Playlist";

export function isACollection(playlist: SimplifiedPlaylist): boolean {
  return playlist.name.toLowerCase().includes("#collection");
}
