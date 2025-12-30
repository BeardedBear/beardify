<template>
  <div class="profile-container">
    <div class="profile-wrapper" :class="{ visible: artistMetas }">
      <template v-if="artistTags && artistTags.length > 0">
        <span>
          <span v-for="value in artistTags.slice(0, 5)" class="tag">
            {{ typeof value === 'string' ? value : value.name }}
          </span>
        </span>
        <span>·</span>
      </template>
      <template v-if="artistMetas?.area || artistMetas?.country">
        <span :title="artistMetas?.area?.name || artistMetas?.country">
          <img
            v-if="artistMetas?.country"
            :src="getCountryFlagUrl(artistMetas.country)"
            :alt="artistMetas?.area?.name || artistMetas?.country"
            class="country-flag"
          />
          <strong>{{ artistMetas?.["begin-area"]?.name }}</strong>
        </span>
        <span>·</span>
      </template>
      <span>
        <template v-if="artistMetas?.['life-span']?.begin">
          <span>{{ artistMetas?.["life-span"]?.begin }}</span>
          <span>/</span>
        </template>
        <span v-if="artistMetas?.['life-span']?.ended || artistMetas?.['life-span']?.begin">
          <span>{{ artistMetas?.["life-span"]?.ended ? "Inactive" : "Active" }}</span>
        </span>
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const artistMetas = computed(() => artistStore.musicbrainzArtist);
const artistTags = computed(() => artistMetas.value?.tags || artistStore.artist.genres);


/**
 * Get flag image URL from ISO country code
 * @param countryCode - ISO 3166-1 alpha-2 country code (e.g., "GB", "US", "FR")
 * @returns Flag image URL
 */
function getCountryFlagUrl(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) {
    return "";
  }

  // Use local flag-icons package for square flags (1x1 aspect ratio)
  // Convert to lowercase as required by the package
  const code = countryCode.toLowerCase();

  // In development, serve from node_modules
  // In production, files are copied to /flags/ by vite-plugin-static-copy
  if (import.meta.env.DEV) {
    return `/node_modules/flag-icons/flags/4x3/${code}.svg`;
  }
  return `/flags/${code}.svg`;
}
</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;

$transition-duration: 0.2s;

.profile-container {
  font-size: 0.75rem;
  font-weight: bold;
  margin-top: 0.5rem;
  min-height: 1.5rem; // Reserve space for the text line height
}

.tag  {
  background-color: rgb(255 255 255 / 10%);
  border-radius: 0.25rem;
  margin-right: 0.25rem;
  padding: 0.1rem 0.3rem;
  text-transform: capitalize;
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

.country-flag {
  display: inline-block;
  height: 0.8em;
  margin: 0 0.3rem;
  width: auto;
}
</style>
