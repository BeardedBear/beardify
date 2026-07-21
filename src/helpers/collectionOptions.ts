const COLLECTION_TAG_REGEX = /#collection\b/i;
const TOP_TAG_REGEX = /#top:(\d+)-(\d+)-(\d+)/i;
const TIER_TAG_REGEX = /#tier:(\S+)/i;

export const MAX_DESCRIPTION_LENGTH = 300;

/**
 * Label for the synthetic catch-all bucket newly added albums land in. It is
 * not one of the user's editable categories and is never written to the
 * `#Tier:` tag — it is always whatever comes after all stored tier sizes.
 */
export const UNSORTED_TIER_LABEL = "Unsorted";

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
  size: number;
}

/** Ordered list of tiers, each with an explicit, drag-managed size. */
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

/** Builds an id → position lookup for O(1) rank lookups instead of repeated `findIndex` scans. */
export function buildRankIndex<T extends { id: string }>(items: T[]): Map<string, number> {
  return new Map(items.map((item, index) => [item.id, index]));
}

/**
 * Encodes a tier list into the compact `#Tier:label=size,label=size,...` tag.
 * Every category has an explicit, drag-managed size — none of them is an
 * open catch-all. The catch-all is the separate, non-stored "Unsorted"
 * bucket that newly added albums land in (see UNSORTED_TIER_LABEL).
 */
export function buildTierTag(tiers: TierList): string {
  const body = tiers.map((tier) => `${sanitizeTierLabel(tier.label)}=${tier.size}`).join(",");
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
  return `hsl(${hue} 70% 40% / 50%)`;
}

export function getTierLabel(tierIndex: number, tiers: TopTiers): string {
  if (tierIndex === 0) return `Top ${tiers[0]}`;
  if (tierIndex === 1) return `${tiers[0] + 1}–${tiers[0] + tiers[1]}`;
  return `${tiers[0] + tiers[1] + 1}+`;
}

/**
 * Splits items into one bucket per tier (by stored size) plus a trailing
 * "Unsorted" bucket (whatever's left over). Shared by the editable and
 * read-only collection pages so the grouping math only lives in one place.
 */
export function groupByTierList<T>(items: T[], tierList: TierList): T[][] {
  let offset = 0;
  const groups = tierList.map((tier) => {
    const group = items.slice(offset, offset + tier.size);
    offset += tier.size;
    return group;
  });
  groups.push(items.slice(offset));
  return groups;
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
      // "*" is a legacy sentinel from before the Unsorted bucket existed, when the
      // last tier absorbed the remainder itself; treat it as empty (0) on read.
      const size = sizeRaw === "*" ? 0 : Number(sizeRaw);
      if (!Number.isFinite(size)) return null;
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
 * `#` is stripped too so a label can't accidentally read back as a new
 * `#Top:`/`#Tier:`/`#Collection` tag when the description is re-parsed.
 */
export function sanitizeTierLabel(label: string): string {
  return label.replace(/[,=#\s]+/g, "_").replace(/^_+|_+$/g, "");
}

/**
 * Given the tiers a set of now-deleted items used to belong to (looked up
 * from their last known grouping), decrements each affected tier's stored
 * size by how many of its items were removed. The last group in `groups` is
 * the Unsorted bucket (see groupByTierList) — it's one entry longer than
 * `list`, and never needs shrinking since it always absorbs whatever
 * remains. Returns null if none of the removed ids belonged to a stored tier.
 */
export function shrinkTiersForRemovedAlbums<T extends { id: string }>(
  list: TierList,
  groups: T[][],
  removedIds: string[],
): null | TierList {
  const tierIndexById = new Map<string, number>();
  groups.forEach((group, tierIndex) => {
    group.forEach((item) => tierIndexById.set(item.id, tierIndex));
  });

  const decrements = new Array<number>(list.length).fill(0);
  let matched = false;
  removedIds.forEach((id) => {
    const tierIndex = tierIndexById.get(id);
    if (tierIndex === undefined || tierIndex >= list.length) return;
    decrements[tierIndex]++;
    matched = true;
  });
  if (!matched) return null;
  return list.map((tier, index) => ({ ...tier, size: Math.max(tier.size - decrements[index], 0) }));
}

/** Splits items into the 3 fixed "Top" buckets (big / medium / rest) by count. */
export function splitTopTiers<T>(items: T[], tiers: TopTiers): [T[], T[], T[]] {
  const [big, medium] = tiers;
  return [items.slice(0, big), items.slice(big, big + medium), items.slice(big + medium)];
}

/**
 * Removes the #Collection, #Top:x-y-z and #Tier:... tags from a description,
 * leaving only the user's own text (used to populate/display the edit textarea).
 */
export function stripCollectionTags(description: string): string {
  return description.replace(TIER_TAG_REGEX, "").replace(TOP_TAG_REGEX, "").replace(COLLECTION_TAG_REGEX, "").trim();
}
