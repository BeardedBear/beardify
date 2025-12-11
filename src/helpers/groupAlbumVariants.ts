import { AlbumSimplified } from "@/@types/Album";

export interface AlbumGroup {
  baseAlbum: AlbumSimplified;
  baseName: string;
  variants: AlbumSimplified[];
}

/**
 * Common variant suffixes to strip from album names
 */
const VARIANT_PATTERNS = [
  /\s*\(deluxe\s*(edition|version)?\)/i,
  /\s*\(remastered\)/i,
  /\s*\(remaster\)/i,
  /\s*\(expanded\s*(edition|version)?\)/i,
  /\s*\(special\s*edition\)/i,
  /\s*\(anniversary\s*edition\)/i,
  /\s*\(bonus\s*track\s*(edition|version)?\)/i,
  /\s*\(explicit\)/i,
  /\s*\(clean\)/i,
  /\s*\(instrumental\)/i,
  /\s*\(acoustic\)/i,
  /\s*\(live\)/i,
  /\s*-\s*deluxe\s*(edition|version)?$/i,
  /\s*-\s*remastered$/i,
  /\s*-\s*remaster$/i,
  /\s*-\s*expanded\s*(edition|version)?$/i,
  /\s*-\s*special\s*edition$/i,
  /\s*deluxe\s*(edition|version)?$/i,
  /\s*remastered$/i,
  /\s*remaster$/i,
  /\s*\d{4}\s*remaster(ed)?$/i, // e.g., "2023 Remastered"
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
