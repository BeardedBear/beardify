import { Album } from "./Album";
import { Artist } from "./Artist";
import { Paging } from "./Paging";
import { TrackSimplified } from "./Track";

export interface Search {
  albums: Album[];
  artists: Artist[];
  query: string;
  tracks: TrackSimplified[];
}

export interface SearchFromAPI {
  albums: Paging<Album>;
  artists: Paging<Artist>;
  tracks: Paging<TrackSimplified>;
}
