/**
 * Returns a random integer between min and max (inclusive).
 * @param min - Lower bound (inclusive)
 * @param max - Upper bound (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
