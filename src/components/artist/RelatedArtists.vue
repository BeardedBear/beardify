<template>
  <div v-if="artistStore.relatedArtists.artists.length">
    <div :style="{ top: artistStore.headerHeight + 'px' }" class="bd-heading sticky-heading">Similar artists</div>
    <div class="list">
      <BdTooltip
        v-for="(artist, index) in artistStore.relatedArtists.artists"
        :key="index"
        :content="artist.name"
        :disabled="truncatedId !== artist.id"
        bare
      >
        <router-link
          :to="`/artist/${artist.id}`"
          class="item bd-font-bold"
          @focus="checkTruncated($event, artist.id)"
          @mouseenter="checkTruncated($event, artist.id)"
        >
          <Cover :images="artist.images" class="image" size="small" />
          <div class="name">
            {{ artist.name }}
          </div>
        </router-link>
      </BdTooltip>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { BdTooltip } from "bearded-ui";
import { ref } from "vue";
import { RouterLink } from "vue-router";

import Cover from "@/components/ui/AlbumCover.vue";
import { useArtist } from "@/views/artist/ArtistStore";

const artistStore = useArtist();

/** Artist whose name is clamped, measured on hover or focus — before the tooltip delay runs out. */
const truncatedId = ref<null | string>(null);

function checkTruncated(event: Event, id: string): void {
  const name = (event.currentTarget as HTMLElement).querySelector(".name");
  truncatedId.value = name && name.scrollHeight > name.clientHeight ? id : null;
}
</script>

<style scoped>

.image {
  --image-size: 3rem;

  border-radius: var(--image-size);
  display: block;
  height: var(--image-size);
  margin: 0 auto var(--bd-space-2);
  object-fit: cover;
  width: var(--image-size);
}

.item {
  border-radius: var(--bd-radius-sm);
  color: currentcolor;
  cursor: pointer;
  padding: var(--bd-space-3);
  text-align: center;
  text-decoration: none;

  &:hover {
    background-color: var(--bd-hover-overlay);
  }

  &:active {
    background-color: var(--bd-bg-light);
  }
}

.name {
  -webkit-box-orient: vertical;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.list {
  display: grid;

  /* 3 columns in the 20rem sidebar, more once the column goes full width (--xl, mobile). */
  grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
}
</style>
