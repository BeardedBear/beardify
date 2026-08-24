import { describe, expect, it } from "vitest";

import { coverUrl } from "./cover";

const FALLBACK = "/img/default.png";
const three = [{ url: "L" }, { url: "M" }, { url: "S" }];

/*
 * Spotify does not always return three renditions, and the app used to index
 * `images[1]` and `images[2]` straight — the same "Cannot read properties of
 * undefined (reading 'url')" crash turned up in the queue, the episode player
 * and the user page before the guard was centralised here.
 */
describe("coverUrl", () => {
  it("picks the requested rendition when it exists", () => {
    expect(coverUrl(three, "large")).toBe("L");
    expect(coverUrl(three, "medium")).toBe("M");
    expect(coverUrl(three, "small")).toBe("S");
  });

  it("falls back upwards to a larger rendition rather than failing", () => {
    // Bigger and present beats correct and absent.
    expect(coverUrl([{ url: "L" }, { url: "M" }], "small")).toBe("M");
    expect(coverUrl([{ url: "L" }], "small")).toBe("L");
    expect(coverUrl([{ url: "L" }], "medium")).toBe("L");
  });

  it("returns the placeholder when there is nothing to show", () => {
    expect(coverUrl(null, "medium")).toBe(FALLBACK);
    expect(coverUrl(undefined, "small")).toBe(FALLBACK);
    expect(coverUrl([], "large")).toBe(FALLBACK);
  });

  it("defaults to the medium rendition", () => {
    expect(coverUrl(three)).toBe("M");
  });

  it("never throws on a sparse array", () => {
    // eslint-disable-next-line no-sparse-arrays
    expect(() => coverUrl([, , { url: "S" }] as { url: string }[], "small")).not.toThrow();
  });
});
