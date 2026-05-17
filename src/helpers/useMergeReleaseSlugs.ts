import { Release } from "@/@types/Releases";

/**
 * Merge releases that share the same ID by combining their slugs into a single entry.
 * Used to consolidate Discogs release slugs that appear across multiple rows for the same release.
 * @param array - Array of releases possibly containing entries with the same ID
 * @returns Deduplicated array with slugs merged per ID
 */
export function useMergeReleaseSlugs(array: Release[]): Release[] {
  return array.reduce((acc: Release[], value) => {
    if (acc.some((release) => release.id === value.id)) {
      const existingRelease = acc.find((r) => r.id === value.id);
      existingRelease?.slug.push(value.slug.join());

      return acc;
    }
    return acc.concat(value);
  }, []);
}
