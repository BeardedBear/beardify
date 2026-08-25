import { describe, expect, it } from "vitest";

import { findMove } from "./arrayDiff";

const list = (ids: string): { id: string }[] => [...ids].map((id) => ({ id }));

/**
 * Replays what Spotify does with the indices we hand it, so the test asserts on
 * the order the server ends up with rather than on the shape of the return
 * value. The index maths lives in PlaylistStore.updateCollectionPosition.
 */
function applyOnServer(previous: { id: string }[], move: { newIndex: number; oldIndex: number } | null): string {
  if (!move) return previous.map((item) => item.id).join("");
  const items = [...previous];
  const [moved] = items.splice(move.oldIndex, 1);
  const insertBefore = move.oldIndex < move.newIndex ? move.newIndex + 1 : move.newIndex;
  items.splice(insertBefore > move.oldIndex ? insertBefore - 1 : insertBefore, 0, moved);
  return items.map((item) => item.id).join("");
}

describe("findMove", () => {
  /*
   * The regression this file was created for: the old implementation read the
   * item sitting at the first divergence, which is only the moved one when it
   * travelled *up*. Dragging an album down reported its neighbour instead, so
   * reordering a collection saved a different, smaller move than the one
   * performed — invisible until the next reload, because the view was showing
   * local state.
   */
  const ids = "ABCDEFG";
  for (let from = 0; from < ids.length; from++) {
    for (let to = 0; to < ids.length; to++) {
      if (from === to) continue;
      it(`survives ${ids[from]} moving from ${from} to ${to}`, () => {
        const previous = list(ids);
        const reordered = [...ids];
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        expect(applyOnServer(previous, findMove(previous, list(reordered.join(""))))).toBe(reordered.join(""));
      });
    }
  }

  it("returns null when nothing moved", () => {
    expect(findMove(list("ABC"), list("ABC"))).toBeNull();
  });

  it("returns null rather than guess when more than one item moved", () => {
    // No single-move API can express this, so sending anything would be wrong.
    expect(findMove(list("ABCD"), list("BADC"))).toBeNull();
  });

  it("returns null when the lists are not the same length", () => {
    expect(findMove(list("ABC"), list("AB"))).toBeNull();
  });
});
