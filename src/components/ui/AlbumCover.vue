<template>
  <img :alt="alt" :src="failed ? PLACEHOLDER : source" loading="lazy" @error="failed = true" />
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";

import { Image, ImageSize } from "@/@types/Image";
import { coverUrl } from "@/helpers/cover";

const PLACEHOLDER = "/img/default.png";

/*
 * `alt` defaults to empty on purpose. At all thirteen call sites this cover sits
 * directly beside its own visible label — the album title, the artist, the
 * playlist name — so a filled alt would make a screen reader read every entry
 * twice. Empty alt is the correct answer for an image the adjacent text already
 * names; pass `alt` explicitly for the rare cover that stands alone.
 *
 * Deliberately no width/height attributes. They look like free CLS insurance,
 * but they are presentation hints, and the thirteen call sites size this image
 * in every combination there is — some width only, some height only
 * (TopTracks's .cover is 1.7rem tall and nothing else), some both. A hint the
 * caller doesn't override then applies literally and stretches the artwork. The
 * album grid, the one place the reflow was worth fixing, gets its box reserved
 * by the `aspect-ratio` below instead, which no caller has to know about.
 */
const props = withDefaults(
  defineProps<{
    alt?: string;
    images: Image[] | null;
    size: ImageSize;
  }>(),
  { alt: "" },
);

const source = computed(() => coverUrl(props.images, props.size));

/*
 * `coverUrl` can only check that a URL exists, not that it resolves. That was
 * enough while every cover came from Spotify, which does not hand out dead ones;
 * the releases feed also carries Cover Art Archive URLs, built from a release-group
 * id without a lookup, and roughly a third of those 404. A broken-image glyph in
 * the middle of a list is worse than the placeholder every other empty cover uses.
 */
const failed = ref(false);
watch(source, () => (failed.value = false));
</script>

<style scoped>
/*
 * This rule reads as dead — nothing in this template carries `class="img"` —
 * but it is not: a child component's root element receives the classes the
 * parent puts on the tag, so `<Cover class="img" />` in AlbumIndex lands here.
 * It is what keeps the album grid square and reserves each cell before the
 * image loads. Removing it as "unused" is exactly the mistake it invites.
 */
.img {
  aspect-ratio: 1 / 1;
  border-radius: var(--bd-radius-sm);
  cursor: pointer;
  display: block;
  transition: opacity var(--bd-duration) ease;
  width: 100%;
}
</style>
