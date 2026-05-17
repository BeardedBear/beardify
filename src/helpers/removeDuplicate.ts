import { AlbumSimplified } from "@/@types/Album";

/**
 * Remove duplicate albums from an array, comparing by normalized name (trimmed, lowercased).
 * Keeps the first occurrence of each album name.
 * @param array - Array of albums potentially containing duplicates
 * @returns Deduplicated array preserving original order
 */
export function removeDuplicatesAlbums(array: AlbumSimplified[]): AlbumSimplified[] {
  const seen = new Set<string>();
  const result: AlbumSimplified[] = [];

  for (const album of array) {
    const normalizedName = album.name.trim().toLowerCase();
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      result.push(album);
    }
  }

  return result;
}
