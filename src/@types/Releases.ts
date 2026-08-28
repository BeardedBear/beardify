import { Image } from "./Image";

export interface Release {
  /** Spotify artist id when the row came from Spotify; empty for a MusicBrainz row. */
  artistId: string;
  artistName: string;
  /** Spotify carries genres on the artist, not on an album; MusicBrainz carries tags. */
  genres: string[];
  /** Source-specific: a Spotify album id or a MusicBrainz release-group id. */
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
  /** MusicBrainz tags the feed is built from. Seeded from the user's top artists, then editable. */
  tags: string[];
  /** Set once the user edits `tags`, which stops the top-artists seeding from overwriting them. */
  tagsCustom: boolean;
}
