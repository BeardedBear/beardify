import { describe, expect, it } from "vitest";

import { computeAutoScrollDelta } from "./dragAutoScroll";

const SENSITIVITY = 100;
const MAX_SPEED = 20;
const delta = (top: number, bottom: number): null | number =>
  computeAutoScrollDelta(top, bottom, SENSITIVITY, MAX_SPEED);

/*
 * Drives the autoscroll while dragging an album near the edge of a collection.
 * A sign error here scrolls away from the pointer, which makes reordering a long
 * collection impossible rather than merely awkward.
 */
describe("computeAutoScrollDelta", () => {
  it("does nothing in the middle of the container", () => {
    expect(delta(500, 500)).toBeNull();
  });

  it("scrolls up near the top and down near the bottom", () => {
    expect(delta(10, 900)!).toBeLessThan(0);
    expect(delta(900, 10)!).toBeGreaterThan(0);
  });

  it("goes faster the closer the pointer gets to the edge", () => {
    expect(Math.abs(delta(5, 900)!)).toBeGreaterThan(Math.abs(delta(80, 900)!));
  });

  it("never exceeds the speed cap", () => {
    for (let distance = 0; distance < SENSITIVITY; distance++) {
      expect(Math.abs(delta(distance, 900)!)).toBeLessThanOrEqual(MAX_SPEED);
      expect(Math.abs(delta(900, distance)!)).toBeLessThanOrEqual(MAX_SPEED);
    }
  });

  it("stops exactly at the sensitivity boundary", () => {
    expect(delta(SENSITIVITY, 900)).toBeNull();
    expect(delta(SENSITIVITY - 1, 900)).not.toBeNull();
  });

  it("ignores a negative distance — the pointer is outside, not at the edge", () => {
    expect(delta(-10, 900)).toBeNull();
  });

  it("prefers the top when both edges are in range", () => {
    // A container shorter than twice the sensitivity: one direction has to win,
    // and it must be a stable choice rather than a flicker.
    expect(delta(10, 10)!).toBeLessThan(0);
  });
});
