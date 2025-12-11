<template>
  <div class="album-group">
    <div :class="{ 'is-expanded': isExpanded, 'has-variants': group.variants.length > 0 }" class="album-group-wrapper">
      <div class="album-group-main">
        <Album
          :album="group.baseAlbum"
          :can-delete="canDelete"
          :can-save="canSave"
          :cover-size="coverSize"
          :exact-search="exactSearch"
          :with-artists="withArtists"
          :without-metas="withoutMetas"
          :without-release-date="withoutReleaseDate"
        />
        <div v-if="group.variants.length > 0" class="album-group-stack-indicator" @click="handleMainClick">
          <div class="album-group-stack-layer album-group-stack-layer--1"></div>
          <div class="album-group-stack-layer album-group-stack-layer--2">+{{ group.variants.length }}</div>
          <!-- <div class="album-group-count">+{{ group.variants.length }}</div> -->
        </div>
      </div>

      <Transition name="variants-expand">
        <div
          v-if="isExpanded && group.variants.length > 0"
          class="album-group-variants-overlay"
          @click.self="isExpanded = false"
        >
          <div class="album-group-variants">
            <div class="album-group-variant">
              <Album
                :album="group.baseAlbum"
                :can-delete="canDelete"
                :can-save="canSave"
                :cover-size="coverSize"
                :exact-search="exactSearch"
                :with-artists="withArtists"
                :without-metas="withoutMetas"
                :without-release-date="withoutReleaseDate"
              />
            </div>
            <div :key="variant.id" v-for="variant in group.variants" class="album-group-variant">
              <Album
                :album="variant"
                :can-delete="canDelete"
                :can-save="canSave"
                :cover-size="coverSize"
                :exact-search="exactSearch"
                :with-artists="withArtists"
                :without-metas="withoutMetas"
                :without-release-date="withoutReleaseDate"
              />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

import { ImageSize } from "@/@types/Image";
import Album from "@/components/album/AlbumIndex.vue";
import { AlbumGroup } from "@/helpers/groupAlbumVariants";

defineProps<{
  canDelete?: boolean;
  canSave?: boolean;
  coverSize?: ImageSize | undefined;
  exactSearch?: boolean;
  group: AlbumGroup;
  withArtists?: boolean;
  withoutMetas?: boolean;
  withoutReleaseDate?: boolean;
}>();

const isExpanded = ref(false);

function handleMainClick(): void {
  if (isExpanded.value) {
    isExpanded.value = false;
  } else {
    isExpanded.value = true;
  }
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;


.album-group-main {
  position: relative;
}

.album-group-wrapper {
  &.has-variants {
    .album-group-main {
      cursor: pointer;
    }
  }
}

.album-group-stack-indicator {
  cursor: pointer;
  left: 0.5rem;
  position: absolute;
  top: 0.5rem;
  z-index: 10;
}

.album-group-stack-layer {
  --offset : 0.3rem;

  background: var(--bg-color-light);
  border: 0.1rem solid var(--bg-color-lighter);
  border-radius: 0.3rem;
  box-shadow: 0 0.2rem 0.4rem rgb(0 0 0 / 30%);
  font-size: 0.8rem;
  font-weight: bold;
  height: 1.5rem;
  position: absolute;
  width: 1.5rem ;

  &--1 {
    left: calc(var(--offset) - 0.3rem);
    top: calc(var(--offset) - 0.3rem);
  }

  &--2 {
    align-items: center;
    display: flex;
    justify-content: center;
    left: calc(var(--offset) - 0.6rem);
    top: calc(var(--offset) - 0.6rem);
  }
}

.album-group-variants-overlay {
  align-items: flex-start;
  backdrop-filter: blur(0.3rem);
  background: rgb(0 0 0 / 70%);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 2rem;
  position: absolute;
  z-index: 100;
}

.album-group-variants {
  background: var(--bg-color-dark);
  border: 0.2rem solid var(--primary-color);
  border-radius: 0.8rem;
  box-shadow: 0 1rem 3rem rgb(0 0 0 / 50%);
  display: grid;
  gap: 1.2rem;
  grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
  max-height: 90vh;
  max-width: 80rem;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
}

.album-group-variant {
  animation: fade-in-variant 0.3s ease both;
}

@keyframes fade-in-variant {
  from {
    opacity: 0;
    transform: scale(0.9);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

// Transition for variants expansion
.variants-expand-enter-active {
  transition: all 0.3s ease;
}

.variants-expand-leave-active {
  transition: all 0.2s ease;
}

.variants-expand-enter-from,
.variants-expand-leave-to {
  opacity: 0;

  .album-group-variants {
    transform: scale(0.9) translateY(-2rem);
  }
}

.variants-expand-enter-to,
.variants-expand-leave-from {
  opacity: 1;

  .album-group-variants {
    transform: scale(1) translateY(0);
  }
}
</style>
