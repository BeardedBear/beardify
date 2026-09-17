/** The result columns the search modal can show, in the order they appear. */
export const SEARCH_CATEGORIES = ["collections", "artists", "albums", "tracks", "podcasts"] as const;

/** Which columns are switched on. Persisted with the rest of the config. */
export type SearchCategories = Record<SearchCategory, boolean>;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

/** Labels for the settings panel, matching the column headings. */
export const SEARCH_CATEGORY_LABELS: Record<SearchCategory, string> = {
  albums: "Albums",
  artists: "Artists",
  collections: "Your collections",
  podcasts: "Podcasts",
  tracks: "Songs",
};

/**
 * Spotify's `type` values, by category.
 *
 * Collections are deliberately absent: they are matched against the sidebar
 * store, so showing them costs no request and switching them off saves none.
 */
const API_TYPES: Partial<Record<SearchCategory, string>> = {
  albums: "album",
  artists: "artist",
  podcasts: "show",
  tracks: "track",
};

/**
 * The `type` parameter for a search, empty when nothing needs the network.
 *
 * Asking for a category nobody will look at is a page of results fetched and
 * dropped, and Spotify leaves the matching key out of its response entirely
 * when a type is not requested — which is why the store guards every one.
 * @param categories - Which columns are switched on
 */
export function searchTypeParam(categories: SearchCategories): string {
  return SEARCH_CATEGORIES.map((category) => (categories[category] ? API_TYPES[category] : undefined))
    .filter((type): type is string => !!type)
    .join(",");
}
