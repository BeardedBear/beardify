import { describe, expect, it } from "vitest";

import type { BandMember } from "@/@types/Artist";

import { mergeBandMembers } from "./bandMembers";

const member = (name: string, extra: Partial<BandMember> = {}): BandMember => ({
  begin: null,
  end: null,
  ended: false,
  id: name,
  instruments: [],
  name,
  ...extra,
}) as BandMember;

/*
 * Members arrive from MusicBrainz and Wikipedia at once, spelled differently and
 * with different halves of the story. Merging badly either duplicates a person
 * in the timeline or drops the instrument that made them worth listing.
 */
describe("mergeBandMembers", () => {
  it("keeps one entry per person across both sources", () => {
    expect(mergeBandMembers([member("Thom Yorke")], [member("Thom Yorke")])).toHaveLength(1);
  });

  it("matches through case, punctuation and combining diacritics", () => {
    expect(mergeBandMembers([member("Beyoncé")], [member("beyonce")])).toHaveLength(1);
    expect(mergeBandMembers([member("Jean-Michel Jarre")], [member("Jean Michel Jarre")])).toHaveLength(1);
  });

  /*
   * Documenting a real limit rather than pretending it away: normalisation
   * strips combining marks, so é folds onto e — but a standalone letter like
   * eth (ð) is not a decomposable accent and becomes a separator instead.
   * "Björk Guðmundsdóttir" therefore does not merge with the ascii spelling.
   * Nordic names are rare enough here that the fix has not been worth it; this
   * is the line to change when it is.
   */
  it("does not fold standalone non-ascii letters such as eth", () => {
    expect(mergeBandMembers([member("Björk Guðmundsdóttir")], [member("bjork gudmundsdottir")])).toHaveLength(2);
  });

  it("unions the instruments instead of picking a side", () => {
    const merged = mergeBandMembers(
      [member("Thom Yorke", { instruments: ["vocals"] })],
      [member("Thom Yorke", { instruments: ["guitar", "vocals"] })],
    );
    expect(merged[0].instruments.sort()).toEqual(["guitar", "vocals"]);
  });

  it("fills a missing date from the other source", () => {
    const merged = mergeBandMembers(
      [member("Thom Yorke", { begin: null, end: null })],
      [member("Thom Yorke", { begin: "1985", end: "1990" })],
    );
    expect(merged[0].begin).toBe("1985");
    expect(merged[0].end).toBe("1990");
  });

  it("lets the primary source win on a date it actually has", () => {
    const merged = mergeBandMembers(
      [member("Thom Yorke", { begin: "1985" })],
      [member("Thom Yorke", { begin: "1986" })],
    );
    expect(merged[0].begin).toBe("1985");
  });

  it("keeps the primary source's id when the two merge", () => {
    // Downstream lookups key off this id, so it has to be the stable one.
    const merged = mergeBandMembers(
      [member("Jean-Michel Jarre", { id: "mb-1" })],
      [member("Jean Michel Jarre", { id: "wiki-2" })],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("mb-1");
  });

  it("leaves two genuinely different people alone", () => {
    expect(mergeBandMembers([member("Thom Yorke")], [member("Jonny Greenwood")])).toHaveLength(2);
  });

  it("treats a departure reported by either source as a departure", () => {
    const merged = mergeBandMembers([member("X", { ended: false })], [member("X", { ended: true })]);
    expect(merged[0].ended).toBe(true);
  });

  it("skips an entry whose name normalises to nothing", () => {
    expect(mergeBandMembers([member("---")], [])).toHaveLength(0);
  });

  it("handles either side being empty", () => {
    expect(mergeBandMembers([], [])).toEqual([]);
    expect(mergeBandMembers([member("Thom Yorke")], [])).toHaveLength(1);
    expect(mergeBandMembers([], [member("Thom Yorke")])).toHaveLength(1);
  });
});
