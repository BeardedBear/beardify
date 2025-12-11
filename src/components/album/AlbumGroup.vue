<template>
  <div class="album-group">
    <div class="album-group-wrapper">
      <div class="album-group-main">
        <Album
          :album="displayAlbum"
          :can-delete="canDelete"
          :can-save="canSave"
          :cover-size="coverSize"
          :exact-search="exactSearch"
          :with-artists="withArtists"
          :without-metas="withoutMetas"
          :without-release-date="withoutReleaseDate"
        />
        <div v-if="group.variants.length > 0" class="album-group-stack-indicator" @click="openVariantsDialog">
          <div class="album-group-stack-layer album-group-stack-layer-1"></div>
          <div class="album-group-stack-layer album-group-stack-layer-2">{{ group.variants.length + 1 }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import { ImageSize } from "@/@types/Image";
import Album from "@/components/album/AlbumIndex.vue";
import { useDialog } from "@/components/dialog/DialogStore";
import { AlbumGroup, getDisplayName } from "@/helpers/groupAlbumVariants";

const props = defineProps<{
  canDelete?: boolean;
  canSave?: boolean;
  cleanName?: boolean;
  coverSize?: ImageSize | undefined;
  exactSearch?: boolean;
  group: AlbumGroup;
  withArtists?: boolean;
  withoutMetas?: boolean;
  withoutReleaseDate?: boolean;
}>();

const dialogStore = useDialog();

const displayAlbum = computed(() => {
  return {
    ...props.group.baseAlbum,
    name: props.cleanName ? getDisplayName(props.group.baseAlbum.name) : props.group.baseAlbum.name,
  };
});

function openVariantsDialog(): void {
  dialogStore.open({
    type: "albumVariants",
    albumGroup: props.group,
  });
}
</script>

<style lang="scss" scoped>
@use "sass:color";
@use "@/assets/scss/colors" as colors;

.album-group-main {
  position: relative;
}

.album-group-stack {
  $indicator-offset: 0.5rem;
  $size: 1.5rem;

  &-layer {
    background: var(--bg-color-light);
    border: 0.1rem solid var(--bg-color-lighter);
    border-radius: 0.3rem;
    box-shadow: 0 0.2rem 0.4rem rgb(0 0 0 / 30%);
    font-size: 0.8rem;
    font-weight: bold;
    height: 1.5rem;
    position: absolute;
    transition:
      left 0.15s ease,
      top 0.15s ease;
    width: 1.5rem;

    &-1 {
      left: calc($indicator-offset - 0.3rem);
      top: calc($indicator-offset - 0.3rem);
    }

    &-2 {
      align-items: center;
      display: flex;
      justify-content: center;
      left: calc($indicator-offset - 0.3rem);
      top: calc($indicator-offset - 0.3rem);
    }
  }

  &-indicator {
    /* hidden by default; shown when hovering .album-group-main below */
    cursor: pointer;
    display: none;
    height: $size;
    left: $indicator-offset;
    position: absolute;
    top: $indicator-offset;
    width: $size;
    z-index: 10;

    &:hover .album-group-stack-layer-1 {
      left: calc($indicator-offset - -0.05rem);
      top: calc($indicator-offset - -0.05rem);
    }
  }
}

.album-group-main:hover .album-group-stack-indicator {
  display: block;
}
</style>

<style lang="scss">
// Keep Album hover styles active when hovering the group indicator
.album-group-main:hover .album {
  /* show action buttons */
  .play,
  .add,
  .delete {
    display: block !important;
  }

  /* dim the cover image */
  .img {
    opacity: 0.4 !important;
  }
}
</style>
