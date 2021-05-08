import { Album } from "./Album";
import { Artist } from "./Artist";
import { TrackSimplified } from "./Track";
import { Paging } from "./Paging";

export interface Search {
  query: string;
  artists: Artist[];
  albums: Album[];
  tracks: TrackSimplified[];
}

export interface SearchFromAPI {
  artists: Paging<Artist[]>;
  albums: Paging<Album[]>;
  tracks: Paging<TrackSimplified[]>;
}
