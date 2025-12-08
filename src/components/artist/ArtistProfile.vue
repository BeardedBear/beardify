<template>
  <div class="profile" v-if="artistStore.discogsArtist?.profile" v-html="formattedProfile" />
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

/**
 * Parse Discogs markup and convert to HTML
 * Supported tags:
 * - [i]text[/i] -> <em>text</em> (italic)
 * - [b]text[/b] -> <strong>text</strong> (bold)
 * - [u]text[/u] -> <u>text</u> (underline)
 * - [a123456] -> link to Discogs artist
 * - [l123456] -> link to Discogs label
 * - [r123456] -> link to Discogs release
 * - [m123456] -> link to Discogs master release
 * - [url=...]text[/url] -> <a href="...">text</a>
 * - [url]...[/url] -> <a href="...">...</a>
 */
function parseDiscogsMarkup(text: string): string {
  let result = text;

  // Escape HTML to prevent XSS
  result = result.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // [i]text[/i] -> <em>text</em>
  result = result.replace(/\[i\](.*?)\[\/i\]/gi, "<em>$1</em>");

  // [b]text[/b] -> <strong>text</strong>
  result = result.replace(/\[b\](.*?)\[\/b\]/gi, "<strong>$1</strong>");

  // [u]text[/u] -> <u>text</u>
  result = result.replace(/\[u\](.*?)\[\/u\]/gi, "<u>$1</u>");

  // [a123456] or [a=123456] -> link to Discogs artist (by ID)
  result = result.replace(
    /\[a=?(\d+)\]/gi,
    '<a href="https://www.discogs.com/artist/$1" target="_blank" rel="noopener noreferrer" class="discogs-link">artist</a>',
  );

  // [a=Artist Name] -> link to Discogs artist search (by name)
  result = result.replace(
    /\[a=([^\]]+)\]/gi,
    '<a href="https://www.discogs.com/search/?q=$1&type=artist" target="_blank" rel="noopener noreferrer" class="discogs-link">$1</a>',
  );

  // [l123456] or [l=123456] -> link to Discogs label (by ID)
  result = result.replace(
    /\[l=?(\d+)\]/gi,
    '<a href="https://www.discogs.com/label/$1" target="_blank" rel="noopener noreferrer" class="discogs-link">label</a>',
  );

  // [l=Label Name] -> link to Discogs label search (by name)
  result = result.replace(
    /\[l=([^\]]+)\]/gi,
    '<a href="https://www.discogs.com/search/?q=$1&type=label" target="_blank" rel="noopener noreferrer" class="discogs-link">$1</a>',
  );

  // [r123456] or [r=123456] -> link to Discogs release (by ID)
  result = result.replace(
    /\[r=?(\d+)\]/gi,
    '<a href="https://www.discogs.com/release/$1" target="_blank" rel="noopener noreferrer" class="discogs-link">release</a>',
  );

  // [m123456] or [m=123456] -> link to Discogs master release (by ID)
  result = result.replace(
    /\[m=?(\d+)\]/gi,
    '<a href="https://www.discogs.com/master/$1" target="_blank" rel="noopener noreferrer" class="discogs-link">release</a>',
  );

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
