import { Album } from "./Album";
import { Artist } from "./Artist";
import { Paging } from "./Paging";
import { TrackSimplified } from "./Track";

export interface Search {
  query: string;
  artists: Artist[];
  albums: Album[];
  tracks: TrackSimplified[];
}

export interface SearchFromAPI {
  artists: Paging<Artist>;
  albums: Paging<Album>;
  tracks: Paging<TrackSimplified>;
}
