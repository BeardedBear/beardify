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
