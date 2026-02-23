<template>
  <div class="profile-container">
    <div class="profile-wrapper" :class="{ visible: artistMetas }">
      <template v-if="artistTags && artistTags.length > 0">
        <span class="tag-list">
          <span v-for="(value, index) in artistTags.slice(0, 5)" :key="index" class="tag">
            {{ typeof value === "string" ? value : value.name }}
          </span>
        </span>
      </template>
      <template v-else-if="artistMetas?.disambiguation">
        <span class="disambiguation">{{ artistMetas.disambiguation }}</span>
      </template>
      <template v-if="artistMetas?.country">
        <span class="dot desktop-only">·</span>
        <Tooltip :text="getCountry" placement="bottom">
          <img :src="getCountryFlagUrl(artistMetas.country)" :alt="artistMetas?.area?.name || artistMetas?.country"
            class="country-flag" />
          <strong>
            {{ artistMetas?.["begin-area"]?.name || artistMetas?.area?.name }}
          </strong>
        </Tooltip>
      </template>
      <template v-else-if="artistMetas?.['begin-area']?.name || artistMetas?.area?.name">
        <span class="dot desktop-only">·</span>
        {{ artistMetas?.["begin-area"]?.name || artistMetas?.area?.name }}
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

import Tooltip from "@/components/ui/Tooltip.vue";
import { getCountryFlagUrl, getCountryName } from "@/helpers/country";
import { formatDate } from "@/helpers/date";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();
const artistMetas = computed(() => artistStore.musicbrainzArtist);
const artistTags = computed(() => artistMetas.value?.tags || artistStore.artist.genres);
const getCountry = computed(() => {
  const countryName = getCountryName(artistMetas.value?.country);
  const artistCountry = artistMetas.value?.["begin-area"]?.name || artistMetas.value?.area?.name;
  return countryName !== artistCountry ? countryName : "";
});

</script>

<style lang="scss" scoped>
@use "@/assets/scss/responsive" as responsive;
@use "@/assets/scss/mixins" as *;

$transition-duration: 0.2s;

.profile-container {
  font-size: var(--font-size-sm);

  @include font-bold;

  margin-top: 0.5rem;
  min-height: 1.5rem;
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

.disambiguation {
  opacity: 0.6;
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
