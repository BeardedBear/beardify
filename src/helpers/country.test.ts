import { describe, expect, it } from "vitest";

import { countries } from "@/helpers/country";

describe("countries", () => {
  const list = countries();

  it("lists real countries", () => {
    expect(list).toContainEqual({ code: "FR", name: "France" });
    expect(list.length).toBeGreaterThan(240);
  });

  it("drops groupings and historic codes", () => {
    expect(list.map((country) => country.code)).not.toContain("EU");
    expect(list.map((country) => country.code)).not.toContain("SU");
  });
});
