import { GenreFacet, GenreGroup, MonthGroup, Release, ReleaseSort } from "@/@types/Releases";
import { normalizeString } from "@/helpers/helper";
import { FeedRelease } from "@/helpers/releaseFeed";

/*
 * Broad families, and the probes that pull a raw tag into one.
 *
 * The scrapers file a release under "atmospheric black metal" or "art rock" and
 * nothing broader, so a sidebar listing genre strings verbatim hides it under every
 * heading a listener would think to look. On top of that the hover lookup adds
 * Spotify's artist genres, which arrive in the account's own language — the same
 * music reaches the list as "experimental" and "musique expérimentale", "classical"
 * and "classique". Both are probes of the same family, which is what folds the two
 * vocabularies back into one.
 *
 * Probes are plain substrings, matched against the tag as the feed spells it. A tag
 * naming two families belongs to both — "rap metal" is filed under each — so the
 * order of this list decides nothing.
 */
const GENRE_FAMILIES: { name: string; probes: string[] }[] = [
  { name: "metal", probes: ["metal", "grind", "deathcore", "doom", "sludge", "djent", "black gaze"] },
  { name: "punk", probes: ["punk", "hardcore", "emo", "screamo", "riot grrrl", "queercore", "crust"] },
  {
    name: "rock",
    probes: ["rock", "shoegaze", "grunge", "psychedel", "psychédél", "gothic", "gothique", "garage", "stoner"],
  },
  { name: "pop", probes: ["pop", "shibuya-kei"] },
  {
    name: "electronic",
    probes: [
      "electro",
      "électro",
      "techno",
      "house",
      "ambient",
      "drone",
      "idm",
      "dance",
      "breakcore",
      "drum & bass",
      "drum and bass",
      "jungle",
      "dubstep",
      "industri",
      "edm",
      "trance",
      "synth",
      "trip hop",
    ],
  },
  { name: "hip hop", probes: ["hip hop", "hip-hop", "rap", "trap", "boom bap", "crunk", "hiplife", "grime", "drill"] },
  { name: "soul", probes: ["soul", "r&b", "rnb", "funk", "motown", "disco", "gospel"] },
  { name: "jazz", probes: ["jazz", "bebop", "big band"] },
  { name: "blues", probes: ["blues"] },
  { name: "country", probes: ["country", "americana", "bluegrass", "newgrass", "red dirt", "honky tonk", "billy"] },
  { name: "folk", probes: ["folk", "singer-songwriter", "chanson", "traditionnel"] },
  {
    name: "classical",
    probes: ["classical", "classique", "orchestr", "de chambre", "opera", "opéra", "baroque", "minimalis"],
  },
  {
    name: "experimental",
    probes: [
      "experimental",
      "expérimental",
      "avant-garde",
      "avant garde",
      "concrète",
      "concrete",
      "electroacoustique",
      "électroacoustique",
      "plunderphonics",
      "bruitiste",
      "noise",
      "lo fi",
      "lo-fi",
      "spoken word",
    ],
  },
  { name: "reggae", probes: ["reggae", "dancehall", "ska", "dub poetry"] },
  { name: "latin", probes: ["latin", "latino", "cumbia", "mambo", "salsa", "cubano", "mpb", "bossa", "reggaeton"] },
  { name: "african", probes: ["afro", "azonto", "alté", "highlife", "amapiano", "makossa"] },
  { name: "indie", probes: ["indie"] },
];

/**
 * Every family a raw tag belongs to.
 *
 * The one place the probes are read, so the terms a release is filtered by and the
 * branch the sidebar files it under can never disagree — a micro-genre shown under
 * "metal" whose row does not carry the term would empty the feed when clicked.
 * @param genre - One genre string, as the feed spells it
 */
export function genreFamilies(genre: string): string[] {
  return GENRE_FAMILIES.filter((family) => family.probes.some((probe) => genre.includes(probe))).map(
    (family) => family.name,
  );
}

/** Whether a term is one of the families, and so always worth a row of its own. */
export function isGenreFamily(name: string): boolean {
  return GENRE_FAMILIES.some((family) => family.name === name);
}

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
    for (const family of genreFamilies(genre)) terms.add(family);
  }

  return [...terms];
}

/**
 * The feed as the list renders it: one entry per month, newest first.
 *
 * One pass over an already-sorted feed rather than a scan per heading. Grouping is
 * on the timestamp, not the label — every release of a month carries the identical
 * one, so the month heading is formatted once per group instead of once per row.
 * @param releases - The releases to group, already sorted newest first
 * @param checks - Release key to the moment it was ticked off
 * @param sort - How to order the releases inside each month
 */
export function groupByMonth(releases: Release[], checks: Record<string, number>, sort: ReleaseSort): MonthGroup[] {
  const months: MonthGroup[] = [];
  let month: MonthGroup | undefined;

  for (const release of releases) {
    if (month?.timestamp !== release.timestamp) {
      month = {
        label: monthLabel(release.timestamp),
        releases: [],
        timestamp: release.timestamp,
        unheard: 0,
      };
      months.push(month);
    }

    month.releases.push(release);
    if (!checks[release.key]) month.unheard += 1;
  }

  /*
   * Sorting stays inside the month: either order scattered across months would lose
   * the orientation the headings are built around. Rating is restated rather than
   * inherited from the feed's own order — the cache and the network answer can be
   * merged in either order, so the control has to guarantee what it names.
   */
  for (const group of months) {
    group.releases.sort(
      sort === "artist"
        ? (a, b): number => a.artistName.localeCompare(b.artistName) || a.name.localeCompare(b.name)
        : (a, b): number => (b.rating ?? -1) - (a.rating ?? -1) || a.name.localeCompare(b.name),
    );
  }

  return months;
}

/**
 * The flat facet list arranged as families and their micro-genres.
 *
 * Both levels stay filterable and both were already terms — this only decides where
 * each one is rendered. "black metal" is filed under "metal" because a release
 * carrying it also carries the family (see `genreTerms`), so picking the parent is
 * genuinely "this genre and everything under it" rather than a second query.
 *
 * A micro-genre naming two families — "folk metal" — is listed under both. Choosing
 * an owner would need a rule the vocabulary does not have, and hiding it under one
 * of them is how a genre becomes unfindable.
 *
 * Incoming order is preserved rather than re-sorted: it is frequency across the whole
 * feed, which never moves, and re-ranking on the live counts would reshuffle the list
 * under the pointer on every tick.
 * @param genres - The facets, already ordered as the sidebar wants them
 */
export function groupGenres(genres: GenreFacet[]): GenreGroup[] {
  /*
   * Every family present is built before anything is filed under it. Built inline, a
   * micro-genre sorting ahead of its own family — "black metal" against a "metal" of
   * the same count — would find no parent yet and vanish from the list entirely.
   */
  const groups = new Map<string, GenreGroup>(
    genres
      .filter((genre) => isGenreFamily(genre.name))
      .map((genre) => [genre.name, { children: [], count: genre.count, name: genre.name }]),
  );

  const tree: GenreGroup[] = [];
  for (const genre of genres) {
    const group = groups.get(genre.name);
    if (group) {
      tree.push(group);
      continue;
    }

    const parents = genreFamilies(genre.name).filter((family) => groups.has(family));
    if (!parents.length) tree.push({ children: [], count: genre.count, name: genre.name });
    for (const parent of parents) groups.get(parent)?.children.push({ count: genre.count, name: genre.name });
  }

  return tree;
}

/*
 * Nominal size for a feed cover. The scrapers publish one artwork URL per release and
 * do not offer renditions, so this only tells the layout what shape to expect.
 */
const COVER_SIZE = 200;

/**
 * Whether a release survives the score gates.
 *
 * The two gates answer different questions and are deliberately independent: a row
 * the sources never scored has nothing to compare against a range, so narrowing the
 * range must not quietly delete it — only its own switch does that. Roughly a third
 * of the feed is unrated, so the mistake would hide a third of the page.
 * @param release - The row under test
 * @param hideUnrated - Drop the rows no source scored
 * @param range - Lowest and highest score kept, inclusive
 */
export function matchesRating(release: Release, hideUnrated: boolean, range: [number, number]): boolean {
  if (typeof release.rating !== "number") return !hideUnrated;

  return release.rating >= range[0] && release.rating <= range[1];
}

/**
 * Deduplicate the feed and put it newest first.
 *
 * Keyed on artist + title rather than on the source id: the listing can carry the
 * same record twice under two ids — a reissue filed beside the original, an entry
 * corrected after the fact — and two rows for one album is what a listener notices.
 * The first row of a pair wins, and the listing arrives rating-ordered within a
 * month, so that is the better-known entry.
 * @param releases - The rows to deduplicate
 */
export function mergeReleases(releases: Release[]): Release[] {
  const byKey = new Map<string, Release>();

  for (const release of releases) {
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

/**
 * How long a listened tick is kept.
 *
 * The feed itself never reaches further back than two months, so a tick older than
 * this can only refer to a release the page will never show again — dead weight in
 * localStorage and in the row synced between devices, growing forever otherwise.
 */
export const CHECK_TTL_MS = 90 * 24 * 60 * 60 * 1000;

/**
 * Where a score stops being good and starts being an event. The colour ramp is
 * continuous, so the badge already says "high" on its own; this is the line above
 * which it also gets the glow, and 90 is rare enough — a handful a month — that
 * the glow stays a signal instead of decoration.
 */
export const HOT_RATING = 90;

/**
 * The ticks worth keeping: everything ticked within the retention window.
 *
 * Keyed on when the tick was made, not on the release date — the release month is
 * not carried by the map, and a tick made today is worth keeping whatever it points
 * at.
 * @param checks - Release key to the moment it was ticked off
 * @param now - Reference time, injectable for tests
 */
export function pruneChecks(checks: Record<string, number>, now = Date.now()): Record<string, number> {
  return Object.fromEntries(Object.entries(checks).filter(([, at]) => now - at < CHECK_TTL_MS));
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
 * Turn a row of the scraped feed into a release row.
 *
 * The cover URL is stored by the scraper, not derived here: each source builds it its
 * own way, and this side should not have to know which site a row came from. A dead
 * one 404s and the cover component falls back to the placeholder.
 * @param row - Row as the `releases` table stores it
 */
export function toReleaseFromFeed(row: FeedRelease): Release {
  /*
   * Stored as the first of a month because the column is a `date`, but the listing
   * only ever states the month — so the day is dropped here rather than carried
   * forward as a fact. Nothing downstream reads a date any finer than the heading.
   */
  const month = row.month.slice(0, 7);

  return {
    artistName: row.artist,
    genres: row.genres,
    // Already unique in the table, and stable across runs: nothing to prefix.
    id: row.release_key,
    images: row.cover_url ? [{ height: COVER_SIZE, url: row.cover_url, width: COVER_SIZE }] : [],
    key: releaseKey(row.artist, row.album),
    name: row.album,
    rating: row.rating,
    // Derived here rather than by the caller: a row that reached the store without
    // its terms would be invisible to every sidebar filter and count.
    terms: genreTerms(row.genres),
    timestamp: releaseTimestamp(month),
  };
}
