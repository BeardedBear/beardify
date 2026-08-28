import { Album } from "./Album";
import { Artist } from "./Artist";
import { Paging } from "./Paging";
import { Podcast } from "./Podcast";
import { TrackSimplified } from "./Track";

export interface Search {
  /** Transient: the release key whose album search is in flight, for its row's loader. */
  activeAlbumKey: null | string;
  albums: Album[];
  artists: Artist[];
  /** Set when the request threw, so the view can tell "nothing" from "it broke". */
  failed: boolean;
  /**
   * True from the keystroke, not from the request: the debounce is part of the
   * wait as far as the reader is concerned. Without it the four "No X found"
   * strings double as the loading state and every first search announces
   * failure while it is still running.
   */
  loading: boolean;
  /** Transient: set on a release-row click; `search()` resolves or clears it. */
  navigateAlbumIfSingle: boolean;
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
