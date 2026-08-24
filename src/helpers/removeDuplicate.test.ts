import { describe, expect, it } from "vitest";

import type { AlbumSimplified } from "@/@types/Album";

import { removeDuplicatesAlbums } from "./removeDuplicate";

const album = (id: string, name: string): AlbumSimplified => ({ id, name }) as unknown as AlbumSimplified;

/*
 * A collection is a playlist of tracks, and the album list is derived from them,
 * so the same record arrives repeatedly and under regional spellings. Dedupe is
 * what makes the grid an album list rather than a tracklist.
 */
describe("removeDuplicatesAlbums", () => {
  it("drops a repeated id", () => {
    expect(removeDuplicatesAlbums([album("1", "Kid A"), album("1", "Kid A")])).toHaveLength(1);
  });

  it("treats the same title under two ids as one album", () => {
    // Spotify hands out different ids per market for the same record.
    expect(removeDuplicatesAlbums([album("1", "Kid A"), album("2", "Kid A")])).toHaveLength(1);
  });

  it("ignores case, padding and inner whitespace", () => {
    expect(removeDuplicatesAlbums([album("1", "Kid A"), album("2", "  kid   a  ")])).toHaveLength(1);
  });

  it("ignores diacritics", () => {
    expect(removeDuplicatesAlbums([album("1", "Bohème"), album("2", "Boheme")])).toHaveLength(1);
  });

  it("keeps genuinely different albums", () => {
    expect(removeDuplicatesAlbums([album("1", "Kid A"), album("2", "Amnesiac")])).toHaveLength(2);
  });

  it("keeps the first occurrence and the original order", () => {
    const result = removeDuplicatesAlbums([album("1", "Kid A"), album("2", "Amnesiac"), album("3", "kid a")]);
    expect(result.map((a) => a.id)).toEqual(["1", "2"]);
  });

  it("handles an empty list", () => {
    expect(removeDuplicatesAlbums([])).toEqual([]);
  });
});
