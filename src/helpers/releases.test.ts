import { describe, expect, it } from "vitest";

import { Release } from "@/@types/Releases";
import {
  genreTerms,
  groupByMonth,
  matchesRating,
  mergeReleases,
  monthLabel,
  normalizeTag,
  pruneChecks,
  releaseKey,
  releaseTimestamp,
  toReleaseFromFeed,
} from "@/helpers/releases";

function release(overrides: Partial<Release>): Release {
  const base = {
    artistName: "Gojira",
    genres: [],
    id: "id1",
    images: [],
    name: "Fortitude",
    rating: null,
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
  it("ignores a listing's disambiguation suffix, which another source may not carry", () => {
    expect(releaseKey("Loathe (UK)", "A Stranger to You")).toBe(releaseKey("Loathe", "A Stranger to You"));
    expect(releaseKey("Picture (DEN)", "X")).toBe(releaseKey("Picture", "X"));
    expect(releaseKey("Slaughter (2)", "X")).toBe(releaseKey("Slaughter", "X"));
  });

  it("leaves a name that genuinely ends in a parenthesis alone", () => {
    expect(releaseKey("Godspeed You! (Black Emperor)", "X")).not.toBe(releaseKey("Godspeed You!", "X"));
  });

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

describe("monthLabel", () => {
  it("keeps a UTC-midnight first of month in its own month", () => {
    expect(monthLabel(Date.UTC(2026, 7, 1))).toBe("August 2026");
  });
});

describe("toReleaseFromFeed", () => {
  const row = {
    album: "Marrow Deep",
    artist: "Mastodon",
    cover_url: "https://www.sputnikmusic.com/images/albums/551990.jpg",
    genres: ["metal", "sludge metal"],
    month: "2026-08-01",
    rating: 84,
    release_key: "mastodon|marrow deep|2026-08-01",
  };

  it("keeps the month and drops the stored day, which the listing never stated", () => {
    expect(toReleaseFromFeed(row).timestamp).toBe(releaseTimestamp("2026-08"));
  });

  it("keys identically to the same record from another source", () => {
    expect(toReleaseFromFeed(row).key).toBe(release({ artistName: "Mastodon", name: "Marrow Deep" }).key);
  });

  it("carries the score and the genres over", () => {
    expect(toReleaseFromFeed(row).rating).toBe(84);
    expect(toReleaseFromFeed(row).genres).toEqual(["metal", "sludge metal"]);
  });

  it("derives the filter terms, without which the row is invisible to every sidebar filter", () => {
    expect(toReleaseFromFeed(row).terms).toEqual(["metal", "sludge metal"]);
  });

  it("takes the id straight from the upstream key, which is already unique", () => {
    expect(toReleaseFromFeed(row).id).toBe("mastodon|marrow deep|2026-08-01");
  });

  it("takes the cover the scraper stored, and copes with a source that has none", () => {
    expect(toReleaseFromFeed(row).images[0].url).toBe(row.cover_url);
    expect(toReleaseFromFeed({ ...row, cover_url: null }).images).toEqual([]);
  });
});

describe("mergeReleases", () => {
  it("sorts newest first", () => {
    const merged = mergeReleases([
      release({ id: "old", key: "a|old", name: "Old", timestamp: releaseTimestamp("2026-01-05") }),
      release({ id: "new", key: "a|new", name: "New", timestamp: releaseTimestamp("2026-08-10") }),
    ]);

    expect(merged.map((r) => r.id)).toEqual(["new", "old"]);
  });

  it("collapses the same record listed twice under different ids", () => {
    const merged = mergeReleases([release({ id: "a-1" }), release({ id: "b-2" })]);

    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("a-1");
  });
});

describe("groupByMonth", () => {
  const august = releaseTimestamp("2026-08");
  const july = releaseTimestamp("2026-07");

  function feed(): Release[] {
    return [
      release({ key: "a", name: "Aug high", rating: 4.5, timestamp: august }),
      release({ key: "b", name: "Aug low", rating: 2, timestamp: august }),
      release({ key: "c", name: "Aug unrated", rating: null, timestamp: august }),
      release({ key: "d", name: "Jul one", rating: 3, timestamp: july }),
    ];
  }

  it("splits an already-sorted feed into one labelled group per month", () => {
    const groups = groupByMonth(feed(), {}, false);

    expect(groups.map((group) => group.label)).toEqual(["August 2026", "July 2026"]);
    expect(groups[0].releases).toHaveLength(3);
  });

  it("counts the releases still to hear, and only those", () => {
    expect(groupByMonth(feed(), { a: Date.now(), b: Date.now() }, false)[0].unheard).toBe(1);
  });

  it("ranks the top of the month by score, leaving the unrated out", () => {
    const [augustGroup] = groupByMonth(feed(), {}, false);

    expect(augustGroup.top.map((r) => r.name)).toEqual(["Aug high", "Aug low"]);
  });

  it("keeps the top rail on score even when the list is sorted by score", () => {
    const [unsorted] = groupByMonth(feed(), {}, false);
    const [sorted] = groupByMonth(feed(), {}, true);

    expect(sorted.top.map((r) => r.name)).toEqual(unsorted.top.map((r) => r.name));
  });

  it("leaves the promoted releases out of the flat list, and only those", () => {
    const [augustGroup] = groupByMonth(feed(), {}, false);

    // The month itself still holds all three — the count and "Mark heard" read it.
    expect(augustGroup.releases).toHaveLength(3);
    expect(augustGroup.rest.map((r) => r.name)).toEqual(["Aug unrated"]);
  });

  it("sorts inside the month only, so the months stay chronological", () => {
    const groups = groupByMonth(feed(), {}, true);

    expect(groups.map((group) => group.label)).toEqual(["August 2026", "July 2026"]);
    // Unrated sinks below the rated ones rather than being dropped.
    expect(groups[0].releases.map((r) => r.name)).toEqual(["Aug high", "Aug low", "Aug unrated"]);
  });
});

describe("pruneChecks", () => {
  it("keeps recent ticks and drops the ones past the retention window", () => {
    const now = Date.UTC(2026, 8, 3);
    const day = 24 * 60 * 60 * 1000;

    expect(
      pruneChecks({ fresh: now - day, old: now - 91 * day, yesterday: now - 89 * day }, now),
    ).toEqual({ fresh: now - day, yesterday: now - 89 * day });
  });
});

describe("matchesRating", () => {
  it("keeps a score inside the range, at either end", () => {
    expect(matchesRating(release({ rating: 70 }), false, [70, 90])).toBe(true);
    expect(matchesRating(release({ rating: 90 }), false, [70, 90])).toBe(true);
  });

  it("drops a score outside the range", () => {
    expect(matchesRating(release({ rating: 69 }), false, [70, 90])).toBe(false);
    expect(matchesRating(release({ rating: 91 }), false, [70, 90])).toBe(false);
  });

  /* The gates are independent on purpose: narrowing the range must not delete the
     third of the feed that has no score to compare against it. */
  it("leaves an unrated row to its own switch, whatever the range", () => {
    expect(matchesRating(release({ rating: null }), false, [70, 90])).toBe(true);
    expect(matchesRating(release({ rating: null }), true, [0, 100])).toBe(false);
  });
});
