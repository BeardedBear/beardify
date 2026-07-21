const COLLECTION_TAG_REGEX = /#collection\b/i;
const TOP_TAG_REGEX = /#top:(\d+)-(\d+)-(\d+)/i;

export interface TopPreset {
  id: string;
  label: string;
  tiers: TopTiers;
}

export type TopTiers = [number, number, number];

export const TOP_PRESETS: TopPreset[] = [
  { id: "top20", label: "Top 20", tiers: [5, 10, 5] },
  { id: "top50", label: "Top 50", tiers: [10, 20, 20] },
  { id: "top100", label: "Top 100", tiers: [10, 30, 60] },
];

/**
 * Builds the final description sent to the Spotify API from the user's own
 * text and the current collection options (tags are always prepended).
 */
export function buildCollectionDescription(
  cleanText: string,
  isCollection: boolean,
  topTiers: null | TopTiers,
): string {
  const tags = [isCollection ? "#Collection" : "", topTiers ? `#Top:${topTiers.join("-")}` : ""]
    .filter(Boolean)
    .join(" ");
  return [tags, cleanText].filter(Boolean).join(" ").trim();
}

/**
 * Tier index (0 = biggest) for a given 0-based rank position. Any position
 * beyond the last tier's boundary stays in the last tier.
 */
export function getTierForIndex(index: number, tiers: TopTiers): 0 | 1 | 2 {
  if (index < tiers[0]) return 0;
  if (index < tiers[0] + tiers[1]) return 1;
  return 2;
}

export function getTierLabel(tierIndex: 0 | 1 | 2, tiers: TopTiers): string {
  if (tierIndex === 0) return `Top ${tiers[0]}`;
  if (tierIndex === 1) return `${tiers[0] + 1}–${tiers[0] + tiers[1]}`;
  return `${tiers[0] + tiers[1] + 1}+`;
}

export function isDescriptionCollection(description: string): boolean {
  return COLLECTION_TAG_REGEX.test(description);
}

export function parseTopTiers(description: string): null | TopTiers {
  const match = description.match(TOP_TAG_REGEX);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Removes the #Collection and #Top:x-y-z tags from a description, leaving
 * only the user's own text (used to populate/display the edit textarea).
 */
export function stripCollectionTags(description: string): string {
  return description.replace(TOP_TAG_REGEX, "").replace(COLLECTION_TAG_REGEX, "").trim();
}
