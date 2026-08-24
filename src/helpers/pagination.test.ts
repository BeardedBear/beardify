import { describe, expect, it, vi } from "vitest";

import type { Paging } from "@/@types/Paging";

import { fetchAllPages } from "./pagination";

const page = <T>(items: T[], next: null | string): Paging<T> => ({ items, next }) as Paging<T>;

/*
 * Every long list in the app — a collection's tracks, a discography, a device's
 * queue — comes through here. Stopping a page early silently truncates a
 * collection, which then looks like albums went missing.
 */
describe("fetchAllPages", () => {
  it("walks every page and concatenates in order", async () => {
    const pages: Record<string, Paging<number>> = {
      "/1": page([1, 2], "/2"),
      "/2": page([3, 4], "/3"),
      "/3": page([5], null),
    };

    expect(await fetchAllPages((url) => Promise.resolve(pages[url]), "/1")).toEqual([1, 2, 3, 4, 5]);
  });

  it("stops after one page when there is no next", async () => {
    const fetchPage = vi.fn().mockResolvedValue(page([1], null));
    expect(await fetchAllPages(fetchPage, "/1")).toEqual([1]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it("returns an empty list for an empty first page", async () => {
    expect(await fetchAllPages(() => Promise.resolve(page([], null)), "/1")).toEqual([]);
  });

  it("does not swallow a rejection mid-walk", async () => {
    // A truncated collection that looks complete is worse than a visible error.
    const fetchPage = vi
      .fn()
      .mockResolvedValueOnce(page([1], "/2"))
      .mockRejectedValueOnce(new Error("network"));

    await expect(fetchAllPages(fetchPage, "/1")).rejects.toThrow("network");
  });
});
