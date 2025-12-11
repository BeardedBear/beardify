import { AlbumSimplified } from "@/@types/Album";

export interface AlbumGroup {
  baseAlbum: AlbumSimplified;
  baseName: string;
  variants: AlbumSimplified[];
}

/**
 * Common variant keywords and patterns
 */
const VARIANT_KEYWORDS = [
  "deluxe",
  "edition de luxe",
  "édition de luxe",
  "remaster",
  "remastered",
  "expanded",
  "special edition",
  "anniversary edition",
  "bonus track",
  "explicit",
  "clean",
  "instrumental",
  "acoustic",
  "live",
  "commentary",
  "track commentary",
  "interview",
  "documentary",
  "in addition",
  "revisited",
  "exclusive",
  "abridged",
  "international",
  "international standard",
  "alternate",
  "alternate sequence",
  "pa",
  "remixes",
];

/**
 * Generate regex patterns from keywords with different formats
 */
const VARIANT_PATTERNS = [
  // Parenthetical variants: (B-Sides and Rarities), (B-Sides), (Rarities), (Bonus Tracks), etc. (MUST BE FIRST)
  /\s*\((B[-\s]?Sides( and Rarities)?|Rarities|Bonus Tracks|Bonus Disc|Bonus CD|Bonus Edition|Bonus Material|Bonus Content|Bonus Songs|Bonus EP|Bonus Single|Bonus)\)/i,
  // Dash with anniversary and additional text: – 10th Anniversary Commentary (MUST BE EARLY)
  /\s*[-–—]\s*\d+th\s+anniversary.*$/i,
  // Dash with "The" + variant keyword: - The Remixes, - The Deluxe Edition (MUST BE BEFORE DASH KEYWORDS)
  /\s*[-–—]\s*the\s+(?:remixes|remaster|deluxe|expanded|bonus)$/i,
  // Parentheses format: (keyword), (keyword edition), (keyword version)
  ...VARIANT_KEYWORDS.map((kw) => new RegExp(`\\s*\\(${kw}\\s*(edition|version)?\\)`, "i")),
  // Dash suffix: - keyword, - keyword edition, - keyword version
  ...VARIANT_KEYWORDS.map((kw) => new RegExp(`\\s*-\\s*${kw}\\s*(edition|version)?$`, "i")),
  // Colon suffix: : keyword
  ...VARIANT_KEYWORDS.map((kw) => new RegExp(`\\s*:\\s*${kw}$`, "i")),
  // Standalone suffix: keyword, keyword edition, keyword version
  ...VARIANT_KEYWORDS.map((kw) => new RegExp(`\\s*${kw}\\s*(edition|version)?$`, "i")),
  // Complex parentheses with multiple info: (30th Anniversary Edition / Remastered 2022)
  /\s*\(\d+th\s+anniversary\s+edition(?:\s*\/\s*.+)?\)/i,
  /\s*\([^)]*(?:remaster|deluxe|expanded|special|bonus)[^)]*\)/i,
  // Parentheses with "The Complete Sessions" and years: (The Complete Sessions 1998-1999)
  /\s*\(the\s+complete\s+sessions\s+\d{4}[-–]\d{4}\)/i,
  // Parentheses with year and remaster: (2019 Remaster), (2023 Remastered)
  /\s*\(\d{4}\s*remaster(?:ed)?\)/i,
  // Parentheses with year and mix: (2025 Mix), (2023 Remix)
  /\s*\(\d{4}\s*(?:re)?mix\)/i,
  // Parentheses with anniversary: (20th Anniversary), (25th Anniversary Edition)
  /\s*\(\d+th\s+anniversary(?:\s+edition)?\)/i,
  // Anniversary with ordinal: 30th Anniversary, 25th Anniversary, 10th Anniversary Commentary
  /\s*\d+th\s+anniversary(?:\s+(?:edition|commentary|remaster|deluxe))?$/i,
  // Year-based remaster: "2023 Remastered", "2020 Remaster"
  /\s*\d{4}\s*remaster(ed)?$/i,
  // Plus sign combinations: "+ anything" or "anything +"
  /\s*\+\s*[^+]+$/i,
  /\s*[^+]+\+$/i,
  // Colon with location/venue info: ": Location Name" or ": Venue MMXXIV"
  /\s*:\s*[A-Z][a-zA-Z\s]+(?:MMXX|MM[CDXLVI]+|\d{4})?\s*$/i,
  // Square brackets with year and variant info: [2021 Remaster], [Deluxe Edition]
  /\s*\[[^\]]*(?:remaster|deluxe|expanded|special|bonus|edition|version|\d{4})[^\]]*\]/i,
  // Track by Track, Behind the Scenes, Making of, etc.
  /\s*-\s*track\s+by\s+track(?:\s+commentary)?$/i,
  /\s*-\s*(?:behind\s+the\s+scenes|making\s+of|the\s+making\s+of)$/i,
];

/**
 * Get display name for an album, removing variant suffixes
 * For use in the UI to show cleaner names in the discography
 */
export function getDisplayName(name: string): string {
  // Always remove variant suffixes for cleaner display
  let displayName = name.trim();
  VARIANT_PATTERNS.forEach((pattern) => {
    displayName = displayName.replace(pattern, "");
  });

  displayName = displayName.trim();

  // If cleaning removed everything, keep the original name
  return displayName.length > 0 ? displayName : name;
}

/**
 * Group albums by their base name, keeping variants together
 * The base album is chosen as:
 * 1. The non-variant version if it exists
 * 2. Otherwise, the earliest release (by date)
 * Maintains original album order in the discography
 */
export function groupAlbumVariants(albums: AlbumSimplified[]): AlbumGroup[] {
  const groupsMap = new Map<string, { albums: AlbumSimplified[]; firstIndex: number }>();

  // Group albums by normalized name, tracking first occurrence
  albums.forEach((album, index) => {
    const baseName = normalizeAlbumName(album.name);
    if (!groupsMap.has(baseName)) {
      groupsMap.set(baseName, { albums: [], firstIndex: index });
    }
    groupsMap.get(baseName)!.albums.push(album);
  });

  // Convert to AlbumGroup array
  const groups: AlbumGroup[] = [];

  groupsMap.forEach(({ albums: albumList }, baseName) => {
    if (albumList.length === 1) {
      // Single album, no variants
      groups.push({
        baseAlbum: albumList[0],
        baseName,
        variants: [],
      });
    } else {
      // Multiple albums - find the base version
      const nonVariants = albumList.filter((a) => !isVariant(a));

      let baseAlbum: AlbumSimplified;
      let variants: AlbumSimplified[];

      if (nonVariants.length > 0) {
        // Use non-variant as base, earliest if multiple
        baseAlbum = nonVariants.sort((a, b) => a.release_date.localeCompare(b.release_date))[0];
        variants = albumList.filter((a) => a.id !== baseAlbum.id);
      } else {
        // All are variants, use earliest
        const sorted = [...albumList].sort((a, b) => a.release_date.localeCompare(b.release_date));
        baseAlbum = sorted[0];
        variants = sorted.slice(1);
      }

      // Sort variants by release date (newest first for deluxe/remastered)
      variants.sort((a, b) => b.release_date.localeCompare(a.release_date));

      groups.push({
        baseAlbum,
        baseName,
        variants,
      });
    }
  });

  // Sort groups by base album release date (newest first to match Spotify's order)
  groups.sort((a, b) => b.baseAlbum.release_date.localeCompare(a.baseAlbum.release_date));

  return groups;
}

/**
 * Check if an album is a variant (has variant keywords in name)
 */
function isVariant(album: AlbumSimplified): boolean {
  const name = album.name.toLowerCase();
  return VARIANT_PATTERNS.some((pattern) => pattern.test(name));
}

/**
 * Normalize an album name by removing variant suffixes
 */
function normalizeAlbumName(name: string): string {
  let normalized = name.trim();

  // Apply all patterns
  VARIANT_PATTERNS.forEach((pattern) => {
    normalized = normalized.replace(pattern, "");
  });

  // Normalize punctuation and capitalization
  normalized = normalized
    .toLowerCase()
    .replace(/\s*\.{2,}\s*/g, "...") // Normalize ellipsis and remove spaces around it
    .replace(/\bvol\.\s*/gi, "volume ") // Normalize "Vol." to "Volume"
    .replace(/[?!]+$/g, "") // Remove trailing question marks and exclamation points
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();

  return normalized;
}
