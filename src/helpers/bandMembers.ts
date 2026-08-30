import type { BandMember, DiscogsMember } from "@/@types/Artist";

import { cleanDiscogsName } from "@/helpers/discogs";

/**
 * Adapt Discogs members to the timeline shape. Discogs carries no membership
 * dates, only an active flag, so these entries render as undated bars unless a
 * dated source (MusicBrainz/Wikidata) covers the same person.
 * @param members - Raw Discogs members
 * @returns Members in BandMember shape
 */
export function discogsBandMembers(members: DiscogsMember[] | undefined): BandMember[] {
  return (members ?? []).map((member) => ({
    begin: null,
    end: null,
    ended: !member.active,
    id: `discogs-${member.id}`,
    instruments: [],
    name: cleanDiscogsName(member.name),
  }));
}

/**
 * Merge band members coming from two sources (e.g. Wikidata + MusicBrainz),
 * de-duplicating by name and keeping the richest data available: dates from
 * whichever source has them, and the union of instruments.
 *
 * Fields from `primary` win on conflict (pass the more trusted source first).
 * @param primary - Preferred source (e.g. Wikidata)
 * @param secondary - Fallback source (e.g. MusicBrainz)
 * @returns Merged, de-duplicated members
 */
export function mergeBandMembers(primary: BandMember[], secondary: BandMember[]): BandMember[] {
  const byName = new Map<string, BandMember>();

  for (const member of [...primary, ...secondary]) {
    const key = normalizeName(member.name);
    if (!key) continue;
    const exact = byName.get(key);
    const existing = exact ? { key, member: exact } : findVariantKey(byName, key);
    if (existing) byName.set(existing.key, combine(existing.member, member));
    else byName.set(key, member);
  }

  return [...byName.values()];
}

/**
 * Combine two records of the same member, keeping the richest fields.
 */
function combine(primary: BandMember, secondary: BandMember): BandMember {
  return {
    begin: primary.begin ?? secondary.begin,
    end: primary.end ?? secondary.end,
    ended: primary.ended || secondary.ended,
    id: primary.id,
    instruments: [...new Set([...primary.instruments, ...secondary.instruments])],
    name: primary.name.length >= secondary.name.length ? primary.name : secondary.name,
  };
}

/**
 * Find an already-merged member whose name is a variant of `key`.
 */
function findVariantKey(
  byName: Map<string, BandMember>,
  key: string,
): { key: string; member: BandMember } | null {
  for (const [existingKey, member] of byName) {
    if (isNameVariant(existingKey, key)) return { key: existingKey, member };
  }
  return null;
}

/**
 * Same surname and a compatible first name: one spelling shortens the other
 * ("Matt"/"Matthew") or is an initial ("M."/"Matthew"). Sources disagree on
 * given names often enough that exact matching alone leaves the same person
 * twice on the timeline.
 */
function isNameVariant(a: string, b: string): boolean {
  const left = a.split(" ");
  const right = b.split(" ");
  if (left.length < 2 || right.length < 2) return false;
  if (left.at(-1) !== right.at(-1)) return false;
  // Middle names are dropped by one source or the other, so only compare the first token
  const [first] = left;
  const [other] = right;
  return first.startsWith(other) || other.startsWith(first);
}

/**
 * Normalize a member name for cross-source matching (case/accent/punctuation-insensitive).
 */
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip combining diacritics
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
