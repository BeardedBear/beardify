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

// CLDR regions that aren't ISO 3166-1 countries: groupings, historic codes, pseudo-locales.
const NOT_COUNTRIES = new Set(
  "AC AN BU CP CQ CS DD DG DY EA EU EZ FX HV IC NH QO RH SU TA TP UK UN VD XA XB YD YU ZR ZZ".split(" "),
);

let countryList: { code: string; name: string }[] | undefined;

/**
 * Every country the browser can name, as ISO alpha-2 codes with English names, sorted by name.
 * Built from Intl rather than a bundled list, so it costs no bytes; computed once.
 */
export function countries(): { code: string; name: string }[] {
  countryList ??= buildCountries();
  return countryList;
}

function buildCountries(): { code: string; name: string }[] {
  const regionNames = new Intl.DisplayNames(["en"], { fallback: "none", type: "region" });
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return [...letters]
    .flatMap((a) => [...letters].map((b) => a + b))
    .filter((code) => !NOT_COUNTRIES.has(code))
    .flatMap((code) => {
      const name = regionNames.of(code);
      return name ? [{ code, name }] : [];
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
