export type ArrowKey = "ArrowDown" | "ArrowLeft" | "ArrowRight" | "ArrowUp";

/** Where focus sits inside the result grid. */
export interface Position {
  column: number;
  index: number;
}

/**
 * Moves focus around the search results.
 *
 * Kept apart from the DOM so the index arithmetic — the part that silently goes
 * wrong — can be tested on its own. The caller owns the elements; this only
 * answers "given these column lengths and where I am, where do I go".
 *
 * `null` means the search field: arrowing up off the first row returns there,
 * which is where someone who wants to correct their query expects to land.
 * Empty columns are skipped rather than focused, so a search with no podcasts
 * does not leave a dead stop between songs and nothing.
 * @param columnSizes - How many hits each column holds, in visual order
 * @param current - Current position, or null when focus is in the field
 * @param key - The arrow pressed
 * @returns The new position, or null to put focus back in the field
 */
export function nextPosition(columnSizes: number[], current: null | Position, key: ArrowKey): null | Position {
  const firstFilled = columnSizes.findIndex((size) => size > 0);
  if (firstFilled === -1) return null;

  // From the field, only Down enters the results.
  if (current === null) return key === "ArrowDown" ? { column: firstFilled, index: 0 } : null;

  const size = columnSizes[current.column] ?? 0;
  if (size === 0) return { column: firstFilled, index: 0 };

  if (key === "ArrowDown") return { column: current.column, index: Math.min(current.index + 1, size - 1) };
  if (key === "ArrowUp") return current.index === 0 ? null : { column: current.column, index: current.index - 1 };

  const step = key === "ArrowRight" ? 1 : -1;
  for (let column = current.column + step; column >= 0 && column < columnSizes.length; column += step) {
    if (columnSizes[column] > 0) {
      // Keep the row where possible: sideways should feel like stepping across,
      // not like starting the next column over.
      return { column, index: Math.min(current.index, columnSizes[column] - 1) };
    }
  }

  return current;
}
