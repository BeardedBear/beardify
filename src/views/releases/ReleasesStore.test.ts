import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";

import { Release } from "@/@types/Releases";
import { useReleases } from "@/views/releases/ReleasesStore";

function release(overrides: Partial<Release>): Release {
  return {
    artistName: "Gojira",
    genres: [],
    id: "id1",
    images: [],
    key: "gojira|fortitude",
    name: "Fortitude",
    rating: null,
    terms: [],
    timestamp: 0,
    ...overrides,
  };
}

describe("enrichGenres", () => {
  beforeEach(() => setActivePinia(createPinia()));

  it("fills a bare row and rebuilds its filter terms", () => {
    const store = useReleases();
    store.releases = [release({})];

    store.enrichGenres("gojira|fortitude", ["progressive metal"]);

    expect(store.releases[0].genres).toEqual(["progressive metal"]);
    // The family is what the sidebar lists, so the chip has to be reachable through it.
    expect(store.releases[0].terms).toContain("metal");
  });

  it("leaves a row the scrapers already classified alone", () => {
    const store = useReleases();
    store.releases = [release({ genres: ["death metal"], terms: ["death metal", "metal"] })];

    store.enrichGenres("gojira|fortitude", ["progressive metal"]);

    expect(store.releases[0].genres).toEqual(["death metal"]);
  });

  it("ignores an artist Spotify files under nothing", () => {
    const store = useReleases();
    store.releases = [release({})];

    store.enrichGenres("gojira|fortitude", []);

    expect(store.releases[0].genres).toEqual([]);
  });
});
