/** Gamma correction exponent for the perceptual volume curve. */
export const DEFAULT_GAMMA = 1.8;

/**
 * Clamps a number to [min, max].
 * @param n - Value to clamp
 * @param min - Lower bound (default 0)
 * @param max - Upper bound (default 100)
 */
export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

/**
 * Convert a linear slider percentage (0-100) to a perceptual volume value (0-100).
 * Applies gamma correction so the slider feels linear to human hearing.
 * @param p - Slider position as a percentage (0-100)
 * @param gamma - Gamma exponent (default DEFAULT_GAMMA)
 */
export function sliderPercentToVolume(p: number, gamma = DEFAULT_GAMMA): number {
  const s = clamp(p) / 100;
  return Math.round(Math.pow(s, gamma) * 100);
}

/**
 * Convert a perceptual volume value (0-100) back to a linear slider percentage (0-100).
 * Inverse of sliderPercentToVolume.
 * @param v - Volume value (0-100)
 * @param gamma - Gamma exponent (default DEFAULT_GAMMA)
 */
export function volumeToSliderPercent(v: number, gamma = DEFAULT_GAMMA): number {
  const vol = clamp(v) / 100;
  return Math.round(Math.pow(vol, 1 / gamma) * 100);
}
