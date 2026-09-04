import { reactive } from "vue";

import { Album } from "@/@types/Album";
import { Artist } from "@/@types/Artist";
import { Paging } from "@/@types/Paging";
import { Release } from "@/@types/Releases";
import { instance } from "@/api";
import { useReleases } from "@/views/releases/ReleasesStore";

/** What a release row has learnt about the Spotify album behind it. */
export interface ReleaseAlbum {
  pending: boolean;
  /** Null once the search has answered and found nothing this account can play. */
  uri: null | string;
}

/** A handful is plenty: the right album is never buried past the first few hits. */
const SEARCH_LIMIT = 10;

/*
 * One timer for the whole feed, because only one cover is under the pointer at
 * a time — a second hover cancels the first by definition. The delay is what
 * keeps a scroll past a hundred rows from firing a hundred searches at Spotify
 * and earning a 429.
 */
const HOVER_DELAY_MS = 400;
let hoverTimer: ReturnType<typeof setTimeout> | undefined;

/*
 * Keyed by release key rather than by row, so the answer outlives a re-render,
 * a filter change and a scroll back up: hovering the same cover twice costs one
 * request.
 */
const resolved = reactive(new Map<string, ReleaseAlbum>());

/** Drops a hover that never became an intent — the pointer left before the delay elapsed. */
export function cancelReleaseAlbumLookup(): void {
  clearTimeout(hoverTimer);
}

/**
 * Starts resolving a release to a playable album, after a hover has lasted long
 * enough to read as intent. Cheap to call repeatedly: an answered release is
 * never looked up twice.
 * @param release - The hovered feed row
 */
export function lookupReleaseAlbum(release: Release): void {
  clearTimeout(hoverTimer);
  if (resolved.has(release.key)) return;
  hoverTimer = setTimeout(() => void fetchReleaseAlbum(release), HOVER_DELAY_MS);
}

/**
 * The album a release names, or undefined when the search found nothing that is
 * unmistakably it. An exact title wins; a title the candidate only extends —
 * "… (Deluxe Edition)", "… (Remastered)" — is the fallback, because the feed
 * lists the plain edition and Spotify frequently carries only the other. The
 * artist has to match either way: album titles repeat across artists, and
 * playing the wrong band's "Nightfall" is worse than showing no button.
 * @param release - The feed row, for its album title and artist name
 * @param candidates - What the album search returned
 */
export function matchReleaseAlbum(
  release: { artistName: string; name: string },
  candidates: Album[],
): Album | undefined {
  const wantedAlbum = normalizeTitle(release.name);
  const wantedArtist = normalizeTitle(release.artistName);
  const byArtist = candidates.filter((album) =>
    album.artists.some((artist) => normalizeTitle(artist.name) === wantedArtist),
  );

  return (
    byArtist.find((album) => normalizeTitle(album.name) === wantedAlbum)
    ?? byArtist.find((album) => normalizeTitle(album.name).startsWith(`${wantedAlbum} `))
  );
}

/**
 * Spotify's titles and the feed's never line up character for character — the
 * feed comes from scrapers, so accents, punctuation and "Vol. 2" against
 * "Vol 2" all differ. Reducing both to letters and digits is what lets an
 * equality test survive that.
 * @param value - Any album or artist name
 */
export function normalizeTitle(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** What is known about this release's album right now, or undefined if never looked up. */
export function releaseAlbum(key: string): ReleaseAlbum | undefined {
  return resolved.get(key);
}

/**
 * Hands the row whatever genres Spotify files its artist under.
 *
 * Its own request, because the album objects a search returns carry no genres —
 * and the full album's are empty for all but a handful of records, while the
 * artist's are filled for practically everyone. One extra call, on a row that
 * has none of its own, once per release for the life of the tab.
 * @param key - The release key being resolved
 * @param album - The album the search matched, for its primary artist
 */
async function enrichReleaseGenres(key: string, album: Album): Promise<void> {
  const artistId = album.artists[0]?.id;
  if (!artistId) return;

  try {
    const { data } = await instance().get<Artist>(`artists/${artistId}`);
    useReleases().enrichGenres(key, data.genres);
  } catch {
    // The row keeps its bare chip strip, which is what it had a moment ago anyway.
  }
}

async function fetchReleaseAlbum(release: Release): Promise<void> {
  resolved.set(release.key, { pending: true, uri: null });

  try {
    const results = await instance().get<{ albums: Paging<Album> }>(
      `search?q=${encodeURIComponent(`${release.artistName} ${release.name}`)}`
      + `&type=album&limit=${SEARCH_LIMIT}&market=from_token`,
    );
    const match = matchReleaseAlbum(release, results.data.albums.items);
    resolved.set(release.key, { pending: false, uri: match?.uri ?? null });

    /*
     * The hover already knows which artist this is, and two thirds of the feed
     * arrives with no genre at all — so the same gesture that finds the album is
     * what fills the row's empty chip strip. Only when it is empty: the scrapers
     * classify the record, Spotify classifies the artist, and the record wins.
     */
    if (match && !release.genres.length) await enrichReleaseGenres(release.key, match);
  } catch {
    /*
     * Nothing to tell the reader: the row keeps its cover and every control it
     * already had. Forgetting the entry rather than recording a failure is what
     * makes the next hover retry instead of showing a permanent dead cover.
     */
    resolved.delete(release.key);
  }
}
