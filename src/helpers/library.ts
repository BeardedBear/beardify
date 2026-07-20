import { instance } from "@/api";

export type LibraryItemType = "album" | "artist" | "audiobook" | "episode" | "playlist" | "show" | "track" | "user";

/**
 * Check whether an item is in the current user's library.
 */
export async function isInLibrary(type: LibraryItemType, id: string): Promise<boolean> {
  const { data } = await instance().get<boolean[]>(`me/library/contains?uris=${libraryUri(type, id)}`);
  return data[0] ?? false;
}

/**
 * Remove/unfollow an item from the current user's library.
 */
export async function removeFromLibrary(type: LibraryItemType, id: string): Promise<void> {
  await instance().delete(`me/library?uris=${libraryUri(type, id)}`);
}

/**
 * Save/follow an item (track, album, show, artist, user or playlist) to the current user's library.
 */
export async function saveToLibrary(type: LibraryItemType, id: string): Promise<void> {
  await instance().put(`me/library?uris=${libraryUri(type, id)}`);
}

function libraryUri(type: LibraryItemType, id: string): string {
  return `spotify:${type}:${id}`;
}
