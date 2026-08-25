import { describe, expect, it } from "vitest";

import { timecode, timecodeWithUnits } from "./date";

/*
 * These used to read a duration back through `new Date(ms).getHours()`, which
 * is a *local* clock reading of an epoch offset — so the output depended on the
 * reader's timezone. A 3:59 track came out as "18:03:59" in New York and
 * "8:03:59" in Tokyo, and even in UTC an hour-long album read "4:20" instead of
 * "1:04:20". Only Europe/Paris was correct, which is exactly why nobody here
 * ever saw it. The public web build and every /share link are opened elsewhere.
 */
describe("timecode", () => {
  it("formats a track length", () => {
    expect(timecode(239000)).toBe("3:59");
    expect(timecode(1000)).toBe("0:01");
    expect(timecode(60000)).toBe("1:00");
  });

  it("adds an hours field only when there is one", () => {
    expect(timecode(3599000)).toBe("59:59");
    expect(timecode(3600000)).toBe("1:00:00");
    expect(timecode(3860000)).toBe("1:04:20");
  });

  it("zero-pads minutes and seconds inside an hours reading", () => {
    expect(timecode(3661000)).toBe("1:01:01");
  });

  it("survives a whole-collection duration", () => {
    // Collection headers sum every track; 12h34m56s must not wrap.
    expect(timecode(45296000)).toBe("12:34:56");
  });

  it("returns an empty string for nothing rather than 0:00", () => {
    expect(timecode(0)).toBe("");
    expect(timecode(null)).toBe("");
    expect(timecode(undefined)).toBe("");
  });

  /*
   * The regression guard is the arithmetic itself: the implementation no longer
   * constructs a Date, so there is no local clock left for a timezone to shift.
   * Stubbing TZ here would only prove that a function which never reads it does
   * not read it — the real cross-timezone check was run once, against the old
   * and new code, outside the suite.
   */
  it("agrees with the arithmetic, not with a clock", () => {
    const durationMs = (3 * 3600 + 7 * 60 + 5) * 1000;
    expect(timecode(durationMs)).toBe("3:07:05");
  });
});

describe("timecodeWithUnits", () => {
  it("spells the duration out", () => {
    expect(timecodeWithUnits(3860000)).toBe("1 hour 4 minutes 20 seconds");
  });

  it("drops the fields that are zero", () => {
    expect(timecodeWithUnits(239000)).toBe("3 minutes 59 seconds");
  });
});
