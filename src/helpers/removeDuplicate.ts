import { AlbumSimplified } from "@/@types/Album";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";

/**
 * Remove duplicate albums from an array, comparing by normalized name.
 * Normalization: trim, collapse internal spaces, strip diacritics, lowercase.
 * Keeps the first occurrence of each album name.
 * @param array - Array of albums potentially containing duplicates
 * @returns Deduplicated array preserving original order
 */
export function removeDuplicatesAlbums(array: AlbumSimplified[]): AlbumSimplified[] {
  const seen = new Set<string>();
  const result: AlbumSimplified[] = [];

  for (const album of array) {
    const normalizedName = normalizeDiacritics(album.name.trim().replace(/\s+/g, " ")).toLowerCase();
    if (!seen.has(normalizedName)) {
      seen.add(normalizedName);
      result.push(album);
    }
  }

  return result;
}
