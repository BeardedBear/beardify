import { AlbumSimplified } from "../@types/Album";

export function removeDuplicatesAlbums(array: AlbumSimplified[]): AlbumSimplified[] {
  return array.reduce((acc: AlbumSimplified[], value) => {
    return acc.some(
      (album) =>
        album.name.toLowerCase() === value.name.toLowerCase() ||
        album.name
          .replaceAll(/[^a-z0-9]+/gi, " ")
          .toLowerCase()
          .replaceAll(" ", "") ===
          value.name
            .replaceAll(/[^a-z0-9]+/gi, " ")
            .toLowerCase()
            .replaceAll(" ", ""),
    )
      ? acc
      : acc.concat(value);
  }, []);
}
