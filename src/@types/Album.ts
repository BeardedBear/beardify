import { Image } from "./Artist";

export interface AlbumPage {
  album: Album;
}

export const defaultAlbum = {
  id: "",
  images: [],
  name: "",
  uri: ""
};

export interface Album {
  id: string;
  images: Image[];
  name: string;
  uri: string;
}
