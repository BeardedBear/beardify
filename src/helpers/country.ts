/**
 * Get flag image URL from ISO country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "GB", "US", "FR")
 * @returns Flag image URL
 */
export function getCountryFlagUrl(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "";
  }

  // Use local flag-icons package for square flags (1x1 aspect ratio)
  // Convert to lowercase as required by the package
  const code = countryCode.toLowerCase();

  // In development, serve from node_modules
  // In production, files are copied to /flags/ by vite-plugin-static-copy
  if (import.meta.env.DEV) {
    return `/node_modules/flag-icons/flags/4x3/${code}.svg`;
  }
  return `/flags/${code}.svg`;
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
