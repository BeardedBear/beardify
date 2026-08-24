import { describe, expect, it } from "vitest";

import { clamp, DEFAULT_GAMMA, sliderPercentToVolume, volumeToSliderPercent } from "./volume";

/*
 * The slider is not linear: a gamma curve gives the low end — where every
 * listening decision actually happens — most of the travel. The pair has to
 * round-trip, because DeviceVolume stores the slider position and reads the
 * device volume back from Spotify.
 */
describe("volume curve", () => {
  it("pins both ends exactly", () => {
    expect(sliderPercentToVolume(0)).toBe(0);
    expect(sliderPercentToVolume(100)).toBe(100);
    expect(volumeToSliderPercent(0)).toBe(0);
    expect(volumeToSliderPercent(100)).toBe(100);
  });

  it("gives the quiet end more of the travel", () => {
    // Half-way up the slider must be well below half volume, or the usable
    // range collapses into the bottom centimetre.
    expect(sliderPercentToVolume(50)).toBeLessThan(35);
    expect(volumeToSliderPercent(50)).toBeGreaterThan(65);
  });

  it("round-trips within a rounding step above the dead zone", () => {
    for (let percent = 6; percent <= 100; percent++) {
      expect(Math.abs(volumeToSliderPercent(sliderPercentToVolume(percent)) - percent)).toBeLessThanOrEqual(2);
    }
  });

  /*
   * Documenting real behaviour rather than asserting a wish: the gamma curve
   * plus integer rounding make the bottom 0–5% of the slider land on volume 0,
   * so a round trip from there cannot come back. It is silence either way, so
   * nothing is lost — but the next person to widen the dead zone by raising
   * gamma should have to change this line on purpose.
   */
  it("keeps the silent dead zone to the bottom 5% of the slider", () => {
    for (let percent = 0; percent <= 5; percent++) expect(sliderPercentToVolume(percent)).toBe(0);
    expect(sliderPercentToVolume(6)).toBeGreaterThan(0);
  });

  it("never leaves 0–100, whatever it is handed", () => {
    for (const value of [-50, -1, 101, 1000, Number.MAX_SAFE_INTEGER]) {
      expect(sliderPercentToVolume(value)).toBeGreaterThanOrEqual(0);
      expect(sliderPercentToVolume(value)).toBeLessThanOrEqual(100);
      expect(volumeToSliderPercent(value)).toBeGreaterThanOrEqual(0);
      expect(volumeToSliderPercent(value)).toBeLessThanOrEqual(100);
    }
  });

  it("is monotonic — raising the slider never lowers the volume", () => {
    let previous = -1;
    for (let percent = 0; percent <= 100; percent++) {
      const volume = sliderPercentToVolume(percent);
      expect(volume).toBeGreaterThanOrEqual(previous);
      previous = volume;
    }
  });

  it("collapses to a straight line at gamma 1", () => {
    expect(sliderPercentToVolume(42, 1)).toBe(42);
    expect(volumeToSliderPercent(42, 1)).toBe(42);
    expect(DEFAULT_GAMMA).toBeGreaterThan(1);
  });
});

describe("clamp", () => {
  it("holds the bounds", () => {
    expect(clamp(-5)).toBe(0);
    expect(clamp(150)).toBe(100);
    expect(clamp(42)).toBe(42);
  });

  it("takes custom bounds", () => {
    expect(clamp(5, 10, 20)).toBe(10);
    expect(clamp(50, 10, 20)).toBe(20);
  });
});
