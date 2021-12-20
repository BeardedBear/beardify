import { AlbumSimplified } from "../@types/Album";

export function removeDuplicatesAlbums(array: AlbumSimplified[]): AlbumSimplified[] {
  return array.reduce((acc: AlbumSimplified[], value) => {
    return acc.some((album) => album.name.trim().toLowerCase() === value.name.trim().toLowerCase())
      ? acc
      : acc.concat(value);
  }, []);
}
