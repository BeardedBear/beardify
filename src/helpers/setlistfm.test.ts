import { describe, expect, it } from "vitest";

import { distanceKm, isUpcoming, setlistDate } from "@/helpers/setlistfm";

describe("setlistDate", () => {
  it("reorders dd-MM-yyyy into ISO", () => {
    expect(setlistDate("23-08-1964")).toBe("1964-08-23");
  });

  it("leaves unexpected formats untouched", () => {
    expect(setlistDate("1964-08-23")).toBe("1964-08-23");
  });
});

describe("isUpcoming", () => {
  const now = new Date(2026, 9, 29, 23, 30);

  it("treats today and later as upcoming", () => {
    expect(isUpcoming("29-10-2026", now)).toBe(true);
    expect(isUpcoming("05-01-2027", now)).toBe(true);
  });

  it("treats earlier dates as past", () => {
    expect(isUpcoming("28-10-2026", now)).toBe(false);
    expect(isUpcoming("30-11-2025", now)).toBe(false);
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
