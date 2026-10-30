/**
 * Finds the single item that moved between two otherwise-identical lists.
 *
 * Both ends have to be inspected, not just the first divergence. Moving an item
 * *up* leaves it sitting at that first divergence, so reading it there works;
 * moving an item *down* leaves its neighbour there — the one that shifted up to
 * fill the gap — and trusting that index reports the wrong item moving the
 * wrong way. Reordering a collection downwards then sent Spotify a different,
 * smaller move than the one performed: the screen showed the intended order
 * from local state while the server stored something else, so the change looked
 * like it had simply not been saved until the next reload.
 *
 * Returns null when the lists are identical, or when they differ by anything
 * other than one relocated item — the caller has no single-move API to express
 * that with.
 * @param previous - Order before the drag
 * @param next - Order after the drag
 */
export function findMove<T extends { id: string }>(
  previous: T[],
  next: T[],
): { newIndex: number; oldIndex: number } | null {
  if (previous.length !== next.length) return null;

  const first = previous.findIndex((item, i) => item.id !== next[i]?.id);
  if (first === -1) return null;

  let last = previous.length - 1;
  while (last > first && previous[last].id === next[last].id) last--;

  // Moved up: the item now at `first` is the one that used to sit at `last`.
  if (next[first].id === previous[last].id) return { newIndex: first, oldIndex: last };

  // Moved down: the item that used to sit at `first` now sits at `last`.
  if (previous[first].id === next[last].id) return { newIndex: last, oldIndex: first };

  return null;
}

/**
 * Plans collapsing every album that shows up at several places in a
 * collection down to its first run of consecutive tracks.
 *
 * A range move only carries one run, so a stray copy further down stayed put
 * and, once the album was dragged below it, became the album's first
 * occurrence — the album jumped back to the stray's place on screen.
 *
 * Spotify deletes by URI, every occurrence at once, so the runs of affected
 * albums are removed along with their strays, then re-inserted one by one in
 * `inserts` order (ascending position, each landing at its final index).
 *
 * Returns null when no album has a stray copy.
 * @param items - Current order, as stored by Spotify
 * @param key - Grouping key of an item (album id), null for one that never groups
 */
export function planDuplicateCleanup<T>(
  items: T[],
  key: (item: T) => null | string,
): { inserts: { position: number; run: T[] }[]; next: T[]; removed: T[] } | null {
  const firstRuns = new Map<string, { position: number; run: T[] }>();
  const dirty = new Set<string>();
  const next: T[] = [];

  for (let i = 0; i < items.length; i++) {
    const k = key(items[i]);
    if (k === null) {
      next.push(items[i]);
      continue;
    }
    if (firstRuns.has(k)) {
      dirty.add(k);
      continue;
    }
    let end = i + 1;
    while (end < items.length && key(items[end]) === k) end++;
    const run = items.slice(i, end);
    firstRuns.set(k, { position: next.length, run });
    next.push(...run);
    i = end - 1;
  }

  if (!dirty.size) return null;
  return {
    inserts: [...dirty].map((k) => firstRuns.get(k)!).sort((a, b) => a.position - b.position),
    next,
    removed: items.filter((item) => dirty.has(key(item) ?? "")),
  };
}

/**
 * Plans a Spotify range move of every consecutive item sharing `movedKey`
 * (an album's tracks) to just before the first item with `beforeKey` (null =
 * end), and returns the list as it will look once Spotify applied it.
 *
 * The returned order has to replace the local one: the next move resolves its
 * indices against it, and reusing the pre-move order sent every drag after
 * the first one to the wrong place on the server.
 *
 * Returns null when a key is missing or the move would change nothing.
 * @param items - Current order, as stored by Spotify
 * @param key - Grouping key of an item (album id), null for one that never matches
 * @param movedKey - Key of the run to move
 * @param beforeKey - Key to insert before, or null for the end
 */
export function planRangeMove<T>(
  items: T[],
  key: (item: T) => null | string,
  movedKey: string,
  beforeKey: null | string,
): { insertBefore: number; next: T[]; rangeLength: number; rangeStart: number } | null {
  const rangeStart = items.findIndex((item) => key(item) === movedKey);
  if (rangeStart === -1) return null;
  let rangeLength = 1;
  while (rangeStart + rangeLength < items.length && key(items[rangeStart + rangeLength]) === movedKey) rangeLength++;

  const insertBefore = beforeKey === null ? items.length : items.findIndex((item) => key(item) === beforeKey);
  if (insertBefore === -1) return null;
  if (insertBefore >= rangeStart && insertBefore <= rangeStart + rangeLength) return null;

  const next = [...items];
  const run = next.splice(rangeStart, rangeLength);
  next.splice(insertBefore > rangeStart ? insertBefore - rangeLength : insertBefore, 0, ...run);
  return { insertBefore, next, rangeLength, rangeStart };
}
