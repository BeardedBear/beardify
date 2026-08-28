import { AlbumSimplified } from "@/@types/Album";
import { Release, ReleaseSource } from "@/@types/Releases";
import { normalizeString } from "@/helpers/helper";
import { MusicBrainzReleaseGroupHit } from "@/helpers/musicbrainz";
import { isSingle } from "@/helpers/useCleanAlbums";

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
const DAY_FORMATTER = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "long", timeZone: "UTC", weekday: "long" });

/**
 * Day sub-heading for a release, e.g. "Friday, August 21".
 *
 * Returns null for anything the source only dated to a month or a year. Those
 * timestamps sit on the first of the period, so formatting them as a day would
 * invent a precision that is not there — an album MusicBrainz dates to "2026"
 * would claim to have come out on January 1st.
 * @param release - The release to label
 */
export function dayLabel(release: Pick<Release, "releaseDate" | "timestamp">): null | string {
  if (release.releaseDate.length !== 10 || !release.timestamp) return null;
  return DAY_FORMATTER.format(release.timestamp);
}

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

/** Ceiling on the tracked-genre list, to keep the MusicBrainz Lucene clause a sane length. */
export const MAX_TRACKED_TAGS = 15;

/**
 * Whether a release belongs in a feed tracking `tags`.
 *
 * This is what makes the tracked list mean "what is in the feed" rather than
 * "what one of the three sources was asked for". Spotify's two feeds take no
 * genre argument at all — `genre:` returns nothing on an album search — so
 * without this pass they pour their editorial pop into a feed set to metal, and
 * being the larger sources they bury MusicBrainz's answer entirely.
 *
 * Substring, not equality: tracking "doom metal" has to catch "epic doom metal",
 * the same widening `genreTerms` applies to the families.
 * @param release - Release to test
 * @param tags - Tracked genres; an empty list tracks nothing and filters nothing
 */
export function matchesTrackedTags(release: Release, tags: string[]): boolean {
  if (!tags.length) return true;

  /*
   * A MusicBrainz row was selected by the tag query itself, so it matches by
   * construction. Testing it again would drop the ones whose search hit came back
   * without its `tags` array — a response detail, not a statement about the album.
   *
   * A followed-artist row bypasses the genre filter for a different reason: the
   * user follows the artist, which is a stronger statement of interest than any
   * genre list. It is also the only way these rows survive at all — the newest
   * releases are exactly the ones MusicBrainz has not tagged yet.
   */
  if (release.sources.includes("musicbrainz") || release.sources.includes("followed")) return true;

  return tags.some((tag) => release.genres.some((genre) => genre.includes(tag)));
}

/**
 * Merge the sources into one feed: newest first, one row per album.
 *
 * Deduplication is on `key`, not on the id, because no two sources agree on an id
 * — Spotify alone hands the same record a different one per market and per edition,
 * and a MusicBrainz row has no Spotify id at all. The surviving row keeps every
 * source that found it and the best metadata any of them had.
 * @param lists - One array per source, in priority order: earlier wins on conflicts
 */
export function mergeReleases(lists: Release[][]): Release[] {
  const byKey = new Map<string, Release>();

  for (const release of lists.flat()) {
    const existing = byKey.get(release.key);

    if (!existing) {
      byKey.set(release.key, { ...release, sources: [...release.sources] });
      continue;
    }

    for (const source of release.sources) {
      if (!existing.sources.includes(source)) existing.sources.push(source);
    }
    // Each source is missing something the others have: Spotify never reports genres
    // on an album, MusicBrainz has no cover of its own for a good third of releases.
    if (!existing.images.length && release.images.length) existing.images = release.images;
    if (!existing.genres.length && release.genres.length) existing.genres = release.genres;
    if (!existing.artistId && release.artistId) existing.artistId = release.artistId;
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

/**
 * The identity of a release across sources and across refreshes.
 * @param artist - Main artist name
 * @param album - Album title
 */
export function releaseKey(artist: string, album: string): string {
  return `${normalizeString(artist)}|${normalizeString(album)}`;
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
 * Turn a Spotify album into a release row.
 * @param album - Simplified album from any Spotify listing endpoint
 * @param source - Which listing it came from
 */
export function toRelease(album: AlbumSimplified, source: ReleaseSource): Release {
  const artistName = album.artists[0]?.name ?? "Unknown artist";

  return {
    artistId: album.artists[0]?.id ?? "",
    artistName,
    genres: [],
    id: album.id,
    images: album.images,
    key: releaseKey(artistName, album.name),
    name: album.name,
    releaseDate: album.release_date,
    single: isSingle(album),
    sources: [source],
    terms: [],
    timestamp: releaseTimestamp(album.release_date),
  };
}

/**
 * Turn a MusicBrainz release-group into a release row.
 *
 * The cover comes straight from the Cover Art Archive by release-group id — a URL,
 * not a lookup, so it costs no request. It 404s for roughly a third of releases,
 * which the cover component handles by falling back to the placeholder.
 * @param hit - Release-group as the search endpoint returned it
 */
export function toReleaseFromMusicBrainz(hit: MusicBrainzReleaseGroupHit): Release {
  const artistName = hit["artist-credit"][0]?.name ?? "Unknown artist";
  const releaseDate = hit["first-release-date"] ?? "";

  return {
    artistId: "",
    artistName,
    genres: (hit.tags ?? []).map((tag) => tag.name),
    id: hit.id,
    images: [{ height: 250, url: `https://coverartarchive.org/release-group/${hit.id}/front-250`, width: 250 }],
    key: releaseKey(artistName, hit.title),
    name: hit.title,
    releaseDate,
    // MusicBrainz was asked for primarytype:Album, so nothing here is a single.
    single: false,
    sources: ["musicbrainz"],
    terms: [],
    timestamp: releaseTimestamp(releaseDate),
  };
}
