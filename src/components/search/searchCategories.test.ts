import { describe, expect, it } from "vitest";

import { SEARCH_CATEGORIES, SearchCategories, searchTypeParam } from "./searchCategories";

function all(value: boolean): SearchCategories {
  return Object.fromEntries(SEARCH_CATEGORIES.map((category) => [category, value])) as SearchCategories;
}

describe("searchTypeParam", () => {
  it("asks Spotify only for the categories that are switched on", () => {
    expect(searchTypeParam(all(true))).toBe("artist,album,track,show");
    expect(searchTypeParam({ ...all(false), albums: true })).toBe("album");
    expect(searchTypeParam({ ...all(false), artists: true, podcasts: true })).toBe("artist,show");
  });

  it("returns nothing to fetch when no networked category is on", () => {
    // Collections are matched locally, so they never put a type in the request:
    // a search for collections alone must not reach Spotify at all.
    expect(searchTypeParam(all(false))).toBe("");
    expect(searchTypeParam({ ...all(false), collections: true })).toBe("");
  });
});
