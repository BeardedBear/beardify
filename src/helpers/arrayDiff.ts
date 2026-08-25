/**
 * Finds the single item that moved between two otherwise-identical lists by
 * locating the first index where they diverge and tracing that item's prior
 * position via its id.
 */
export function findMove<T extends { id: string }>(
  previous: T[],
  next: T[],
): { newIndex: number; oldIndex: number } | null {
  const newIndex = previous.findIndex((item, i) => item.id !== next[i]?.id);
  if (newIndex === -1) return null;
  const oldIndex = previous.findIndex((item) => item.id === next[newIndex].id);
  return { newIndex, oldIndex };
}
