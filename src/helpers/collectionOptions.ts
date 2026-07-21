const COLLECTION_TAG_REGEX = /#collection\b/i;
const TOP_TAG_REGEX = /#top:(\d+)-(\d+)-(\d+)/i;
const TIER_TAG_REGEX = /#tier:(\S+)/i;

export const MAX_DESCRIPTION_LENGTH = 300;

/**
 * A collection's ranking is either off, the fixed 3-tier "Top" mode (counts
 * only, auto-generated labels), or the free-form "Tier list" mode (custom
 * labels, arbitrary category count). The two modes are mutually exclusive —
 * a collection is never both at once, and one is never silently converted
 * into the other.
 */
export type CollectionRankingMode
  = | { tiers: TierList; type: "tierlist" }
    | { tiers: TopTiers; type: "top" }
    | { type: "off" };

export interface TierDefinition {
  label: string;
  size: null | number;
}

/** Ordered list of tiers; only the last entry may have `size: null` (open-ended, takes the remainder). */
export type TierList = TierDefinition[];

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
 * text and the current collection ranking mode (tags are always prepended).
 */
export function buildCollectionDescription(
  cleanText: string,
  isCollection: boolean,
  mode: CollectionRankingMode,
): string {
  let modeTag = "";
  if (mode.type === "top") modeTag = `#Top:${mode.tiers.join("-")}`;
  else if (mode.type === "tierlist") modeTag = buildTierTag(mode.tiers);
  const tags = [isCollection ? "#Collection" : "", modeTag].filter(Boolean).join(" ");
  return [tags, cleanText].filter(Boolean).join(" ").trim();
}

/**
 * Encodes a tier list into the compact `#Tier:label=size,label=size,...` tag.
 * The last tier's size is always encoded as `*` (open-ended, takes the rest).
 */
export function buildTierTag(tiers: TierList): string {
  const body = tiers
    .map((tier, index) => `${sanitizeTierLabel(tier.label)}=${index === tiers.length - 1 ? "*" : tier.size}`)
    .join(",");
  return `#Tier:${body}`;
}

/**
 * Decodes HTML entities Spotify sometimes encodes into description text
 * (e.g. apostrophes come back as `&#x27;`), so labels display as typed.
 */
export function decodeHtmlEntities(text: string): string {
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value;
}

/** Converts a stored label's underscores back to spaces for display. */
export function displayTierLabel(label: string): string {
  return label.replace(/_/g, " ");
}

/**
 * Default color for a Tier list category, from red (index 0, best) to green
 * (last index, worst), interpolated through the hue wheel.
 */
export function getTierColor(index: number, total: number): string {
  const hue = (index / Math.max(total - 1, 1)) * 120;
  return `hsl(${hue} 70% 40%)`;
}

/**
 * Tier index (0 = biggest) for a given 0-based rank position in "Top" mode.
 * Any position beyond the last tier's boundary stays in the last tier.
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

/**
 * Parses the ranking mode from a description: `#Top:` and `#Tier:` are
 * checked independently (never converted into one another) and are expected
 * to be mutually exclusive since only one is ever written at save time.
 */
export function parseCollectionRankingMode(description: string): CollectionRankingMode {
  const tiers = parseTierList(description);
  if (tiers) return { tiers, type: "tierlist" };
  const topTiers = parseTopTiers(description);
  if (topTiers) return { tiers: topTiers, type: "top" };
  return { type: "off" };
}

/** Parses the `#Tier:label=size,...` tag only — no fallback to `#Top:`. */
export function parseTierList(description: string): null | TierList {
  const tierMatch = description.match(TIER_TAG_REGEX);
  if (!tierMatch) return null;
  const tiers = tierMatch[1]
    .split(",")
    .map((entry) => {
      const [label, sizeRaw] = entry.split("=");
      if (!label || !sizeRaw) return null;
      const size = sizeRaw === "*" ? null : Number(sizeRaw);
      if (size !== null && !Number.isFinite(size)) return null;
      return { label: decodeHtmlEntities(label), size };
    })
    .filter((tier): tier is TierDefinition => tier !== null);
  return tiers.length ? tiers : null;
}

export function parseTopTiers(description: string): null | TopTiers {
  const match = description.match(TOP_TAG_REGEX);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/** Remaining characters before hitting Spotify's description length limit. */
export function remainingDescriptionBudget(description: string): number {
  return MAX_DESCRIPTION_LENGTH - description.length;
}

/**
 * Strips characters that would break the `#Tier:` tag encoding out of a
 * user-entered label. The tag body cannot contain whitespace (see
 * TIER_TAG_REGEX), so spaces become underscores rather than being dropped.
 */
export function sanitizeTierLabel(label: string): string {
  return label.replace(/[,=\s]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Removes the #Collection, #Top:x-y-z and #Tier:... tags from a description,
 * leaving only the user's own text (used to populate/display the edit textarea).
 */
export function stripCollectionTags(description: string): string {
  return description.replace(TIER_TAG_REGEX, "").replace(TOP_TAG_REGEX, "").replace(COLLECTION_TAG_REGEX, "").trim();
}
