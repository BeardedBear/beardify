import { ImageSize } from "@/@types/Image";

/** Spotify returns its renditions largest-first: 640, 300, 64. */
const INDEXES: Record<ImageSize, number> = { large: 0, medium: 1, small: 2 };

/**
 * Picks a cover URL without assuming the rendition exists.
 *
 * Spotify does not always return three images — a single-image album, a user
 * with no avatar, a podcast episode with one artwork are all normal — yet the
 * app kept indexing `images[1]` and `images[2]` directly and threw on render.
 * It is the same crash three times over, so the guard lives here rather than at
 * each call site.
 *
 * Falls back *upwards* to a larger rendition when the requested one is missing:
 * bigger and present beats correct and absent.
 * @param images - Spotify's image array, in any state
 * @param size - Preferred rendition
 */
export function coverUrl(images: { url: string }[] | null | undefined, size: ImageSize = "medium"): string {
  if (!images?.length) return "/img/default.png";

  for (let index = INDEXES[size]; index >= 0; index--) {
    const url = images[index]?.url;
    if (url) return url;
  }

  return "/img/default.png";
}
