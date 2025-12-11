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
];

/**
 * Generate regex patterns from keywords with different formats
 */
const VARIANT_PATTERNS = [
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
  // Anniversary with ordinal: 30th Anniversary, 25th Anniversary
  /\s*\d+th\s+anniversary(?:\s+edition)?$/i,
  // Year-based remaster: "2023 Remastered", "2020 Remaster"
  /\s*\d{4}\s*remaster(ed)?$/i,
  // Plus sign combinations: "+ anything" or "anything +"
  /\s*\+\s*[^+]+$/i,
  /\s*[^+]+\+$/i,
  // Colon with location/venue info: ": Location Name" or ": Venue MMXXIV"
  /\s*:\s*[A-Z][a-zA-Z\s]+(?:MMXX|MM[CDXLVI]+|\d{4})?\s*$/i,
];

/**
 * Group albums by their base name, keeping variants together
 * The base album is chosen as:
 * 1. The non-variant version if it exists
 * 2. Otherwise, the earliest release (by date)
 */
export function groupAlbumVariants(albums: AlbumSimplified[]): AlbumGroup[] {
  const groupsMap = new Map<string, AlbumSimplified[]>();

  // Group albums by normalized name
  albums.forEach((album) => {
    const baseName = normalizeAlbumName(album.name);
    if (!groupsMap.has(baseName)) {
      groupsMap.set(baseName, []);
    }
    groupsMap.get(baseName)!.push(album);
  });

  // Convert to AlbumGroup array
  const groups: AlbumGroup[] = [];

  groupsMap.forEach((albumList, baseName) => {
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

  // Clean up any remaining whitespace
  return normalized.trim().toLowerCase();
}
