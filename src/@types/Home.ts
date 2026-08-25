import { AlbumSimplified } from "./Album";

export interface HomePage {
  /** Set when the fetch failed, so the view can tell "nothing yet" from "it broke". */
  error: boolean;
  loading: boolean;
  recommendedAlbums: AlbumSimplified[];
}
