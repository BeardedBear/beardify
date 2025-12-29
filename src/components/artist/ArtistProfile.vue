<template>
  <div class="profile-container">
    <div class="profile-wrapper" :class="{ visible: artistStore.discogsArtist?.profile }">
      <span class="profile-text" :title="trimmedProfile === fullProfile ? undefined : fullProfile">
        <strong>{{ artistMetas?.disambiguation }}</strong>
        from
        <strong>{{ artistMetas?.["begin-area"]?.name }}</strong>
        {{ artistMetas?.country }} -
        <span v-if="artistMetas?.['life-span']?.begin">{{ artistMetas?.["life-span"]?.begin }}/</span>
        {{ artistMetas?.["life-span"]?.ended ? "inactive" : "active" }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { parseDiscogsMarkup } from "@/helpers/discogs";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const fullProfile = computed(() => artistStore.discogsArtist?.profile ?? "");

const trimmedProfile = computed(() => {
  if (!fullProfile.value) return "";
  const maxLength = 120;
  const cleanText = fullProfile.value.replace(/\s+/g, " ").trim();
  const trimmedText = cleanText.length > maxLength ? cleanText.slice(0, maxLength).trimEnd() + "…" : cleanText;
  return parseDiscogsMarkup(trimmedText);
});

const artistMetas = computed(() => artistStore.musicbrainzArtist);
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
</style>
