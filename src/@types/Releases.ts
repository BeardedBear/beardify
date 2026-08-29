import { Image } from "./Image";

/** A month heading and the releases filed under it, as the list renders them. */
export interface MonthGroup {
  label: string;
  releases: Release[];
  /** Every release in the month carries the same one — what groups them. */
  timestamp: number;
  /** The month's highest-rated releases, for the highlight rail. */
  top: Release[];
  /** How many of the month's releases are not ticked off yet. */
  unheard: number;
}

export interface Release {
  artistName: string;
  /** As the scrapers file it: lowercased, space-separated, several per release. */
  genres: string[];
  /** The scraper's own id for the row, prefixed with its source. */
  id: string;
  images: Image[];
  /**
   * Normalized artist + title. What deduplication and the listened ticks both key on:
   * the same record has a different id in every source, and a tick has to outlive the
   * source that happened to surface it this week.
   */
  key: string;
  name: string;
  /**
   * The source's editorial score out of 5, when it publishes one. The only quality
   * signal the feed carries, and what makes a long list triageable.
   */
  rating: null | number;
  /** What the sidebar filters on: `genres` plus their broad families. */
  terms: string[];
  /** The release month, resolved to a sortable epoch. The only date the feed keeps. */
  timestamp: number;
}

export interface ReleasesPage {
  /** Release key → moment it was ticked off. A plain map so a tick is O(1) both ways. */
  checks: Record<string, number>;
  error: boolean;
  /**
   * Shape version of the persisted feed. Bumped whenever a field is added to
   * `Release`, so a cache written by an older build is dropped instead of rendered.
   */
  feedVersion: number;
  fetchedAt: null | number;
  genre: null | string;
  /** Genres present in the scraped table — what the tracking dialog suggests. */
  genreVocabulary: string[];
  hideChecked: boolean;
  loading: boolean;
  releases: Release[];
  /** Sort each month's releases by the editorial rating, highest first. */
  sortRating: boolean;
  /** Genres the feed is built from. Seeded from the user's top artists, then editable. */
  tags: string[];
  /** Set once the user edits `tags`, which stops the top-artists seeding from overwriting them. */
  tagsCustom: boolean;
}
