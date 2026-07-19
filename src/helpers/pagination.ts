import { Paging } from "@/@types/Paging";

/**
 * Recursively follows a paginated Spotify response's `next` cursor and concatenates all pages.
 */
export async function fetchAllPages<T>(fetchPage: (url: string) => Promise<Paging<T>>, url: string): Promise<T[]> {
  const page = await fetchPage(url);
  const rest = page.next ? await fetchAllPages(fetchPage, page.next) : [];
  return page.items.concat(rest);
}
