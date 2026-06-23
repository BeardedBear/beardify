import type { BandMember } from "@/@types/Artist";

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
    const existing = byName.get(key);
    byName.set(key, existing ? combine(existing, member) : member);
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
