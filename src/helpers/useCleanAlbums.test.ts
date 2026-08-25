import { describe, expect, it } from "vitest";

import type { AlbumSimplified } from "@/@types/Album";

import {
  isAlbum,
  isCompilation,
  isEP,
  isSingle,
  useCheckCompilationAlbum,
  useCheckLiveAlbum,
} from "./useCleanAlbums";

const album = (type: string, tracks = 10): AlbumSimplified =>
  ({ album_type: type, total_tracks: tracks }) as unknown as AlbumSimplified;

/*
 * This classification decides which of the five discography blocks an album
 * lands in on the artist page — the surface a collector actually navigates by.
 * Spotify only reports "album" / "single" / "compilation", so EP versus single
 * is Beardify's own call, made on the track count.
 */
describe("album type", () => {
  it("accepts either casing of album_type", () => {
    // Spotify returns "ALBUM" on some endpoints and "album" on others.
    expect(isAlbum(album("album"))).toBe(true);
    expect(isAlbum(album("ALBUM"))).toBe(true);
    expect(isAlbum(album("single", 1))).toBe(false);
  });

  it("splits single from EP on the track count", () => {
    expect(isSingle(album("single", 1))).toBe(true);
    expect(isSingle(album("single", 2))).toBe(true);
    expect(isSingle(album("single", 3))).toBe(false);

    expect(isEP(album("single", 3))).toBe(true);
    expect(isEP(album("single", 8))).toBe(true);
    expect(isEP(album("single", 2))).toBe(false);
  });

  it("never lets one release be both a single and an EP", () => {
    for (let tracks = 0; tracks <= 12; tracks++) {
      const release = album("single", tracks);
      expect(isSingle(release) && isEP(release)).toBe(false);
    }
  });

  it("recognises a compilation", () => {
    expect(isCompilation(album("compilation"))).toBe(true);
    expect(isCompilation(album("album"))).toBe(false);
  });
});

describe("compilation detection by title", () => {
  it("catches the usual repackaging wording", () => {
    for (const name of ["Greatest Hits", "The Very Best Of Queen", "Anthology", "B-Sides", "The Essential Bowie"]) {
      expect(useCheckCompilationAlbum(name)).toBe(true);
    }
  });

  it("is case-insensitive and tolerates padding", () => {
    expect(useCheckCompilationAlbum("  GREATEST HITS  ")).toBe(true);
  });

  it("leaves an ordinary studio album alone", () => {
    for (const name of ["Kid A", "OK Computer", "In Rainbows", "The Bends"]) {
      expect(useCheckCompilationAlbum(name)).toBe(false);
    }
  });
});

describe("live detection by title", () => {
  it("does not flag a studio album", () => {
    expect(useCheckLiveAlbum("Kid A")).toBe(false);
  });

  it("flags an obvious live record", () => {
    expect(useCheckLiveAlbum("Live at Wembley")).toBe(true);
  });
});
