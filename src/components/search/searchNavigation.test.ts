import { describe, expect, it } from "vitest";

import { nextPosition } from "./searchNavigation";

/*
 * Arrow navigation across four columns of different lengths, where any of them
 * can be empty. The failure modes are all off-by-one or a dead stop on an empty
 * column, and none of them are visible in a screenshot.
 */
describe("nextPosition", () => {
  const columns = [3, 5, 2]; // artists, albums, tail

  it("enters the results from the field on Down only", () => {
    expect(nextPosition(columns, null, "ArrowDown")).toEqual({ column: 0, index: 0 });
    expect(nextPosition(columns, null, "ArrowUp")).toBeNull();
    expect(nextPosition(columns, null, "ArrowLeft")).toBeNull();
    expect(nextPosition(columns, null, "ArrowRight")).toBeNull();
  });

  it("moves down a column and stops at the last row", () => {
    expect(nextPosition(columns, { column: 0, index: 0 }, "ArrowDown")).toEqual({ column: 0, index: 1 });
    expect(nextPosition(columns, { column: 0, index: 2 }, "ArrowDown")).toEqual({ column: 0, index: 2 });
  });

  it("returns to the field when arrowing up off the first row", () => {
    // Where someone correcting their query expects to end up.
    expect(nextPosition(columns, { column: 1, index: 0 }, "ArrowUp")).toBeNull();
    expect(nextPosition(columns, { column: 1, index: 1 }, "ArrowUp")).toEqual({ column: 1, index: 0 });
  });

  it("keeps the row when stepping sideways", () => {
    expect(nextPosition(columns, { column: 0, index: 2 }, "ArrowRight")).toEqual({ column: 1, index: 2 });
    expect(nextPosition(columns, { column: 1, index: 1 }, "ArrowLeft")).toEqual({ column: 0, index: 1 });
  });

  it("clamps the row when the next column is shorter", () => {
    expect(nextPosition(columns, { column: 1, index: 4 }, "ArrowRight")).toEqual({ column: 2, index: 1 });
  });

  it("stays put at the outer edges", () => {
    expect(nextPosition(columns, { column: 0, index: 1 }, "ArrowLeft")).toEqual({ column: 0, index: 1 });
    expect(nextPosition(columns, { column: 2, index: 1 }, "ArrowRight")).toEqual({ column: 2, index: 1 });
  });

  it("skips empty columns instead of stopping on them", () => {
    // A search with no albums must not leave a dead stop between the two others.
    const gapped = [3, 0, 2];
    expect(nextPosition(gapped, { column: 0, index: 1 }, "ArrowRight")).toEqual({ column: 2, index: 1 });
    expect(nextPosition(gapped, { column: 2, index: 0 }, "ArrowLeft")).toEqual({ column: 0, index: 0 });
  });

  it("enters at the first column that actually has results", () => {
    expect(nextPosition([0, 0, 4], null, "ArrowDown")).toEqual({ column: 2, index: 0 });
  });

  it("returns null when there is nothing to focus", () => {
    expect(nextPosition([0, 0, 0], null, "ArrowDown")).toBeNull();
    expect(nextPosition([], null, "ArrowDown")).toBeNull();
    expect(nextPosition([0, 0, 0], { column: 0, index: 0 }, "ArrowDown")).toBeNull();
  });

  it("recovers when the column it was on has emptied under it", () => {
    // Results are replaced while the user is arrowing; the old position can
    // point at a column that no longer has anything in it.
    expect(nextPosition([2, 0, 1], { column: 1, index: 3 }, "ArrowDown")).toEqual({ column: 0, index: 0 });
  });
});
