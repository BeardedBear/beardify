import { describe, expect, it } from "vitest";

import { Release } from "@/@types/Releases";
import {
  genreTerms,
  groupByMonth,
  mergeReleases,
  monthLabel,
  normalizeTag,
  releaseKey,
  releaseTimestamp,
  suggestGenres,
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
    rating: 4.2,
    source: "sputnik",
    source_id: "551990",
  };

  it("keeps the month and drops the stored day, which the listing never stated", () => {
    expect(toReleaseFromFeed(row).timestamp).toBe(releaseTimestamp("2026-08"));
  });

  it("keys identically to the same record from another source", () => {
    expect(toReleaseFromFeed(row).key).toBe(release({ artistName: "Mastodon", name: "Marrow Deep" }).key);
  });

  it("carries the score and the genres over", () => {
    expect(toReleaseFromFeed(row).rating).toBe(4.2);
    expect(toReleaseFromFeed(row).genres).toEqual(["metal", "sludge metal"]);
  });

  it("derives the filter terms, without which the row is invisible to every sidebar filter", () => {
    expect(toReleaseFromFeed(row).terms).toEqual(["metal", "sludge metal"]);
  });

  it("namespaces the id by source, since two sites can number an album the same", () => {
    expect(toReleaseFromFeed(row).id).toBe("sputnik-551990");
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

  it("sorts inside the month only, so the months stay chronological", () => {
    const groups = groupByMonth(feed(), {}, true);

    expect(groups.map((group) => group.label)).toEqual(["August 2026", "July 2026"]);
    // Unrated sinks below the rated ones rather than being dropped.
    expect(groups[0].releases.map((r) => r.name)).toEqual(["Aug high", "Aug low", "Aug unrated"]);
  });
});
