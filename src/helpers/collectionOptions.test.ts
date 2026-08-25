import { describe, expect, it } from "vitest";

import {
  buildCollectionDescription,
  groupByTierList,
  isDescriptionCollection,
  parseCollectionRankingMode,
  sanitizeTierLabel,
  splitTopTiers,
  stripCollectionTags,
} from "./collectionOptions";

/*
 * The `#Collection` convention is the product's whole reason to exist: the
 * Spotify API has no album-playlists, so a collection is a plain playlist whose
 * description carries tags. Those tags round-trip through Spotify on every
 * save, and a parser that loses one silently loses a hand-curated ranking. That
 * is what these cover — the round trip, not the formatting.
 */
describe("#Collection tags", () => {
  it("recognises a collection from its description", () => {
    expect(isDescriptionCollection("#Collection my albums")).toBe(true);
    expect(isDescriptionCollection("just a playlist")).toBe(false);
  });

  it("round-trips an off-mode collection", () => {
    const description = buildCollectionDescription("Best of 2026", true, { type: "off" });
    expect(isDescriptionCollection(description)).toBe(true);
    expect(stripCollectionTags(description)).toBe("Best of 2026");
    expect(parseCollectionRankingMode(description)).toEqual({ type: "off" });
  });

  it("round-trips a Top collection without touching the user's own text", () => {
    const description = buildCollectionDescription("Best of 2026", true, { tiers: [3, 7, 20], type: "top" });
    expect(parseCollectionRankingMode(description)).toEqual({ tiers: [3, 7, 20], type: "top" });
    expect(stripCollectionTags(description)).toBe("Best of 2026");
  });

  it("round-trips a tier list, labels included", () => {
    const tiers = [{ label: "S", size: 2 }, { label: "A", size: 3 }];
    const description = buildCollectionDescription("", true, { tiers, type: "tierlist" });
    expect(parseCollectionRankingMode(description)).toEqual({ tiers, type: "tierlist" });
  });

  it("keeps Top and tier list mutually exclusive", () => {
    // Only one mode tag is ever written, and the parser must not blend them.
    const top = buildCollectionDescription("", true, { tiers: [1, 2, 3], type: "top" });
    expect(parseCollectionRankingMode(top).type).toBe("top");

    const tier = buildCollectionDescription("", true, { tiers: [{ label: "S", size: 1 }], type: "tierlist" });
    expect(parseCollectionRankingMode(tier).type).toBe("tierlist");
  });

  it("strips characters that would read back as a new tag", () => {
    // A label containing `#`, `=` or `,` would be re-parsed as tag syntax.
    expect(sanitizeTierLabel("Top #1, best=ever")).toBe("Top_1_best_ever");
    expect(sanitizeTierLabel("  padded  ")).toBe("padded");
  });

  it("survives a label full of tag syntax without corrupting the description", () => {
    const tiers = [{ label: sanitizeTierLabel("S#=,tier"), size: 1 }];
    const description = buildCollectionDescription("note", true, { tiers, type: "tierlist" });
    expect(parseCollectionRankingMode(description)).toEqual({ tiers, type: "tierlist" });
    expect(stripCollectionTags(description)).toBe("note");
  });
});

describe("tier slicing", () => {
  const items = [1, 2, 3, 4, 5, 6, 7];

  it("puts whatever is left over in the trailing bucket", () => {
    expect(groupByTierList(items, [{ label: "S", size: 2 }, { label: "A", size: 3 }]))
      .toEqual([[1, 2], [3, 4, 5], [6, 7]]);
  });

  it("keeps the leftover bucket even when every item is placed", () => {
    // groupByTierList always returns one more group than the tier list.
    expect(groupByTierList([1, 2], [{ label: "S", size: 2 }])).toEqual([[1, 2], []]);
  });

  /*
   * The behaviour the maintainer chose: tier structure belongs to the
   * collection, not to the album set. Removing an album leaves the sizes alone
   * and lets the ones below shift up a place, rather than eroding a hand-built
   * ranking one mis-click at a time.
   */
  it("shifts albums up a tier when one is removed, sizes untouched", () => {
    const tiers = [{ label: "S", size: 2 }, { label: "A", size: 2 }];
    expect(groupByTierList([1, 2, 3, 4, 5], tiers)).toEqual([[1, 2], [3, 4], [5]]);
    expect(groupByTierList([1, 3, 4, 5], tiers)).toEqual([[1, 3], [4, 5], []]);
  });

  it("splits the three Top buckets by count", () => {
    expect(splitTopTiers(items, [1, 2, 4])).toEqual([[1], [2, 3], [4, 5, 6, 7]]);
  });

  it("does not throw when there are fewer items than the Top tiers claim", () => {
    expect(splitTopTiers([1, 2], [3, 7, 20])).toEqual([[1, 2], [], []]);
  });
});
