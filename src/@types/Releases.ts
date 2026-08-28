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
  /** As the source returns it: "2026", "2026-08" or "2026-08-10". */
  releaseDate: string;
  /** Resolved at build time so the list filter does not have to re-derive it per render. */
  single: boolean;
  sources: ReleaseSource[];
  /** What the sidebar filters on: `genres` plus their broad families. */
  terms: string[];
  /** `releaseDate` resolved to a sortable epoch, month/year precision included. */
  timestamp: number;
}

/** Where a release was picked up. A release found by several sources keeps them all. */
export type ReleaseSource = "editorial" | "followed" | "fresh" | "musicbrainz";

export interface ReleasesPage {
  /** Drop the singles flood; EPs (3+ tracks) stay. */
  albumsOnly: boolean;
  /** Release key → moment it was ticked off. A plain map so a tick is O(1) both ways. */
  checks: Record<string, number>;
  error: boolean;
  fetchedAt: null | number;
  genre: null | string;
  hideChecked: boolean;
  loading: boolean;
  releases: Release[];
  /** MusicBrainz tags the feed is built from. Seeded from the user's top artists, then editable. */
  tags: string[];
  /** Set once the user edits `tags`, which stops the top-artists seeding from overwriting them. */
  tagsCustom: boolean;
}
