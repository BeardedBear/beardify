<template>
  <div class="profile-wrapper" v-if="artistStore.discogsArtist?.profile">
    <span class="profile-text" v-html="firstSentence" />
    <div class="more-button" v-if="hasMoreContent">
      <i class="icon-more-horizontal" />
      <div class="full-profile" v-html="formattedProfile" />
    </div>
  </div>
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
const DISCOGS_ENTITIES: Record<string, { path: string; searchType: string; text: string }> = {
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

/**
 * Extract the first sentence from text
 */
function getFirstSentence(text: string): string {
  // Match first sentence ending with . ! or ? followed by space or end of string
  const match = text.match(/^[^.!?]*[.!?]/);
  return match ? match[0] : text;
}

const formattedProfile = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  return parseDiscogsMarkup(artistStore.discogsArtist.profile);
});

const firstSentence = computed(() => {
  if (!artistStore.discogsArtist?.profile) return "";
  const first = getFirstSentence(artistStore.discogsArtist.profile);
  return parseDiscogsMarkup(first);
});

const hasMoreContent = computed(() => {
  if (!artistStore.discogsArtist?.profile) return false;
  const first = getFirstSentence(artistStore.discogsArtist.profile);
  return artistStore.discogsArtist.profile.length > first.length;
});
</script>

<style lang="scss" scoped>
.profile-wrapper {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  max-width: 60rem;
  position: relative;
}

.profile-text {
  color: var(--font-color-light);
  font-size: 0.9rem;
  line-height: 1.4;
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

.full-profile {
  background-color: var(--bg-color);
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgb(0 0 0 / 20%);
  color: var(--font-color-light);
  font-size: 0.9rem;
  left: 50%;
  line-height: 1.6;
  max-height: 300px;
  max-width: 600px;
  min-width: 300px;
  opacity: 0;
  overflow-y: auto;
  padding: 1.2rem;
  pointer-events: none;
  position: absolute;
  top: calc(100%);
  transform: translateX(-50%);
  transition:
    opacity 0.2s,
    visibility 0.2s;
  visibility: hidden;
  z-index: 100;

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

.more-button {
  background-color: var(--bg-color-dark);
  border-radius: 0.3rem;
  color: var(--font-color-light);
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1rem;
  height: 1.5rem;
  opacity: 0.6;
  padding: 0.2rem 0.4rem;
  position: relative;

  &:hover {
    opacity: 1;

    .full-profile {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
    }
  }
}
</style>
