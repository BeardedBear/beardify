import { describe, expect, it } from "vitest";

import { findMove, planDuplicateCleanup, planRangeMove } from "./arrayDiff";

const list = (ids: string): { id: string }[] => [...ids].map((id) => ({ id }));

/**
 * Replays what Spotify does with the indices findMove hands back, so the test
 * asserts on the order the server ends up with rather than on the shape of
 * the return value. PlaylistStore.updateCollectionPosition resolves these
 * indices to album ids against the raw track list before calling the API;
 * this helper only exercises findMove's own index math.
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

/** Spotify's DELETE by URI drops every occurrence; each POST then inserts at `position`. */
function applyCleanupOnServer(
  items: string[],
  plan: { inserts: { position: number; run: string[] }[]; removed: string[] },
): string[] {
  const removed = new Set(plan.removed);
  const server = items.filter((t) => !removed.has(t));
  for (const { position, run } of plan.inserts) server.splice(position, 0, ...run);
  return server;
}

/** Spotify's documented reorder semantics, written independently of planRangeMove. */
function spotifyReorder<T>(
  items: T[],
  body: { insert_before: number; range_length: number; range_start: number },
): T[] {
  const { insert_before: at, range_length: length, range_start: start } = body;
  const run = items.slice(start, start + length);
  if (at < start) {
    return [...items.slice(0, at), ...run, ...items.slice(at, start), ...items.slice(start + length)];
  }
  return [...items.slice(0, start), ...items.slice(start + length, at), ...run, ...items.slice(at)];
}

// "x…" stands for an unavailable entry (`item: null`): no album, but a real server position.
const keyOf = (t: string): null | string => (t[0] === "x" ? null : t[0]);
const albumsOf = (tracks: string[]): string => [...new Set(tracks.map(keyOf).filter(Boolean))].join("");

describe("planRangeMove", () => {
  /*
   * The regression: every drag after the first one resolved its indices
   * against the order from before the previous drag, so the server drifted
   * further from the screen with each move. This replays a chain of drags the
   * way CollectionPage + PlaylistStore do, against a simulated server.
   */
  it("keeps server and screen in sync across a chain of drags", () => {
    // Album letter + track number = URI. B and E have consecutive runs; A, B, C
    // and E also have stray copies further down, B1 even as the very same URI.
    // x1–x3 are unavailable entries the screen never shows but Spotify counts.
    let local = ["x1", "A1", "B1", "B2", "C1", "x2", "D1", "A2", "E1", "E2", "x3", "E3", "B1", "F1", "C1", "G1", "E1"];
    let server = [...local];

    // On load: collapse the strays the way cleanCollectionDuplicates does.
    const cleanup = planDuplicateCleanup(local, keyOf);
    if (cleanup) {
      server = applyCleanupOnServer(server, cleanup);
      local = cleanup.next;
    }
    expect(local).toEqual(server);

    let seed = 7;
    const rand = (n: number): number => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;

    for (let step = 0; step < 200; step++) {
      const albums = [...albumsOf(local)];
      const from = rand(albums.length);
      const to = rand(albums.length);
      const [moved] = albums.splice(from, 1);
      albums.splice(to, 0, moved);
      const before = albums[to + 1] ?? null;

      const move = planRangeMove(local, keyOf, moved, before);
      if (move) {
        server = spotifyReorder(server, {
          insert_before: move.insertBefore,
          range_length: move.rangeLength,
          range_start: move.rangeStart,
        });
        local = move.next;
      }

      expect(local).toEqual(server);
      expect(albumsOf(server)).toBe(albums.join(""));
    }
  });

  it("returns null for a no-op or an unknown album", () => {
    const tracks = ["A1", "B1", "B2", "C1"];
    expect(planRangeMove(tracks, (t) => t[0], "B", "C")).toBeNull();
    expect(planRangeMove(tracks, (t) => t[0], "B", "B")).toBeNull();
    expect(planRangeMove(tracks, (t) => t[0], "C", null)).toBeNull();
    expect(planRangeMove(tracks, (t) => t[0], "Z", null)).toBeNull();
    expect(planRangeMove(tracks, (t) => t[0], "A", "Z")).toBeNull();
  });
});

describe("planDuplicateCleanup", () => {
  it("keeps each album's first run and drops its strays", () => {
    const tracks = ["x1", "A1", "B1", "B2", "C1", "B1", "x2", "D1", "A2", "B3", "x3", "E1"];
    const plan = planDuplicateCleanup(tracks, keyOf);
    expect(plan).toEqual({
      inserts: [
        { position: 1, run: ["A1"] },
        { position: 2, run: ["B1", "B2"] },
      ],
      next: ["x1", "A1", "B1", "B2", "C1", "x2", "D1", "x3", "E1"],
      removed: ["A1", "B1", "B2", "B1", "A2", "B3"],
    });
    expect(applyCleanupOnServer(tracks, plan!)).toEqual(plan!.next);
  });

  it("returns null when no album has a stray copy", () => {
    expect(planDuplicateCleanup(["A1", "x1", "B1", "B2", "x2", "C1"], keyOf)).toBeNull();
    expect(planDuplicateCleanup([], (t: string) => t[0])).toBeNull();
  });
});
