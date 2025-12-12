export const DEFAULT_GAMMA = 1.8;

export function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

export function sliderPercentToVolume(p: number, gamma = DEFAULT_GAMMA): number {
  const s = clamp(p) / 100;
  return Math.round(Math.pow(s, gamma) * 100);
}

export function volumeToSliderPercent(v: number, gamma = DEFAULT_GAMMA): number {
  const vol = clamp(v) / 100;
  return Math.round(Math.pow(vol, 1 / gamma) * 100);
}
