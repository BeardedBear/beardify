/**
 * Scroll delta for a SortableJS `scrollFn` autoscroll handler: negative
 * (scroll up) when the pointer is within `sensitivity` of the top edge,
 * positive (scroll down) near the bottom edge, or null outside both zones —
 * meaning the caller should return "continue" and let the default behavior
 * apply. Speed ramps up linearly as the pointer gets closer to the edge.
 */
export function computeAutoScrollDelta(
  distanceFromTop: number,
  distanceFromBottom: number,
  sensitivity: number,
  maxSpeed: number,
): null | number {
  if (distanceFromTop >= 0 && distanceFromTop < sensitivity) {
    return -Math.ceil(maxSpeed * (1 - distanceFromTop / sensitivity));
  }
  if (distanceFromBottom >= 0 && distanceFromBottom < sensitivity) {
    return Math.ceil(maxSpeed * (1 - distanceFromBottom / sensitivity));
  }
  return null;
}
