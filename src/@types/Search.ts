import { Album } from "./Album";
import { Artist } from "./Artist";
import { Paging } from "./Paging";
import { Podcast } from "./Podcast";
import { TrackSimplified } from "./Track";

export interface Search {
  albums: Album[];
  artists: Artist[];
  podcasts: Podcast[];
  query: string;
  tracks: TrackSimplified[];
}

export interface SearchFromAPI {
  albums: Paging<Album>;
  artists: Paging<Artist>;
  shows: Paging<Podcast>;
  tracks: Paging<TrackSimplified>;
}
