import { describe, expect, it } from "vitest";

import { Setlist } from "@/@types/Setlistfm";
import { TicketmasterEvent } from "@/@types/Ticketmaster";
import { splitConcerts } from "@/helpers/concerts";

const setlist = (id: string, eventDate: string): Setlist => ({
  eventDate,
  id,
  sets: { set: [] },
  url: "https://www.setlist.fm/",
  venue: { name: id },
});

const event = (id: string, localDate: string): TicketmasterEvent => ({
  dates: { start: { localDate } },
  id,
  name: id,
  url: "https://www.ticketmaster.com/",
});

describe("splitConcerts", () => {
  const now = new Date(2026, 9, 29, 23, 30);

  it("treats today and later as upcoming, earlier as past", () => {
    const { past, upcoming } = splitConcerts(
      [],
      [setlist("next", "05-01-2027"), setlist("today", "29-10-2026"), setlist("yesterday", "28-10-2026")],
      now,
    );
    expect(upcoming.map((concert) => concert.id)).toEqual(["today", "next"]);
    expect(past.map((concert) => concert.id)).toEqual(["yesterday"]);
  });

  it("drops a setlist.fm announcement when Ticketmaster has the same date", () => {
    const { upcoming } = splitConcerts([event("tm", "2026-12-01")], [setlist("sfm", "01-12-2026")], now);
    expect(upcoming.map((concert) => concert.id)).toEqual(["tm"]);
  });

  it("interleaves both sources by date", () => {
    const { upcoming } = splitConcerts(
      [event("tm-late", "2027-03-01")],
      [setlist("sfm-early", "01-11-2026")],
      now,
    );
    expect(upcoming.map((concert) => concert.id)).toEqual(["sfm-early", "tm-late"]);
  });
});
