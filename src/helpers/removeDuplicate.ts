import { AlbumSimplified } from "@/@types/Album";

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
