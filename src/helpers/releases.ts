import { Release } from "@/@types/Releases";
import { normalizeString } from "@/helpers/helper";
import { FeedRelease } from "@/helpers/releaseFeed";

/*
 * Broad families rolled up from the sources' micro-genres.
 *
 * Spotify does tag plenty of artists with a bare "rock" or "metal" — but not all
 * of them: Radiohead comes back as "art rock, alternative rock" and nothing else,
 * so a filter matching genre strings exactly hides it under every heading a
 * listener would think to look. Each family is a substring probe, which is why
 * "hip hop" sits next to "rap": they are separate strings in the vocabulary.
 *
 * They double as MusicBrainz query tags, so every entry has to be a term that
 * community actually applies — "metal" and "rock" are, "alt-rock" is not.
 */
export const GENRE_FAMILIES = [
  "blues",
  "classical",
  "country",
  "electronic",
  "folk",
  "hip hop",
  "house",
  "jazz",
  "metal",
  "pop",
  "punk",
  "rap",
  "reggae",
  "rock",
  "soul",
  "techno",
];

/*
 * Month headers are built from the UTC parts on purpose. Release dates are bare
 * calendar days, so `new Date("2026-08-01")` is midnight UTC — rendered in a
 * negative offset that album would file itself under July.
 */
const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC", year: "numeric" });

/**
 * Every term a release can be filtered by: its own genres, plus the broad family
 * of each one. Counting and filtering both run off this single list, so the number
 * beside a sidebar entry is always the number of rows selecting it will leave.
 * @param genres - Genres or tags reported for the release
 */
export function genreTerms(genres: string[]): string[] {
  const terms = new Set(genres);

  for (const genre of genres) {
    for (const family of GENRE_FAMILIES) {
      if (genre.includes(family)) terms.add(family);
    }
  }

  return [...terms];
}

/*
 * Nominal size for a feed cover. The scrapers publish one artwork URL per release and
 * do not offer renditions, so this only tells the layout what shape to expect.
 */
const COVER_SIZE = 200;

/** Ceiling on the tracked-genre list, to keep the MusicBrainz Lucene clause a sane length. */
export const MAX_TRACKED_TAGS = 15;

/**
 * Deduplicate the feed and put it newest first.
 *
 * Keyed on artist + title rather than on the source id: the listing can carry the
 * same record twice under two ids — a reissue filed beside the original, an entry
 * corrected after the fact — and two rows for one album is what a listener notices.
 * The first row of a pair wins, and the listing arrives rating-ordered within a
 * month, so that is the better-known entry.
 * @param lists - One array per source
 */
export function mergeReleases(lists: Release[][]): Release[] {
  const byKey = new Map<string, Release>();

  for (const release of lists.flat()) {
    if (!byKey.has(release.key)) byKey.set(release.key, release);
  }

  return [...byKey.values()].sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Group label for a release, e.g. "August 2026".
 * @param timestamp - Epoch in ms
 */
export function monthLabel(timestamp: number): string {
  return MONTH_FORMATTER.format(timestamp);
}

/**
 * Clean a hand-typed genre into something safe to put in a MusicBrainz query.
 *
 * The tag is interpolated into a Lucene clause between double quotes, so a typed
 * `"` or `\` would end the term early and let the rest of the input be read as
 * query syntax — at best a query that silently matches nothing, at worst one that
 * matches everything. Case and spacing are normalized too: MusicBrainz tags are
 * lowercase, and "Black  Metal" has to reach the same tag as "black metal".
 * @param tag - Raw user input
 * @returns The usable tag, or an empty string when nothing usable is left
 */
export function normalizeTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/["\\]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/*
 * Listings disambiguate same-named artists with a country or an index — "Loathe (UK)",
 * "Picture (DEN)", "Slaughter (2)" — and not all of them do it, nor the same way. 74
 * artists in one window carried such a suffix, so leaving it in means the same album
 * is listed twice, once per spelling, as soon as two sources disagree. Deliberately
 * narrow: two or three uppercase letters with an optional region, or a small number.
 * It will not touch "Sunn O)))" or a band whose name genuinely ends in a parenthesis.
 */
const ARTIST_DISAMBIGUATION = /\s*\((?:\d{1,3}|[A-Z]{2,3}(?:-[A-Z]{2,3})?)\)\s*$/;

/**
 * The identity of a release across sources and across refreshes.
 * @param artist - Main artist name, as its source spells it
 * @param album - Album title
 */
export function releaseKey(artist: string, album: string): string {
  const bareArtist = artist.replace(ARTIST_DISAMBIGUATION, "");

  return `${normalizeString(bareArtist)}|${normalizeString(album)}`;
}

/**
 * Resolve a release date to a sortable epoch.
 * Sources return three precisions ("2026", "2026-08", "2026-08-10") and only the
 * last one is a date any parser agrees on — the short ones are padded to the start
 * of the period so a year-only release still lands in the right place.
 * @param releaseDate - Date string as the source returned it
 * @returns Epoch in ms, or 0 when the string is unusable
 */
export function releaseTimestamp(releaseDate: string): number {
  if (!releaseDate) return 0;

  const padded
    = releaseDate.length === 4
      ? `${releaseDate}-01-01`
      : releaseDate.length === 7
        ? `${releaseDate}-01`
        : releaseDate;
  const parsed = Date.parse(padded);

  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Genre suggestions for a partial query, best match first.
 *
 * Ranked rather than merely filtered: typing "metal" against 2192 genres matches
 * over a hundred, and an alphabetical slice of those starts at "acoustic metal"
 * — the plain "metal" the user is reaching for would not be on screen. A prefix
 * match outranks a match in the middle, and a shorter genre outranks a longer one.
 * @param query - What the user has typed
 * @param vocabulary - Genres to search, e.g. the MusicBrainz list
 * @param exclude - Genres already tracked, left out of the results
 * @param limit - How many suggestions to return
 */
export function suggestGenres(query: string, vocabulary: string[], exclude: string[], limit: number): string[] {
  const needle = normalizeTag(query);
  if (!needle) return [];

  const taken = new Set(exclude);
  const prefix: string[] = [];
  const contains: string[] = [];

  for (const genre of vocabulary) {
    if (taken.has(genre)) continue;

    const at = genre.indexOf(needle);
    if (at === 0) prefix.push(genre);
    else if (at > 0) contains.push(genre);
  }

  const byLength = (a: string, b: string): number => a.length - b.length || a.localeCompare(b);

  return [...prefix.sort(byLength), ...contains.sort(byLength)].slice(0, limit);
}

/**
 * Turn a row of the scraped feed into a release row.
 *
 * The cover URL is stored by the scraper, not derived here: each source builds it its
 * own way, and this side should not have to know which site a row came from. A dead
 * one 404s and the cover component falls back to the placeholder.
 * @param row - Row as the `releases` table stores it
 */
export function toReleaseFromFeed(row: FeedRelease): Release {
  /*
   * Stored as the first of the month because that is the only precision the listing
   * states. Trimmed back to "YYYY-MM" here so the rest of the app reads it as such
   * and does not announce a release "on the 1st" that came out some other day.
   */
  /*
   * Stored as the first of a month because the column is a `date`, but the listing
   * only ever states the month — so the day is dropped here rather than carried
   * forward as a fact. Nothing downstream reads a date any finer than the heading.
   */
  const month = row.month.slice(0, 7);

  return {
    artistId: "",
    artistName: row.artist,
    genres: row.genres,
    // Prefixed with the source: two sites can number an album the same.
    id: `${row.source}-${row.source_id}`,
    images: row.cover_url ? [{ height: COVER_SIZE, url: row.cover_url, width: COVER_SIZE }] : [],
    key: releaseKey(row.artist, row.album),
    name: row.album,
    rating: row.rating,
    terms: [],
    timestamp: releaseTimestamp(month),
  };
}
