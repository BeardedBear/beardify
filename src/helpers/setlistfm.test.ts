import { describe, expect, it } from "vitest";

import { distanceKm, setlistDate } from "@/helpers/setlistfm";

describe("setlistDate", () => {
  it("reorders dd-MM-yyyy into ISO", () => {
    expect(setlistDate("23-08-1964")).toBe("1964-08-23");
  });

  it("leaves unexpected formats untouched", () => {
    expect(setlistDate("1964-08-23")).toBe("1964-08-23");
  });
});

describe("distanceKm", () => {
  it("measures Paris to Lyon at about 392 km", () => {
    expect(distanceKm({ lat: 48.8566, lon: 2.3522 }, { lat: 45.764, lon: 4.8357 })).toBeCloseTo(392, -1);
  });

  it("is zero for the same point", () => {
    expect(distanceKm({ lat: 10, lon: 10 }, { lat: 10, lon: 10 })).toBe(0);
  });
});
