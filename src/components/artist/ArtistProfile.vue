<template>
  <div class="profile-container">
    <div class="profile-wrapper" :class="{ visible: artistStore.discogsArtist?.profile }">
      <span class="profile-text" v-html="firstSentence" />
      <div class="more-button" v-if="hasMoreContent">
        <i class="icon-more-horizontal" />
        <div class="full-profile" v-html="formattedProfile" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { parseDiscogsMarkup } from "@/helpers/discogs";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

/**
 * Extract the first sentence from text, but limit to max characters
 */
function getFirstSentence(text: string, maxLength = 120): string {
  // Remove all line breaks and normalize whitespace
  const cleanText = text.replace(/\s+/g, " ").trim();

  // Match first sentence ending with . ! or ? followed by space or end of string
  const match = cleanText.match(/^[^.!?]*[.!?]/);
  const firstSentence = match ? match[0] : cleanText;

  // If first sentence is within limit, return it
  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Otherwise truncate at maxLength and add ellipsis
  return cleanText.slice(0, maxLength).trim() + "…";
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
@use "@/assets/scss/responsive" as responsive;

$transition-duration: 0.2s;

.profile-container {
  min-height: 1.5rem; // Reserve space for the text line height
}

.profile-wrapper {
  align-items: center;
  display: flex;
  gap: 0.5rem;
  max-width: 60rem;
  min-height: 0;
  opacity: 0;
  position: relative;
  transform: translateY(-5px);
  transition:
    opacity $transition-duration ease,
    transform $transition-duration ease;
  z-index: 1;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
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
  transform: translateX(-50%) translateY(-5px);

  @include responsive.mobile {
    left: auto;
    max-width: 85vw;
    min-width: unset;
    right: 0;
    transform: translateY(-5px);
  }

  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
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
  background-color: var(--bg-color);
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
      transform: translateX(-50%) translateY(0);
      visibility: visible;
    }
  }
}
</style>
