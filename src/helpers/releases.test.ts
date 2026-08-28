import { describe, expect, it } from "vitest";

import { AlbumSimplified } from "@/@types/Album";
import { Release } from "@/@types/Releases";
import { MUSICBRAINZ_GENRES } from "@/assets/musicbrainzGenres";
import { MusicBrainzReleaseGroupHit } from "@/helpers/musicbrainz";
import {
  dayLabel,
  genreTerms,
  matchesTrackedTags,
  mergeReleases,
  monthLabel,
  normalizeTag,
  releaseKey,
  releaseTimestamp,
  suggestGenres,
  toRelease,
  toReleaseFromMusicBrainz,
} from "@/helpers/releases";

function release(overrides: Partial<Release>): Release {
  const base = {
    artistId: "a1",
    artistName: "Gojira",
    genres: [],
    id: "id1",
    images: [],
    name: "Fortitude",
    releaseDate: "2026-08-10",
    single: false,
    sources: ["editorial"],
    terms: [],
    timestamp: releaseTimestamp("2026-08-10"),
    ...overrides,
  } as Omit<Release, "key">;

  // Derived last so an override of the artist or title carries into the key, the way it does in production.
  return { ...base, key: overrides.key ?? releaseKey(base.artistName, base.name) };
}

describe("releaseTimestamp", () => {
  it("parses the three date precisions to the start of the period", () => {
    expect(releaseTimestamp("2026-08-10")).toBe(Date.UTC(2026, 7, 10));
    expect(releaseTimestamp("2026-08")).toBe(Date.UTC(2026, 7, 1));
    expect(releaseTimestamp("2026")).toBe(Date.UTC(2026, 0, 1));
  });

  it("returns 0 rather than NaN on unusable input", () => {
    expect(releaseTimestamp("")).toBe(0);
    expect(releaseTimestamp("not a date")).toBe(0);
  });
});

describe("releaseKey", () => {
  it("matches the same record across sources that punctuate and case it differently", () => {
    expect(releaseKey("Sigur Rós", "Á­gætis byrjun")).toBe(releaseKey("sigur rós", "á­gætis  byrjun"));
  });
});

describe("genreTerms", () => {
  it("rolls micro-genres up to a family the artist is never tagged with directly", () => {
    // Radiohead's real Spotify genres — neither of them is the bare "rock" a listener filters on.
    expect(genreTerms(["art rock", "alternative rock"])).toEqual(["art rock", "alternative rock", "rock"]);
  });

  it("keeps the family listed once when several genres share it", () => {
    const terms = genreTerms(["progressive metal", "groove metal", "metal", "djent"]);

    expect(terms.filter((term) => term === "metal")).toHaveLength(1);
  });

  it("adds every family a genre spans", () => {
    expect(genreTerms(["rap metal"])).toEqual(["rap metal", "metal", "rap"]);
  });

  it("leaves a genre outside the families alone", () => {
    expect(genreTerms(["djent"])).toEqual(["djent"]);
  });
});

describe("normalizeTag", () => {
  it("lowercases and collapses so one tag is not typed into two", () => {
    expect(normalizeTag("  Black   Metal ")).toBe("black metal");
  });

  it("strips the characters that would break out of the quoted Lucene term", () => {
    expect(normalizeTag("metal\") OR tag:(\"pop")).toBe("metal) or tag:(pop");
    expect(normalizeTag("metal\\")).toBe("metal");
  });

  it("returns empty for input with nothing usable left", () => {
    expect(normalizeTag("  \"\" ")).toBe("");
  });
});

describe("matchesTrackedTags", () => {
  it("keeps a release whose genre is the tracked one", () => {
    expect(matchesTrackedTags(release({ genres: ["nu metal", "rock"] }), ["metal"])).toBe(true);
  });

  it("keeps a sub-genre of what is tracked", () => {
    expect(matchesTrackedTags(release({ genres: ["epic doom metal"] }), ["doom metal"])).toBe(true);
  });

  it("drops the editorial pop that Spotify pours in regardless of the tracked genres", () => {
    expect(matchesTrackedTags(release({ genres: ["k-pop", "afrobeats"] }), ["metal", "rock"])).toBe(false);
  });

  it("drops a release nothing could classify", () => {
    expect(matchesTrackedTags(release({ genres: [] }), ["metal"])).toBe(false);
  });

  it("keeps a MusicBrainz row whose response echoed no tags back", () => {
    expect(matchesTrackedTags(release({ genres: [], sources: ["musicbrainz"] }), ["metal"])).toBe(true);
  });

  /*
   * The case the whole followed source exists for: a record released this week has
   * no MusicBrainz genre tag yet, so testing it against the tracked genres would
   * drop the one release the user was most likely waiting for.
   */
  it("keeps an untagged release by a followed artist", () => {
    expect(matchesTrackedTags(release({ genres: [], sources: ["followed"] }), ["metal"])).toBe(true);
  });

  it("filters nothing when nothing is tracked", () => {
    expect(matchesTrackedTags(release({ genres: ["k-pop"] }), [])).toBe(true);
  });
});

describe("suggestGenres", () => {
  const vocabulary = ["acoustic metal", "atmospheric black metal", "black metal", "metal", "metalcore", "pop"];

  it("puts the plain term first instead of burying it under alphabetical matches", () => {
    expect(suggestGenres("metal", vocabulary, [], 8)[0]).toBe("metal");
  });

  it("ranks prefix matches above matches in the middle", () => {
    expect(suggestGenres("metal", vocabulary, [], 8)).toEqual([
      "metal",
      "metalcore",
      "black metal",
      "acoustic metal",
      "atmospheric black metal",
    ]);
  });

  it("leaves out what is already tracked", () => {
    expect(suggestGenres("metal", vocabulary, ["metal", "metalcore"], 8)[0]).toBe("black metal");
  });

  it("matches the way the tag will be normalized, not the way it was typed", () => {
    expect(suggestGenres("  BLACK  Metal ", vocabulary, [], 8)).toContain("black metal");
  });

  it("returns nothing for an empty query rather than the whole vocabulary", () => {
    expect(suggestGenres("   ", vocabulary, [], 8)).toEqual([]);
  });

  it("honours the limit", () => {
    expect(suggestGenres("metal", vocabulary, [], 2)).toHaveLength(2);
  });
});

describe("MUSICBRAINZ_GENRES", () => {
  it("is the vocabulary the query actually matches on, in the normalized form", () => {
    expect(MUSICBRAINZ_GENRES).toContain("black metal");
    expect(MUSICBRAINZ_GENRES.every((genre) => genre === normalizeTag(genre))).toBe(true);
  });
});

describe("monthLabel", () => {
  it("keeps a UTC-midnight first of month in its own month", () => {
    expect(monthLabel(Date.UTC(2026, 7, 1))).toBe("August 2026");
  });
});

describe("dayLabel", () => {
  it("labels a full date with its weekday", () => {
    expect(dayLabel({ releaseDate: "2026-08-21", timestamp: releaseTimestamp("2026-08-21") }))
      .toBe("Friday, August 21");
  });

  it("refuses to invent a day for a month- or year-only date", () => {
    expect(dayLabel({ releaseDate: "2026-08", timestamp: releaseTimestamp("2026-08") })).toBeNull();
    expect(dayLabel({ releaseDate: "2026", timestamp: releaseTimestamp("2026") })).toBeNull();
    expect(dayLabel({ releaseDate: "", timestamp: 0 })).toBeNull();
  });
});

describe("toRelease", () => {
  it("flags a two-track single but not a three-track EP", () => {
    const album = (total_tracks: number): AlbumSimplified =>
      ({
        album_type: "single",
        artists: [{ id: "a1", name: "Gojira" }],
        id: "x",
        images: [],
        name: "Amazonia",
        release_date: "2026-08-10",
        total_tracks,
      }) as unknown as AlbumSimplified;

    expect(toRelease(album(2), "fresh").single).toBe(true);
    expect(toRelease(album(3), "fresh").single).toBe(false);
  });

  it("does not throw on an album with no artist credited", () => {
    const orphan = { artists: [], id: "x", images: [], name: "?", release_date: "2026" } as unknown as AlbumSimplified;

    expect(toRelease(orphan, "fresh").artistName).toBe("Unknown artist");
  });
});

describe("toReleaseFromMusicBrainz", () => {
  const hit = {
    "artist-credit": [{ artist: { id: "mb-artist", name: "Fen" }, name: "Fen" }],
    "first-release-date": "2026-08-21",
    id: "7e161d0f-51b0-4e12-ac5f-f93dda5138a0",
    "primary-type": "Album",
    tags: [{ count: 3, name: "metal" }, { count: 1, name: "black metal" }],
    title: "Elemental Part One",
  } as MusicBrainzReleaseGroupHit;

  it("carries the community tags over as genres", () => {
    expect(toReleaseFromMusicBrainz(hit).genres).toEqual(["metal", "black metal"]);
  });

  it("points the cover at the Cover Art Archive without a lookup", () => {
    expect(toReleaseFromMusicBrainz(hit).images[0].url).toBe(
      "https://coverartarchive.org/release-group/7e161d0f-51b0-4e12-ac5f-f93dda5138a0/front-250",
    );
  });

  it("keys identically to the Spotify row for the same record", () => {
    const spotify = release({ artistName: "Fen", name: "Elemental Part One" });

    expect(toReleaseFromMusicBrainz(hit).key).toBe(spotify.key);
  });

  it("survives a release-group with no date and no tags", () => {
    const bare = { "artist-credit": [{ name: "X" }], id: "abc", "primary-type": "Album", title: "Y" };

    expect(toReleaseFromMusicBrainz(bare as MusicBrainzReleaseGroupHit).timestamp).toBe(0);
  });
});

describe("mergeReleases", () => {
  it("sorts newest first", () => {
    const merged = mergeReleases([
      [release({ id: "old", key: "a|old", name: "Old", timestamp: releaseTimestamp("2026-01-05") })],
      [release({ id: "new", key: "a|new", name: "New", timestamp: releaseTimestamp("2026-08-10") })],
    ]);

    expect(merged.map((r) => r.id)).toEqual(["new", "old"]);
  });

  it("collapses the same record found under two source ids and keeps both sources", () => {
    const merged = mergeReleases([
      [release({ id: "spotify-id", sources: ["editorial"] })],
      [release({ id: "mb-id", sources: ["musicbrainz"] })],
    ]);

    expect(merged).toHaveLength(1);
    expect(merged[0].sources).toEqual(["editorial", "musicbrainz"]);
  });

  it("fills each gap from whichever source has the value", () => {
    const cover = [{ height: 640, url: "cover.jpg", width: 640 }];
    const merged = mergeReleases([
      [release({ artistId: "spotify-artist", genres: [], images: cover })],
      [release({ artistId: "", genres: ["black metal"], images: [] })],
    ]);

    expect(merged[0].images).toEqual(cover);
    expect(merged[0].genres).toEqual(["black metal"]);
    expect(merged[0].artistId).toBe("spotify-artist");
  });
});
