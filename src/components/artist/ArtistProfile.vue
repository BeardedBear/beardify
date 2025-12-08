<template>
  <div class="profile" v-if="artistStore.discogsArtist?.profile" v-html="formattedProfile" />
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

const DISCOGS_BASE_URL = "https://www.discogs.com";
const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer" class="discogs-link"';

/**
 * Discogs entity types configuration
 * Maps entity type letter to URL path and display text
 */
const DISCOGS_ENTITIES: Record<string, { path: string; text: string; searchType: string }> = {
  a: { path: "artist", searchType: "artist", text: "artist" },
  l: { path: "label", searchType: "label", text: "label" },
  m: { path: "master", searchType: "master", text: "release" },
  r: { path: "release", searchType: "release", text: "release" },
};

/**
 * Text formatting tags configuration
 */
const TEXT_FORMATS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\[i\](.*?)\[\/i\]/gi, replacement: "<em>$1</em>" },
  { pattern: /\[b\](.*?)\[\/b\]/gi, replacement: "<strong>$1</strong>" },
  { pattern: /\[u\](.*?)\[\/u\]/gi, replacement: "<u>$1</u>" },
];

/**
 * Create a Discogs link by ID
 */
function createDiscogsLinkById(type: string, id: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}${id}]`;
  return `<a href="${DISCOGS_BASE_URL}/${entity.path}/${id}" ${LINK_ATTRS}>${entity.text}</a>`;
}

/**
 * Create a Discogs search link by name
 */
function createDiscogsSearchLink(type: string, name: string): string {
  const entity = DISCOGS_ENTITIES[type.toLowerCase()];
  if (!entity) return `[${type}=${name}]`;
  return `<a href="${DISCOGS_BASE_URL}/search/?q=${encodeURIComponent(name)}&type=${entity.searchType}" ${LINK_ATTRS}>${name}</a>`;
}

/**
 * Parse Discogs markup and convert to HTML
 * Supported tags:
 * - [i], [b], [u] -> text formatting
 * - [a], [l], [r], [m] -> Discogs entity links (by ID or name)
 * - [url] -> external links
 */
function parseDiscogsMarkup(text: string): string {
  let result = text;

  // Escape HTML to prevent XSS
  result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // Apply text formatting
  for (const { pattern, replacement } of TEXT_FORMATS) {
    result = result.replace(pattern, replacement);
  }

  // [x123456] or [x=123456] -> link to Discogs entity by ID
  result = result.replace(/\[([almr])=?(\d+)\]/gi, (_, type, id) => createDiscogsLinkById(type, id));

  // [x=Name] -> link to Discogs search by name (non-numeric)
  result = result.replace(/\[([al])=([^\]]+)\]/gi, (_, type, name) => createDiscogsSearchLink(type, name));

  // [url=http://...]text[/url] -> <a href="...">text</a>
  result = result.replace(
    /\[url=(.*?)\](.*?)\[\/url\]/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  );

  // [url]http://...[/url] -> <a href="...">...</a>
  result = result.replace(/\[url\](.*?)\[\/url\]/gi, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

  return result;
}

const formattedProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  return parseDiscogsMarkup(artistStore.discogsArtist.profile);
});
</script>

<style lang="scss" scoped>
.profile {
  color: var(--font-color-light);
  font-size: 0.9rem;
  line-height: 1.4;
  margin-top: 0.5rem;
  max-width: 60rem;
  opacity: 0.5;

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(em) {
    font-style: italic;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(strong) {
    font-weight: bold;
  }

  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(.discogs-link),
  /* stylelint-disable-next-line selector-pseudo-class-no-unknown */
  :deep(a) {
    color: var(--primary-color-light);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
