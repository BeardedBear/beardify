import { AlbumSimplified } from "@/@types/Album";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";

export function removeDuplicatesAlbums(array: AlbumSimplified[]): AlbumSimplified[] {
  const seenIds = new Set<string>();
  const seenNames = new Set<string>();
  const result: AlbumSimplified[] = [];

  for (const album of array) {
    const normalizedName = normalizeDiacritics(album.name.trim().replace(/\s+/g, " ")).toLowerCase();
    if (!seenIds.has(album.id) && !seenNames.has(normalizedName)) {
      seenIds.add(album.id);
      seenNames.add(normalizedName);
      result.push(album);
    }
  }

  return result;
}
