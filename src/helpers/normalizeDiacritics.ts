/**
 * Normalizes a string by removing diacritics (accents, umlauts, etc.)
 *
 * @param input - The string to normalize
 * @returns The normalized string without diacritics
 */
export function normalizeDiacritics(input: string): string {
  return input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export default normalizeDiacritics;
