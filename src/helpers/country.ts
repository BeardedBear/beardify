/**
 * Get flag image URL from ISO country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "GB", "US", "FR")
 * @returns Flag image URL
 */
export function getCountryFlagUrl(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "";
  }

  return `/flags/${countryCode.toLowerCase()}.svg`;
}

/**
 * Get country name from ISO country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "GB", "US", "FR")
 * @returns Country name in English
 */
export function getCountryName(countryCode: string | undefined): string {
  if (!countryCode) {
    return "";
  }

  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  try {
    return regionNames.of(countryCode) || countryCode;
  } catch {
    return countryCode;
  }
}
