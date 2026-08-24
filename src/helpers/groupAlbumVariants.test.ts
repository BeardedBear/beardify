import { describe, expect, it } from "vitest";

import type { AlbumSimplified } from "@/@types/Album";

import { getDisplayName, groupAlbumVariants } from "./groupAlbumVariants";

let nextId = 0;
const album = (name: string, releaseDate = "2020-01-01"): AlbumSimplified =>
  ({ id: `id-${nextId++}`, name, release_date: releaseDate }) as unknown as AlbumSimplified;

/*
 * A discography is full of the same record four times over — deluxe, remaster,
 * anniversary, explicit. Collapsing them into one entry with its variants is
 * what makes the artist page readable; getting it wrong either buries the
 * original under reissues or splits a record in two.
 */
describe("getDisplayName", () => {
  it("strips the usual reissue suffixes", () => {
    expect(getDisplayName("OK Computer (Deluxe Edition)")).toBe("OK Computer");
    expect(getDisplayName("Nevermind (Remastered)")).toBe("Nevermind");
    expect(getDisplayName("The Wall - Deluxe Edition")).toBe("The Wall");
    expect(getDisplayName("Abbey Road (Super Deluxe Edition)")).not.toContain("Deluxe");
  });

  it("leaves a title that has no suffix untouched", () => {
    expect(getDisplayName("Kid A")).toBe("Kid A");
    expect(getDisplayName("In Rainbows")).toBe("In Rainbows");
  });

  it("keeps the original when stripping would empty the title", () => {
    // A record actually called "Live" must not become an empty string.
    expect(getDisplayName("Live")).toBe("Live");
  });

  it("trims incidental whitespace", () => {
    expect(getDisplayName("  Kid A  ")).toBe("Kid A");
  });
});

describe("groupAlbumVariants", () => {
  it("leaves a lone album on its own with no variants", () => {
    const groups = groupAlbumVariants([album("Kid A")]);
    expect(groups).toHaveLength(1);
    expect(groups[0].variants).toEqual([]);
  });

  it("collapses reissues onto one entry", () => {
    const groups = groupAlbumVariants([
      album("OK Computer", "1997-05-21"),
      album("OK Computer (Deluxe Edition)", "2009-01-01"),
      album("OK Computer (Remastered)", "2016-01-01"),
    ]);

    expect(groups).toHaveLength(1);
    expect(groups[0].variants).toHaveLength(2);
  });

  it("prefers the plain edition as the one on display", () => {
    const groups = groupAlbumVariants([
      album("OK Computer (Deluxe Edition)", "2009-01-01"),
      album("OK Computer", "1997-05-21"),
    ]);

    // Even though the deluxe came first in the list, the original is the record.
    expect(groups[0].baseAlbum.name).toBe("OK Computer");
  });

  it("keeps distinct albums apart", () => {
    const groups = groupAlbumVariants([album("Kid A"), album("Amnesiac"), album("In Rainbows")]);
    expect(groups).toHaveLength(3);
    expect(groups.every((group) => group.variants.length === 0)).toBe(true);
  });

  it("keeps the discography in its original order", () => {
    const groups = groupAlbumVariants([album("The Bends"), album("OK Computer"), album("Kid A")]);
    expect(groups.map((group) => group.baseAlbum.name)).toEqual(["The Bends", "OK Computer", "Kid A"]);
  });

  it("handles an empty discography", () => {
    expect(groupAlbumVariants([])).toEqual([]);
  });
});
