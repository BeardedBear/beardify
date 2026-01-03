<template>
  <div class="profile-container">
    <div class="profile-wrapper" :class="{ visible: artistMetas }">
      <span v-if="artistTags && artistTags.length > 0" class="tag-list">
        <span v-for="value in artistTags.slice(0, 5)" class="tag">
          {{ typeof value === "string" ? value : value.name }}
        </span>
      </span>
      <template v-if="artistMetas?.area || artistMetas?.country">
        <span class="dot desktop-only">·</span>
        <span :title="artistMetas?.area?.name || artistMetas?.country">
          <img
            v-if="artistMetas?.country"
            :src="getCountryFlagUrl(artistMetas.country)"
            :alt="artistMetas?.area?.name || artistMetas?.country"
            class="country-flag"
          />
          <strong>{{ artistMetas?.["begin-area"]?.name }}</strong>
        </span>
      </template>
      <template v-if="artistMetas?.['life-span']?.begin">
        <span class="dot">·</span>
        <span>
          <template v-if="artistMetas.type === 'Person'">
            <span v-if="artistMetas.type === 'Person'">Born {{ formatDate(artistMetas?.["life-span"]?.begin) }}</span>
            <span v-if="artistMetas?.['life-span']?.end">/ Died {{ formatDate(artistMetas?.["life-span"]?.end) }}</span>
          </template>
          <template v-else>
            <span>{{ artistMetas?.["life-span"]?.begin.split("-")[0] }}</span>
            <span v-if="!artistMetas['life-span'].end">
              {{ artistMetas?.["life-span"]?.ended ? " / Inactive" : " / Active" }}
            </span>
            <span v-else>&nbsp;/ {{ artistMetas["life-span"].end?.split("-")[0] }}</span>
          </template>
        </span>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { formatDate } from "@/helpers/date";
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
@use "@/assets/scss/mixins" as *;

$transition-duration: 0.2s;

.profile-container {
  font-size: 0.75rem;

  @include font-bold;

  margin-top: 0.5rem;
  min-height: 1.5rem; // Reserve space for the text line height
}

.tag-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 0.25rem;

  @include responsive.mobile {
    display: block;
    margin-bottom: 0.5rem;
  }
}

.tag {
  background-color: rgb(255 255 255 / 10%);
  border-radius: 0.25rem;
  display: inline-block;
  padding: 0.1rem 0.3rem;
  text-transform: capitalize;

  @include responsive.mobile {
    margin: 0 0.25rem 0.25rem 0;
  }
}

.dot {
  margin: 0 1rem;

  @include responsive.mobile {
    margin: 0 0.5rem;
  }

  &.desktop-only {
    @include responsive.mobile {
      display: none;
    }
  }
}

.profile-wrapper {
  align-items: center;
  display: flex;
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

  @include responsive.mobile {
    display: block;
  }
}

.country-flag {
  border-radius: 0.1rem;
  display: inline-block;
  height: 0.8em;
  margin: 0 0.3rem 0 0;
  width: auto;
}
</style>
