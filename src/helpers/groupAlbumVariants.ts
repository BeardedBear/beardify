import { AlbumSimplified } from "@/@types/Album";
import { normalizeDiacritics } from "@/helpers/normalizeDiacritics";

export interface AlbumGroup {
  baseAlbum: AlbumSimplified;
  baseName: string;
  variants: AlbumSimplified[];
}

// ── Shared regex fragments ────────────────────────────────────────

const D = "[-–—]"; // Dash char variants
const REM = "re-?master(?:ed)?"; // Remaster/Remastered/Re-Mastered
const ANNIV = "\\d+th\\s+anniversary"; // Ordinal anniversary

// ── Pattern construction helpers ──────────────────────────────────

/** Generate a parenthetical keyword pattern: (keyword), (keyword edition), (keyword version) */
const kwParen = (kw: string): RegExp => new RegExp(`\\s*\\(${kw}\\s*(edition|version)?\\)`, "i");

/** Generate a dash-suffix keyword pattern: - keyword, - keyword edition, - keyword version */
const kwDash = (kw: string): RegExp => new RegExp(`\\s*-\\s*${kw}\\s*(edition|version)?$`, "i");

/** Generate a colon-suffix keyword pattern: : keyword */
const kwColon = (kw: string): RegExp => new RegExp(`\\s*:\\s*${kw}$`, "i");

/** Generate a standalone keyword pattern: keyword, keyword edition, keyword version */
const kwStandalone = (kw: string): RegExp => new RegExp(`\\s*${kw}\\s*(edition|version)?$`, "i");

// ── Keywords ──────────────────────────────────────────────────────

const VARIANT_KEYWORDS = [
  "deluxe",
  "edition de luxe",
  "édition de luxe",
  "remaster",
  "remastered",
  "re-master",
  "re-mastered",
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
  "tour edition",
  "imagined",
  "sessions",
  "edgar",
  "archive edition",
  "archive collection",
  "legacy edition",
  "collector's edition",
  "complete",
  "q&a",
  "naked",
];

// ── Parenthetical variant patterns ────────────────────────────
// Applied in order: specific parentheticals → keyword-based → catch-all

const PAREN_PATTERNS: RegExp[] = [
  // B-Sides, Rarities, Bonus Tracks, Bonus Disc… (long alternation, MUST BE FIRST)
  /\s*\((B[-\s]?Sides( and Rarities)?|Rarities|Bonus Tracks|Bonus Disc|Bonus CD|Bonus Edition|Bonus Material|Bonus Content|Bonus Songs|Bonus EP|Bonus Single|Bonus)\)/i, // eslint-disable-line @stylistic/max-len
  // Stereo / Mono / Surround Mix (with optional year)
  /\s*\((\d{4}\s*)?(Stereo|Mono|Surround)\s+Mix\)/i,
  // "'s Edition" — (Collector's Edition), (Explorer's Edition)
  /\s*\(\w+['\u2019]s\s+edition\)/i,
  // Year + remaster — (2019 Remaster), (2023 Remastered), (2009 Re-Mastered)
  new RegExp(`\\s*\\(\\d{4}\\s*${REM}\\)`, "i"),
  // Year + mix — (2025 Mix), (2023 Remix)
  /\s*\(\d{4}\s*(?:re)?mix\)/i,
  // Ordinal anniversary — (20th Anniversary), (25th Anniversary Edition)
  new RegExp(`\\s*\\(${ANNIV}(?:\\s+edition)?\\)`, "i"),
  // Anniversary with divider — (30th Anniversary Edition / Remastered 2022)
  new RegExp(`\\s*\\(${ANNIV}\\s+edition(?:\\s*\\/\\s*.+)?\\)`, "i"),
  // "The Complete Sessions" with years — (The Complete Sessions 1998-1999)
  /\s*\(the\s+complete\s+sessions\s+\d{4}[-–]\d{4}\)/i,
  // "The" descriptor — (The Out-takes), (The Raw Studio Mixes)
  /\s*\(the\s+[^)]+\)$/i,
  // Location/city descriptor — (New York City - The Ultimate Mixes)
  new RegExp(`\\s*\\([A-Z][a-zA-Z\\s]*${D}[^)]+\\)$`, "i"),
  // "Jam" suffix — (Live Jam), (Home Jam), (Studio Jam)
  /\s*\(\w+(?:\s+\w+)*\s+[Jj]am\)/i,
  // Keyword-based: (keyword), (keyword edition), (keyword version)
  ...VARIANT_KEYWORDS.map(kwParen),
  // Catch-all: any variant keyword inside parentheses
  new RegExp(`\\s*\\([^)]*(?:${REM}|deluxe|expanded|special|bonus|version|extra)[^)]*\\)`, "i"),
  // Square brackets with variant info — [2021 Remaster], [Deluxe Edition]
  /\s*\[[^\]]*(?:remaster|deluxe|expanded|special|bonus|edition|version|\d{4})[^\]]*\]/i,
];

// ── Dash suffix patterns ─────────────────────────────────────
// Applied in order: anniversary → "The" → keyword → broad → phrase

const DASH_PATTERNS: RegExp[] = [
  // Anniversary — - 10th Anniversary … (MUST BE BEFORE other dash patterns)
  new RegExp(`\\s*${D}\\s*${ANNIV}.*$`, "i"),
  // "The" + variant — - The Remixes, - The Deluxe Edition (MUST BE BEFORE keyword dashes)
  new RegExp(`\\s*${D}\\s*the\\s+(?:remixes|remaster|deluxe|expanded|bonus)$`, "i"),
  // Keyword-based: - keyword, - keyword edition, - keyword version
  ...VARIANT_KEYWORDS.map(kwDash),
  // "Complete" + text — - Complete Kisses, - Complete Collection
  new RegExp(`\\s*${D}\\s*complete\\s+.+$`, "i"),
  // Capitalized name(s) — - Edgar, - Edgar Allan Poe, - John Smith
  new RegExp(`\\s*${D}\\s+[A-Z][a-z]+(?:\\s+[A-Z][a-z]+)*$`, "i"),
  // Track by Track Commentary
  /\s*-\s*track\s+by\s+track(?:\s+commentary)?$/i,
  // Behind the Scenes / Making Of
  /\s*-\s*(?:behind\s+the\s+scenes|making\s+of|the\s+making\s+of)$/i,
];

// ── Standalone suffix patterns ───────────────────────────────

const STANDALONE_PATTERNS: RegExp[] = [
  // Keyword-based: keyword, keyword edition, keyword version
  ...VARIANT_KEYWORDS.map(kwStandalone),
  // Anniversary ordinal — 30th Anniversary, 25th Anniversary Edition
  new RegExp(`\\s*${ANNIV}(?:\\s+(?:edition|commentary|${REM}|deluxe))?$`, "i"),
  // Bare anniversary numbers — 50, 50th, 25th
  /\s*(?:25|30|40|45|50|55|60|75)(?:th)?$/i,
  // Year + remaster — 2023 Remastered, 2020 Remaster
  new RegExp(`\\s*\\d{4}\\s*${REM}$`, "i"),
];

// ── Other format patterns ────────────────────────────────────

const OTHER_PATTERNS = [
  // Colon + keyword
  ...VARIANT_KEYWORDS.map(kwColon),
  // Colon + location/venue — : Location Name, : Venue MMXXIV
  /\s*:\s*[A-Z][a-zA-Z\s]+(?:MMXX|MM[CDXLVI]+|\d{4})?\s*$/i,
  // Plus combinations — + anything, anything +
  /\s*\+\s*[^+]+$/i,
  /\s*[^+]+\+$/i,
];

// ── Combined pattern list (applied in order) ─────────────────

const VARIANT_PATTERNS = [
  ...PAREN_PATTERNS,
  ...DASH_PATTERNS,
  ...STANDALONE_PATTERNS,
  ...OTHER_PATTERNS,
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
  normalized = normalizeDiacritics(normalized.toLowerCase())
    .replace(/[\u2018\u2019]/g, "'") // Normalize curly apostrophes to straight apostrophe
    .replace(/[\u201C\u201D]/g, "\"") // Normalize curly quotes to straight quotes
    .replace(/\s*\.{2,}\s*/g, "...") // Normalize ellipsis and remove spaces around it
    .replace(/\bvol\.\s*/gi, "volume ") // Normalize "Vol." to "Volume"
    .replace(/\.{3,}$/g, "") // Remove trailing ellipsis
    .replace(/[?!]+$/g, "") // Remove trailing question marks and exclamation points
    .replace(/\s+/g, " ") // Normalize multiple spaces to single space
    .trim();

  return normalized;
}
