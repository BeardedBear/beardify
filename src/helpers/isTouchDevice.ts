/**
 * Detect if the current environment is a touch-focused device.
 * Uses a mix of feature detection and a matchMedia fallback for accuracy.
 */
export function isTouchDevice(): boolean {
  try {
    if (typeof window === "undefined") return false;

    // Prefer matchMedia when available (covers many modern mobile devices)
    if (window.matchMedia) {
      if (window.matchMedia("(hover: none) and (pointer: coarse)").matches) return true;
    }

    // Fallback to feature detection
    return "ontouchstart" in window;
  } catch {
    return false;
  }
}
