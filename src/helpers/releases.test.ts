import { describe, expect, it } from "vitest";

import { Release } from "@/@types/Releases";
import {
  genreTerms,
  groupByMonth,
  groupGenres,
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
    // Order-free on purpose: a tag belongs to every family that probes it, and which
    // one is listed first is not something any reader of `terms` is entitled to.
    expect(genreTerms(["rap metal"]).sort()).toEqual(["hip hop", "metal", "rap metal"]);
  });

  it("leaves a genre outside the families alone", () => {
    expect(genreTerms(["klezmer"])).toEqual(["klezmer"]);
  });

  /* Spotify answers in the account's language, so the same music arrives spelled twice. */
  it("folds a localized spelling onto the same family as its English one", () => {
    expect(genreTerms(["musique expérimentale"])).toContain("experimental");
    expect(genreTerms(["experimental hip hop"])).toContain("experimental");
    expect(genreTerms(["néo-classique"])).toContain("classical");
  });

  it("pulls a micro-genre that never names its family into it", () => {
    expect(genreTerms(["shoegaze"])).toContain("rock");
    expect(genreTerms(["deathcore"])).toContain("metal");
    expect(genreTerms(["boom bap"])).toContain("hip hop");
  });
});

describe("groupGenres", () => {
  function facets(): { count: number; name: string }[] {
    return [
      { count: 40, name: "metal" },
      { count: 20, name: "rock" },
      { count: 12, name: "black metal" },
      { count: 8, name: "folk metal" },
      { count: 5, name: "klezmer" },
    ];
  }

  it("files micro-genres under their family and leaves them out of the top level", () => {
    const tree = groupGenres(facets());

    // klezmer names no family, so it keeps a row of its own.
    expect(tree.map((group) => group.name)).toEqual(["metal", "rock", "klezmer"]);
    expect(tree[0].children.map((child) => child.name)).toEqual(["black metal", "folk metal"]);
  });

  /* The probes are what fold a tag that never names its family into it. */
  it("files a micro-genre under a family its name does not contain", () => {
    const tree = groupGenres([
      { count: 20, name: "rock" },
      { count: 5, name: "shoegaze" },
    ]);

    expect(tree.map((group) => group.name)).toEqual(["rock"]);
    expect(tree[0].children.map((child) => child.name)).toEqual(["shoegaze"]);
  });

  it("lists a genre naming two families under both", () => {
    const tree = groupGenres([...facets(), { count: 3, name: "folk" }]);
    const folk = tree.find((group) => group.name === "folk");

    expect(folk?.children.map((child) => child.name)).toEqual(["folk metal"]);
  });

  /* Frequency order is stable across ticks, so the list must never re-rank itself. */
  it("keeps the order it was given", () => {
    const reversed = [...facets()].reverse();

    expect(groupGenres(reversed).map((group) => group.name)).toEqual(["klezmer", "rock", "metal"]);
  });

  it("files a micro-genre listed ahead of its own family", () => {
    const tree = groupGenres([
      { count: 12, name: "black metal" },
      { count: 12, name: "metal" },
    ]);

    expect(tree.map((group) => group.name)).toEqual(["metal"]);
    expect(tree[0].children.map((child) => child.name)).toEqual(["black metal"]);
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
    const groups = groupByMonth(feed(), {}, "rating");

    expect(groups.map((group) => group.label)).toEqual(["August 2026", "July 2026"]);
    expect(groups[0].releases).toHaveLength(3);
  });

  it("counts the releases still to hear, and only those", () => {
    expect(groupByMonth(feed(), { a: Date.now(), b: Date.now() }, "rating")[0].unheard).toBe(1);
  });

  it("restates the rating order rather than trusting the feed to arrive in it", () => {
    // Handed in deliberately backwards: the cache and the network answer merge in
    // either order, so the sort the control names has to be the one it performs.
    const shuffled = [feed()[2], feed()[1], feed()[0], feed()[3]];
    const [augustGroup] = groupByMonth(shuffled, {}, "rating");

    // Unrated sinks below the rated ones rather than being dropped.
    expect(augustGroup.releases.map((r) => r.name)).toEqual(["Aug high", "Aug low", "Aug unrated"]);
  });

  it("orders a month by artist, then by album, when asked to", () => {
    const byArtist = [
      release({ artistName: "Zu", key: "z", name: "Carboniferous", rating: 1, timestamp: august }),
      release({ artistName: "Alcest", key: "y", name: "Shelter", rating: 2, timestamp: august }),
      release({ artistName: "Alcest", key: "x", name: "Kodama", rating: 3, timestamp: august }),
    ];
    const [augustGroup] = groupByMonth(byArtist, {}, "artist");

    expect(augustGroup.releases.map((r) => r.name)).toEqual(["Kodama", "Shelter", "Carboniferous"]);
  });

  it("sorts inside the month only, so the months stay chronological", () => {
    const groups = groupByMonth(feed(), {}, "artist");

    expect(groups.map((group) => group.label)).toEqual(["August 2026", "July 2026"]);
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
