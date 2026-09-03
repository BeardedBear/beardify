import { describe, expect, it } from "vitest";

import { Album } from "@/@types/Album";

import { matchReleaseAlbum, normalizeTitle } from "./releaseAlbum";

function album(name: string, ...artists: string[]): Album {
  return { artists: artists.map((artistName) => ({ name: artistName })), name, uri: `spotify:album:${name}` } as Album;
}

describe("normalizeTitle", () => {
  it("strips diacritics, case and punctuation", () => {
    expect(normalizeTitle("Mörk Gryning")).toBe("mork gryning");
    expect(normalizeTitle("Vol. 2")).toBe(normalizeTitle("Vol 2"));
    expect(normalizeTitle("  A—B  ")).toBe("a b");
  });
});

describe("matchReleaseAlbum", () => {
  const release = { artistName: "Opeth", name: "Damnation" };

  it("matches an exact title by the right artist", () => {
    const hit = album("Damnation", "Opeth");
    expect(matchReleaseAlbum(release, [album("Deliverance", "Opeth"), hit])).toBe(hit);
  });

  it("matches across punctuation and accents", () => {
    const hit = album("Blackwater Park!", "Öpeth");
    expect(matchReleaseAlbum({ artistName: "Opeth", name: "Blackwater Park" }, [hit])).toBe(hit);
  });

  it("refuses the same title by another artist", () => {
    expect(matchReleaseAlbum(release, [album("Damnation", "Symphony X")])).toBeUndefined();
  });

  it("falls back to an edition that extends the title", () => {
    const hit = album("Damnation (Deluxe Edition)", "Opeth");
    expect(matchReleaseAlbum(release, [hit])).toBe(hit);
  });

  it("refuses a title that merely starts the same way", () => {
    expect(matchReleaseAlbum({ artistName: "Opeth", name: "Damn" }, [album("Damnation", "Opeth")])).toBeUndefined();
  });

  it("prefers the exact title over an extended one", () => {
    const exact = album("Damnation", "Opeth");
    expect(matchReleaseAlbum(release, [album("Damnation (Remastered)", "Opeth"), exact])).toBe(exact);
  });

  it("returns undefined when nothing matches", () => {
    expect(matchReleaseAlbum(release, [])).toBeUndefined();
  });
});
