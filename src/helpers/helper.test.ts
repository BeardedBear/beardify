import { describe, expect, it } from "vitest";

import type { Track } from "@/@types/Track";

import { isCurrentTrack, normalizeString, transformUriToid } from "./helper";

// isCurrentTrack only ever reads `name` and `artists[0].name`, so a full Spotify
// Track would be noise here.
const track = (name: string, artist: string): Track => ({ artists: [{ name: artist }], name }) as unknown as Track;

describe("transformUriToid", () => {
  it("takes the id off a Spotify URI", () => {
    expect(transformUriToid("spotify:album:4aawyAB9vmqN3uQ7FjRGTy")).toBe("4aawyAB9vmqN3uQ7FjRGTy");
    expect(transformUriToid("spotify:track:11dFghVXANMlKmJXsNCbNl")).toBe("11dFghVXANMlKmJXsNCbNl");
  });

  it("returns an empty string rather than throwing on nothing", () => {
    // Called straight from templates on optional chains, so undefined is normal.
    expect(transformUriToid(undefined)).toBe("");
    expect(transformUriToid("")).toBe("");
  });

  it("passes a bare id through untouched", () => {
    expect(transformUriToid("4aawyAB9vmqN3uQ7FjRGTy")).toBe("4aawyAB9vmqN3uQ7FjRGTy");
  });
});

describe("normalizeString", () => {
  it("lowercases, drops punctuation and collapses whitespace", () => {
    expect(normalizeString("  The   Dark Side, of the Moon!  ")).toBe("the dark side of the moon");
  });

  it("makes punctuation-only differences compare equal", () => {
    // What it exists for: matching a Last.fm title against a Spotify one.
    expect(normalizeString("Sgt. Pepper's")).toBe(normalizeString("Sgt Peppers"));
  });
});

describe("isCurrentTrack", () => {
  it("matches on title and lead artist", () => {
    expect(isCurrentTrack(track("Kid A", "Radiohead"), track("Kid A", "Radiohead"))).toBe(true);
  });

  it("separates a same-titled track by a different artist", () => {
    expect(isCurrentTrack(track("Alive", "Pearl Jam"), track("Alive", "Empire of the Sun"))).toBe(false);
  });

  it("is false when either side is missing", () => {
    expect(isCurrentTrack(undefined, track("Kid A", "Radiohead"))).toBe(false);
    expect(isCurrentTrack(track("Kid A", "Radiohead"), undefined)).toBe(false);
    expect(isCurrentTrack(undefined, undefined)).toBe(false);
  });
});
